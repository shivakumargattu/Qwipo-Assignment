import { toast } from 'react-toastify'
const API = import.meta.env.VITE_API_URL || 'http://localhost:4000'

async function request(path, options={}){
  const url = `${API}${path}`
  try{
    const res = await fetch(url, { headers:{'Content-Type':'application/json', ...(options.headers||{})}, ...options })
    const data = await res.json().catch(()=> ({}))
    if(!res.ok){
      const msg = data?.message || 'Request failed'
      toast.error(msg)
      throw new Error(msg)
    }
    return data
  }catch(err){
    if(!options.silent) toast.error(err.message || 'Network error')
    throw err
  }
}

export const api = {
  listCustomers:(params={})=>{
    const qs = new URLSearchParams(params).toString()
    return request(`/api/customers${qs?`?${qs}`:''}`)
  },
  createCustomer:(payload)=>request(`/api/customers`,{method:'POST', body:JSON.stringify(payload)}),
  getCustomer:(id)=>request(`/api/customers/${id}`),
  updateCustomer:(id,payload)=>request(`/api/customers/${id}`,{method:'PUT', body:JSON.stringify(payload)}),
  deleteCustomer:(id)=>request(`/api/customers/${id}`,{method:'DELETE'}),
  addAddress:(id,payload)=>request(`/api/customers/${id}/addresses`,{method:'POST', body:JSON.stringify(payload)}),
  updateAddress:(addrId,payload)=>request(`/api/addresses/${addrId}`,{method:'PUT', body:JSON.stringify(payload)}),
  deleteAddress:(addrId)=>request(`/api/addresses/${addrId}`,{method:'DELETE'}),
  multiAddressList:()=>request(`/api/customers-with-multiple-addresses`),
  markSingleAddress:(id)=>request(`/api/customers/${id}/mark-single-address`,{method:'PATCH'})
}
