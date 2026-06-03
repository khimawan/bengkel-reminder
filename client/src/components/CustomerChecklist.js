import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CustomerChecklist.css';

function CustomerChecklist() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [newNote, setNewNote] = useState({ note: '', repair_items: '' });

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

  const handleAddNote = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`/api/customers/${selectedCustomer.id}/notes`, newNote);
      setShowNoteModal(false);
      setNewNote({ note: '', repair_items: '' });
      fetchCustomerDetails(selectedCustomer.id);
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const fetchCustomerDetails = async (customerId) => {
    try {
      const response = await axios.get(`/api/customers/${customerId}`);
      setSelectedCustomer(response.data);
    } catch (error) {
      console.error('Error fetching customer details:', error);
    }
  };

  const handleViewCustomer = async (customer) => {
    await fetchCustomerDetails(customer.id);
  };

  const handleCreateReminder = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const reminderData = {
      customer_id: selectedCustomer.id,
      service_note_id: parseInt(formData.get('service_note_id')),
      reminder_date: formData.get('reminder_date')
    };

    try {
      await axios.post('/api/reminders', reminderData);
      setShowReminderModal(false);
      alert('Reminder berhasil dibuat!');
    } catch (error) {
      console.error('Error creating reminder:', error);
      alert('Gagal membuat reminder');
    }
  };

  if (loading) {
    return <div className="loading">Memuat data...</div>;
  }

  return (
    <div className="customer-checklist">
      <h2>Ceklist Pelanggan</h2>
      
      <div className="checklist-layout">
        <div className="customer-list">
          <h3>Daftar Pelanggan</h3>
          {customers.length === 0 ? (
            <p className="empty-state">Belum ada pelanggan</p>
          ) : (
            <div className="customer-cards">
              {customers.map(customer => (
                <div
                  key={customer.id}
                  className={`customer-card ${selectedCustomer?.id === customer.id ? 'selected' : ''}`}
                  onClick={() => handleViewCustomer(customer)}
                >
                  <h4>{customer.name}</h4>
                  <p>{customer.vehicle_info || 'Tidak ada info kendaraan'}</p>
                  <div className="contact-info">
                    {customer.email && <span>📧 {customer.email}</span>}
                    {customer.whatsapp && <span>📱 {customer.whatsapp}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedCustomer && (
          <div className="customer-details">
            <div className="details-header">
              <h3>{selectedCustomer.name}</h3>
              <button
                className="add-note-button"
                onClick={() => setShowNoteModal(true)}
              >
                + Tambah Catatan
              </button>
            </div>

            <div className="customer-info">
              <p><strong>Email:</strong> {selectedCustomer.email || '-'}</p>
              <p><strong>WhatsApp:</strong> {selectedCustomer.whatsapp || '-'}</p>
              <p><strong>Kendaraan:</strong> {selectedCustomer.vehicle_info || '-'}</p>
            </div>

            <div className="service-notes">
              <h4>Catatan Servis</h4>
              {selectedCustomer.service_notes?.length === 0 ? (
                <p className="empty-state">Belum ada catatan servis</p>
              ) : (
                selectedCustomer.service_notes.map(note => (
                  <div key={note.id} className="note-card">
                    <p className="note-text">{note.note}</p>
                    {note.repair_items && (
                      <div className="repair-items">
                        <strong>Item yang perlu diperbaiki:</strong>
                        <ul>
                          {note.repair_items.split(',').map((item, index) => (
                            <li key={index}>{item.trim()}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="note-actions">
                      <button
                        className="create-reminder-button"
                        onClick={() => {
                          setShowReminderModal(true);
                          setSelectedNoteId(note.id);
                        }}
                      >
                        Buat Reminder
                      </button>
                    </div>
                    <small className="note-date">
                      {new Date(note.created_at).toLocaleString('id-ID')}
                    </small>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {showNoteModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Tambah Catatan Servis</h3>
            <form onSubmit={handleAddNote}>
              <div className="form-group">
                <label>Catatan</label>
                <textarea
                  value={newNote.note}
                  onChange={(e) => setNewNote({ ...newNote, note: e.target.value })}
                  required
                  rows="4"
                />
              </div>
              <div className="form-group">
                <label>Item yang perlu diperbaiki (pisahkan dengan koma)</label>
                <textarea
                  value={newNote.repair_items}
                  onChange={(e) => setNewNote({ ...newNote, repair_items: e.target.value })}
                  rows="3"
                  placeholder="Contoh: Ganti oli, Cek rem, Servis AC"
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowNoteModal(false)}>
                  Batal
                </button>
                <button type="submit">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showReminderModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Buat Reminder</h3>
            <form onSubmit={handleCreateReminder}>
              <input type="hidden" name="service_note_id" value={selectedNoteId} />
              <div className="form-group">
                <label>Tanggal dan Jam Reminder</label>
                <input
                  type="datetime-local"
                  name="reminder_date"
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowReminderModal(false)}>
                  Batal
                </button>
                <button type="submit">Buat Reminder</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerChecklist;
