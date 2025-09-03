import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import db from "./db.js";
import { z } from 'zod';
import winston from 'winston';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const logger = winston.createLogger({
  level: 'error',
  transports: [
    new winston.transports.File({ filename: 'errors.log' }),
    new winston.transports.Console()
  ]
});

// validation
const customerSchema = z.object({
  first_name: z.string().min(1),
  last_name:  z.string().min(1),
  phone:      z.string().min(7),
  email: z.string().email().optional().or(z.literal('').transform(() => undefined)),
  account_type: z.string().optional()
});
const customerUpdateSchema = customerSchema.partial();
const addressSchema = z.object({
  line1: z.string().min(1),
  line2: z.string().optional(),
  city:  z.string().min(1),
  state: z.string().min(1),
  pin_code: z.string().min(4),
  country: z.string().optional().default('India')
});

function paginate({ page = 1, limit = 10 }) {
  page = Math.max(parseInt(page) || 1, 1);
  limit = Math.min(Math.max(parseInt(limit) || 10, 1), 100);
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

// create customer
app.post('/api/customers', (req, res, next) => {
  try {
    const c = customerSchema.parse(req.body);
    const stmt = db.prepare(`INSERT INTO customers (first_name,last_name,phone,email,account_type) VALUES (?,?,?,?,?)`);
    const r = stmt.run(c.first_name, c.last_name, c.phone, c.email, c.account_type);
    res.status(201).json({ id: r.lastInsertRowid, message: 'Customer created' });
  } catch (e) { next(e); }
});

// list customers with filters/sort/paging
app.get('/api/customers', (req, res, next) => {
  try {
    const { page, limit, offset } = paginate(req.query);
    const { city, state, pin, q, sortBy = 'created_at', sortOrder = 'desc' } = req.query;

    const validSort = ['first_name','last_name','phone','created_at'];
    const orderBy = validSort.includes(sortBy) ? sortBy : 'created_at';
    const order = (String(sortOrder).toLowerCase() === 'asc') ? 'ASC' : 'DESC';

    let where = [];
    let params = {};
    if (city) where.push('EXISTS (SELECT 1 FROM addresses a WHERE a.customer_id = c.id AND a.city LIKE @city)'), params.city = `%${city}%`;
    if (state) where.push('EXISTS (SELECT 1 FROM addresses a WHERE a.customer_id = c.id AND a.state LIKE @state)'), params.state = `%${state}%`;
    if (pin) where.push('EXISTS (SELECT 1 FROM addresses a WHERE a.customer_id = c.id AND a.pin_code LIKE @pin)'), params.pin = `%${pin}%`;
    if (q) where.push('(c.first_name LIKE @q OR c.last_name LIKE @q OR c.phone LIKE @q OR IFNULL(c.email,"") LIKE @q)'), params.q = `%${q}%`;

    const whereSql = where.length ? ('WHERE ' + where.join(' AND ')) : '';
    const total = db.prepare(`SELECT COUNT(*) AS cnt FROM customers c ${whereSql}`).get(params).cnt;

    const rows = db.prepare(`
      SELECT c.*,
        (SELECT COUNT(*) FROM addresses a WHERE a.customer_id = c.id) as address_count
      FROM customers c
      ${whereSql}
      ORDER BY ${orderBy} ${order}
      LIMIT @limit OFFSET @offset
    `).all({ ...params, limit, offset });

    res.json({ page, limit, total, rows });
  } catch (e) { next(e); }
});

// server runing 
app.get("/", (req, res) => {
  res.send("Customer API is running 🚀");
});
// get single
app.get('/api/customers/:id', (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const cust = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
    if (!cust) return res.status(404).json({ message: 'Not found' });
    const addresses = db.prepare('SELECT * FROM addresses WHERE customer_id = ? ORDER BY created_at DESC').all(id);
    res.json({ ...cust, addresses });
  } catch (e) { next(e); }
});

