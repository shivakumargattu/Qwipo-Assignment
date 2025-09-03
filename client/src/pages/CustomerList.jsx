import React from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../api.js'
import { toast } from 'react-toastify'

export default function CustomerList(){
  const [data, setData] = React.useState({ rows:[], total:0, page:1, limit:10 })
  const [params, setParams] = useSearchParams()

  const page = Number(params.get('page')||1)
  const limit = Number(params.get('limit')||10)
  const q = params.get('q')||''; const city = params.get('city')||''; const state = params.get('state')||''; const pin = params.get('pin')||''
  const sortBy = params.get('sortBy')||'created_at'; const sortOrder = params.get('sortOrder')||'desc'

  React.useEffect(()=>{
    api.listCustomers({ page, limit, q, city, state, pin, sortBy, sortOrder })
      .then(setData).catch(()=>{})
  }, [page, limit, q, city, state, pin, sortBy, sortOrder])

  const setParam=(k,v)=>{ const copy=new URLSearchParams(params); if(!v) copy.delete(k); else copy.set(k,v); setParams(copy) }
  const clearFilters=()=>{ setParams(new URLSearchParams({ page:'1', limit:String(limit) })); toast.info('Filters cleared') }

  return (
    <div className="card">
      <div className="row">
        <input placeholder="Search name/email/phone..." value={q} onChange={e=>setParam('q',e.target.value)}/>
        <input placeholder="City" value={city} onChange={e=>setParam('city',e.target.value)}/>
        <input placeholder="State" value={state} onChange={e=>setParam('state',e.target.value)}/>
        <input placeholder="PIN" value={pin} onChange={e=>setParam('pin',e.target.value)}/>
        <select value={sortBy} onChange={e=>setParam('sortBy',e.target.value)}>
          <option value="created_at">Sort by Created</option>
          <option value="first_name">First Name</option>
          <option value="last_name">Last Name</option>
          <option value="phone">Phone</option>
        </select>
        <select value={sortOrder} onChange={e=>setParam('sortOrder',e.target.value)}>
          <option value="desc">Desc</option><option value="asc">Asc</option>
        </select>
        <button onClick={clearFilters}>Clear Filters</button>
      </div>

      <table>
        <thead><tr><th>ID</th><th>Name</th><th>Phone</th><th>Addresses</th><th>Only One?</th><th></th></tr></thead>
        <tbody>
          {data.rows.map(c=>(
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{c.first_name} {c.last_name}</td>
              <td>{c.phone}</td>
              <td><span className="badge">{c.address_count}</span></td>
              <td>{c.has_single_address ? 'Yes':'No'}</td>
              <td><Link to={`/customers/${c.id}`}>Open</Link></td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="actions" style={{justifyContent:'space-between', marginTop:12}}>
        <button disabled={page<=1} onClick={()=>setParam('page',String(Math.max(1,page-1)))}>Prev</button>
        <div>Page {data.page} / {Math.max(1, Math.ceil(data.total / data.limit))}</div>
        <button disabled={(data.page*data.limit)>=data.total} onClick={()=>setParam('page',String(page+1))}>Next</button>
      </div>
    </div>
  )
}
