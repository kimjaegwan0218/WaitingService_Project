import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Ticket from './pages/Ticket';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminDisplay from './pages/AdminDisplay';

function App() {
  return (
    <BrowserRouter>
      <nav style={{ display: "flex", gap: 12, padding: 12, borderBottom: "1px solid #eee" }}>
        <Link to="/">손님</Link>
        <Link to="/admin/login">관리자</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/ticket/:id" element={<Ticket />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/display" element={<AdminDisplay />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
