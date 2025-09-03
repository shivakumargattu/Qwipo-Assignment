import React from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import CustomerList from './pages/CustomerList.jsx'
import CustomerForm from './pages/CustomerForm.jsx'
import CustomerDetail from './pages/CustomerDetail.jsx'

export default function App(){
  const nav = useNavigate()
  return (
    <div className="app">
<header className="page-header row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
  <div>
    <h2>Customer Records</h2>
    <p>Manage your customers, add new ones, and update details.</p>
  </div>

  <div className="actions">
  <button className="secondary" onClick={() => nav('/customers')}>
    📋 All Records
  </button>
  <button className="primary" onClick={() => nav('/customers/new')}>
    ➕ New Customer
  </button>
</div>
</header>
    

      

      <Routes>
        <Route path="/" element={<CustomerList/>}/>
        <Route path="/customers" element={<CustomerList/>}/>
        <Route path="/customers/new" element={<CustomerForm/>}/>
        <Route path="/customers/:id" element={<CustomerDetail/>}/>
      </Routes>

      <ToastContainer position="top-right" autoClose={2500} newestOnTop/>
    </div>
  )
}
