import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CustomerManagement.css';

function CustomerManagement() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
    vehicle_info: ''
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get('/api/customers');
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/customers', formData);
      setShowAddModal(false);
      setFormData({ name: '', email: '', whatsapp: '', vehicle_info: '' });
      fetchCustomers();
      alert('Pelanggan berhasil ditambahkan!');
    } catch (error) {
      console.error('Error adding customer:', error);
      alert('Gagal menambahkan pelanggan');
    }
  };

  const handleEditCustomer = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/customers/${editingCustomer.id}`, formData);
      setShowEditModal(false);
      setEditingCustomer(null);
      setFormData({ name: '', email: '', whatsapp: '', vehicle_info: '' });
      fetchCustomers();
      alert('Pelanggan berhasil diperbarui!');
    } catch (error) {
      console.error('Error updating customer:', error);
      alert('Gagal memperbarui pelanggan');
    }
  };

  const handleDeleteCustomer = async (customerId) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus pelanggan ini?')) {
      return;
    }

    try {
      await axios.delete(`/api/customers/${customerId}`);
      fetchCustomers();
      alert('Pelanggan berhasil dihapus!');
    } catch (error) {
      console.error('Error deleting customer:', error);
      alert('Gagal menghapus pelanggan');
    }
  };

  const openEditModal = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email || '',
      whatsapp: customer.whatsapp || '',
      vehicle_info: customer.vehicle_info || ''
    });
    setShowEditModal(true);
  };

  if (loading) {
    return <div className="loading">Memuat data...</div>;
  }

  return (
    <div className="customer-management">
      <div className="management-header">
        <h2>Kelola Pelanggan</h2>
        <button
          className="add-customer-button"
          onClick={() => setShowAddModal(true)}
        >
          + Tambah Pelanggan
        </button>
      </div>

      {customers.length === 0 ? (
        <div className="empty-state">
          <p>Belum ada pelanggan. Silakan tambahkan pelanggan baru.</p>
        </div>
      ) : (
        <div className="customer-table-container">
          <table className="customer-table">
            <thead>
              <tr>
                <th>Nama</th>
                <th>Email</th>
                <th>WhatsApp</th>
                <th>Info Kendaraan</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(customer => (
                <tr key={customer.id}>
                  <td>{customer.name}</td>
                  <td>{customer.email || '-'}</td>
                  <td>{customer.whatsapp || '-'}</td>
                  <td>{customer.vehicle_info || '-'}</td>
                  <td>
                    <button
                      className="edit-button"
                      onClick={() => openEditModal(customer)}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-button"
                      onClick={() => handleDeleteCustomer(customer.id)}
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAddModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Tambah Pelanggan Baru</h3>
            <form onSubmit={handleAddCustomer}>
              <div className="form-group">
                <label>Nama *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>WhatsApp</label>
                <input
                  type="text"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  placeholder="Contoh: 628123456789"
                />
              </div>
              <div className="form-group">
                <label>Info Kendaraan</label>
                <input
                  type="text"
                  value={formData.vehicle_info}
                  onChange={(e) => setFormData({ ...formData, vehicle_info: e.target.value })}
                  placeholder="Contoh: Toyota Avanza 2019"
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowAddModal(false)}>
                  Batal
                </button>
                <button type="submit">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Edit Pelanggan</h3>
            <form onSubmit={handleEditCustomer}>
              <div className="form-group">
                <label>Nama *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>WhatsApp</label>
                <input
                  type="text"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  placeholder="Contoh: 628123456789"
                />
              </div>
              <div className="form-group">
                <label>Info Kendaraan</label>
                <input
                  type="text"
                  value={formData.vehicle_info}
                  onChange={(e) => setFormData({ ...formData, vehicle_info: e.target.value })}
                  placeholder="Contoh: Toyota Avanza 2019"
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowEditModal(false)}>
                  Batal
                </button>
                <button type="submit">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerManagement;
