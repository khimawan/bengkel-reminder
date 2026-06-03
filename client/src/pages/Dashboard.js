import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import CustomerChecklist from '../components/CustomerChecklist';
import CustomerManagement from '../components/CustomerManagement';
import UpcomingReminders from '../components/UpcomingReminders';
import './Dashboard.css';

function Dashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('checklist');

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Bengkel Reminder</h1>
        <div className="header-actions">
          <span className="user-info">Selamat datang, {user?.username}</span>
          <button onClick={logout} className="logout-button">Keluar</button>
        </div>
      </header>

      <nav className="dashboard-nav">
        <button
          className={`nav-tab ${activeTab === 'checklist' ? 'active' : ''}`}
          onClick={() => setActiveTab('checklist')}
        >
          Ceklist Pelanggan
        </button>
        <button
          className={`nav-tab ${activeTab === 'management' ? 'active' : ''}`}
          onClick={() => setActiveTab('management')}
        >
          Kelola Pelanggan
        </button>
        <button
          className={`nav-tab ${activeTab === 'reminders' ? 'active' : ''}`}
          onClick={() => setActiveTab('reminders')}
        >
          Reminder Terdekat
        </button>
      </nav>

      <main className="dashboard-content">
        {activeTab === 'checklist' && <CustomerChecklist />}
        {activeTab === 'management' && <CustomerManagement />}
        {activeTab === 'reminders' && <UpcomingReminders />}
      </main>
    </div>
  );
}

export default Dashboard;
