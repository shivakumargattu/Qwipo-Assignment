import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api.js'
import { toast } from 'react-toastify'

const emptyAddr = { line1:'', line2:'', city:'', state:'', pin_code:'', country:'India' }

export default function CustomerDetail(){
  const { id } = useParams()
  const nav = useNavigate()
  const [data, setData] = React.useState(null)
  const [addr, setAddr] = React.useState(emptyAddr)
  const [editingAddrId, setEditingAddrId] = React.useState(null)

  const load = ()=> api.getCustomer(id).then(setData).catch(()=>{})
  React.useEffect(load, [id])

  const del = async ()=>{
    if(!confirm('Delete this customer?')) return
    try{ await api.deleteCustomer(id); toast.success('Deleted'); nav('/customers') }catch{}
  }

  const submitAddr = async e => {
    e.preventDefault()
    if(!addr.line1 || !addr.city || !addr.state || !addr.pin_code){ toast.warn('Line 1, City, State, PIN are required'); return }
    try{
      if(editingAddrId){ await api.updateAddress(editingAddrId, addr); toast.success('Address updated') }
      else { await api.addAddress(id, addr); toast.success('Address added') }
      setAddr(emptyAddr); setEditingAddrId(null); load()
    }catch{}
  }

  const editAddr = a => { setAddr(a); setEditingAddrId(a.id) }
  const deleteAddr = async addrId => { if(!confirm('Delete this address?')) return; try{ await api.deleteAddress(addrId); toast.success('Address deleted'); load() }catch{} }
  const markSingle = async ()=>{ try{ await api.markSingleAddress(id); toast.success('Flag set'); load() }catch{} }

  if(!data) return <div className="card">Loading...</div>

  return (
    <div className="card">
      <div className="row" style={{alignItems:'center', justifyContent:'space-between'}}>
        <h3>Customer #{data.id}: {data.first_name} {data.last_name}</h3>
        <div className="actions">
          <button onClick={()=>nav(`/customers/${id}/edit`)}>Edit</button>
          <button onClick={del}>Delete</button>
        </div>
      </div>

      <div className="row">
        <div className="card" style={{flex:1}}>
          <h4>Details</h4>
          <p><b>Phone:</b> {data.phone}</p>
          <p><b>Email:</b> {data.email || '-'}</p>
          <p><b>Account Type:</b> {data.account_type || '-'}</p>
          <p><b>Only One Address:</b> {data.has_single_address ? 'Yes':'No'}</p>
          <button onClick={markSingle}>Mark "Only One Address"</button>
        </div>

        <div className="card" style={{flex:2}}>
          <h4>Addresses ({data.addresses?.length || 0})</h4>
          <table>
            <thead><tr><th>Line 1</th><th>City</th><th>State</th><th>PIN</th><th></th></tr></thead>
            <tbody>
              {(data.addresses||[]).map(a=>(
                <tr key={a.id}>
                  <td>{a.line1}</td><td>{a.city}</td><td>{a.state}</td><td>{a.pin_code}</td>
                  <td className="actions">
                    <button onClick={()=>editAddr(a)}>Edit</button>
                    <button onClick={()=>deleteAddr(a.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <form onSubmit={submitAddr} style={{marginTop:12}}>
            <div className="row">
              <input placeholder="Line 1 *" value={addr.line1} onChange={e=>setAddr(a=>({...a, line1:e.target.value}))}/>
              <input placeholder="Line 2"   value={addr.line2||''} onChange={e=>setAddr(a=>({...a, line2:e.target.value}))}/>
            </div>
            <div className="row">
              <input placeholder="City *"  value={addr.city} onChange={e=>setAddr(a=>({...a, city:e.target.value}))}/>
              <input placeholder="State *" value={addr.state} onChange={e=>setAddr(a=>({...a, state:e.target.value}))}/>
              <input placeholder="PIN *"   value={addr.pin_code} onChange={e=>setAddr(a=>({...a, pin_code:e.target.value}))}/>
            </div>
            <div className="actions">
              <button className="primary" type="submit">{editingAddrId ? 'Save Address':'Add Address'}</button>
              {editingAddrId && <button onClick={e=>{e.preventDefault(); setAddr(emptyAddr); setEditingAddrId(null)}}>Cancel</button>}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
