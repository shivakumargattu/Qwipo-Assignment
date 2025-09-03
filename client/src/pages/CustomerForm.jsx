import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api.js'
import { toast } from 'react-toastify'

const empty = { first_name:'', last_name:'', phone:'', email:'', account_type:'' }

export default function CustomerForm(){
  const { id } = useParams()
  const editing = Boolean(id)
  const [form, setForm] = React.useState(empty)
  const nav = useNavigate()

  React.useEffect(()=>{
    if(editing) api.getCustomer(id).then(c=> setForm({ ...empty, ...c })).catch(()=>{})
  }, [id])

  const set = k => e => setForm(f=>({ ...f, [k]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    if(!form.first_name || !form.last_name || !form.phone){ toast.warn('First, Last, Phone are required'); return }
    try{
      if(editing){ await api.updateCustomer(id, form); toast.success('Customer updated'); nav(`/customers/${id}`) }
      else { const res = await api.createCustomer(form); toast.success('Customer created'); nav(`/customers/${res.id}`) }
    }catch{}
  }

  return (
    <form className="card" onSubmit={submit}>
      <h3>{editing ? 'Edit' : 'New'} Customer</h3>
      <div className="row">
        <input placeholder="First Name *" value={form.first_name} onChange={set('first_name')}/>
        <input placeholder="Last Name *"  value={form.last_name}  onChange={set('last_name')}/>
      </div>
      <div className="row">
        <input placeholder="Phone *" value={form.phone} onChange={set('phone')}/>
        <input placeholder="Email"    value={form.email||''} onChange={set('email')}/>
      </div>
      <div className="row">
        <input placeholder="Account Type" value={form.account_type||''} onChange={set('account_type')}/>
      </div>
      <div className="actions"><button className="primary" type="submit">{editing ? 'Save' : 'Create'}</button></div>
    </form>
  )
}