// update
app.put('/api/customers/:id', (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const upd = customerUpdateSchema.parse(req.body);
    const existing = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ message: 'Not found' });
    const m = { ...existing, ...upd };
    db.prepare(`UPDATE customers SET first_name=?, last_name=?, phone=?, email=?, account_type=? WHERE id=?`)
      .run(m.first_name, m.last_name, m.phone, m.email, m.account_type, id);
    res.json({ id, message: 'Customer updated' });
  } catch (e) { next(e); }
});

// delete (blocks if has addresses)
app.delete('/api/customers/:id', (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const cnt = db.prepare('SELECT COUNT(*) AS cnt FROM addresses WHERE customer_id = ?').get(id).cnt;
    if (cnt > 0) return res.status(400).json({ message: 'Cannot delete: linked addresses exist' });
    const info = db.prepare('DELETE FROM customers WHERE id = ?').run(id);
    if (info.changes === 0) return res.status(404).json({ message: 'Not found' });
    res.json({ id, message: 'Customer deleted' });
  } catch (e) { next(e); }
});

// add address
app.post('/api/customers/:id/addresses', (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const cust = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
    if (!cust) return res.status(404).json({ message: 'Customer not found' });
    const a = addressSchema.parse(req.body);
    const r = db.prepare(`
      INSERT INTO addresses (customer_id,line1,line2,city,state,pin_code,country)
      VALUES (@customer_id,@line1,@line2,@city,@state,@pin_code,@country)
    `).run({ customer_id: id, ...a });
    res.status(201).json({ id: r.lastInsertRowid, message: 'Address added' });
  } catch (e) { next(e); }
});

// update address
app.put('/api/addresses/:addrId', (req, res, next) => {
  try {
    const addrId = Number(req.params.addrId);
    const upd = addressSchema.partial().parse(req.body);
    const existing = db.prepare('SELECT * FROM addresses WHERE id = ?').get(addrId);
    if (!existing) return res.status(404).json({ message: 'Address not found' });
    const m = { ...existing, ...upd };
    db.prepare(`UPDATE addresses SET line1=?, line2=?, city=?, state=?, pin_code=?, country=?, is_active=? WHERE id=?`)
      .run(m.line1, m.line2, m.city, m.state, m.pin_code, m.country, m.is_active, addrId);
    res.json({ id: addrId, message: 'Address updated' });
  } catch (e) { next(e); }
});

// delete address
app.delete('/api/addresses/:addrId', (req, res, next) => {
  try {
    const addrId = Number(req.params.addrId);
    const info = db.prepare('DELETE FROM addresses WHERE id = ?').run(addrId);
    if (info.changes === 0) return res.status(404).json({ message: 'Address not found' });
    res.json({ id: addrId, message: 'Address deleted' });
  } catch (e) { next(e); }
});

// mark single address (must have exactly 1)
app.patch('/api/customers/:id/mark-single-address', (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const count = db.prepare('SELECT COUNT(*) AS cnt FROM addresses WHERE customer_id = ?').get(id).cnt;
    if (count !== 1) return res.status(400).json({ message: 'Invalid: customer must have exactly one address' });
    db.prepare('UPDATE customers SET has_single_address = 1 WHERE id = ?').run(id);
    res.json({ id, message: 'Flag set: Only One Address' });
  } catch (e) { next(e); }
});

// customers with multiple addresses
app.get('/api/customers-with-multiple-addresses', (req, res, next) => {
  try {
    const rows = db.prepare(`
      SELECT c.id, c.first_name, c.last_name, COUNT(a.id) AS address_count
      FROM customers c JOIN addresses a ON a.customer_id = c.id
      GROUP BY c.id
      HAVING address_count > 1
      ORDER BY address_count DESC
    `).all();
    res.json(rows);
  } catch (e) { next(e); }
});

// error handler
app.use((err, req, res, next) => {
  const message = err?.issues ? err.issues.map(i => i.message).join(', ') : err.message || 'Unknown error';
  logger.error(message);
  res.status(400).json({ message });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log('API http://localhost:' + PORT));
