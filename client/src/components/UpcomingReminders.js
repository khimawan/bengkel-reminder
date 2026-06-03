import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import './UpcomingReminders.css';

function UpcomingReminders() {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSendModal, setShowSendModal] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState(null);
  const [selectedChannels, setSelectedChannels] = useState([]);

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      const response = await axios.get('/api/reminders/upcoming');
      setReminders(response.data);
    } catch (error) {
      console.error('Error fetching reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendNow = (reminder) => {
    setSelectedReminder(reminder);
    const channels = [];
    if (reminder.email && !reminder.sent_email) channels.push('email');
    if (reminder.whatsapp && !reminder.sent_whatsapp) channels.push('whatsapp');
    setSelectedChannels(channels);
    setShowSendModal(true);
  };

  const handleConfirmSend = async () => {
    try {
      await axios.post(`/api/reminders/${selectedReminder.id}/send-now`, {
        channels: selectedChannels
      });
      setShowSendModal(false);
      setSelectedReminder(null);
      setSelectedChannels([]);
      fetchReminders();
      alert('Reminder berhasil dikirim!');
    } catch (error) {
      console.error('Error sending reminder:', error);
      alert('Gagal mengirim reminder');
    }
  };

  const handleDeleteReminder = async (reminderId) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus reminder ini?')) {
      return;
    }

    try {
      await axios.delete(`/api/reminders/${reminderId}`);
      fetchReminders();
      alert('Reminder berhasil dihapus!');
    } catch (error) {
      console.error('Error deleting reminder:', error);
      alert('Gagal menghapus reminder');
    }
  };

  const toggleChannel = (channel) => {
    if (selectedChannels.includes(channel)) {
      setSelectedChannels(selectedChannels.filter(c => c !== channel));
    } else {
      setSelectedChannels([...selectedChannels, channel]);
    }
  };

  if (loading) {
    return <div className="loading">Memuat data...</div>;
  }

  return (
    <div className="upcoming-reminders">
      <h2>Reminder Terdekat</h2>

      {reminders.length === 0 ? (
        <div className="empty-state">
          <p>Tidak ada reminder yang akan datang dalam 7 hari ke depan.</p>
        </div>
      ) : (
        <div className="reminder-list">
          {reminders.map(reminder => (
            <div key={reminder.id} className="reminder-card">
              <div className="reminder-header">
                <h3>{reminder.customer_name}</h3>
                <span className={`status-badge ${reminder.status}`}>
                  {reminder.status === 'pending' ? 'Pending' : 'Terkirim'}
                </span>
              </div>

              <div className="reminder-details">
                <div className="reminder-date">
                  <strong>Jadwal:</strong>{' '}
                  {format(new Date(reminder.reminder_date), 'dd MMMM yyyy HH:mm', { locale: id })}
                </div>

                <div className="reminder-note">
                  <strong>Catatan:</strong> {reminder.note}
                </div>

                {reminder.repair_items && (
                  <div className="reminder-items">
                    <strong>Item yang perlu diperbaiki:</strong>
                    <ul>
                      {reminder.repair_items.split(',').map((item, index) => (
                        <li key={index}>{item.trim()}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="reminder-channels">
                  <div className={`channel ${reminder.sent_email ? 'sent' : 'pending'}`}>
                    📧 Email: {reminder.sent_email ? 'Terkirim' : 'Belum'}
                  </div>
                  <div className={`channel ${reminder.sent_whatsapp ? 'sent' : 'pending'}`}>
                    📱 WhatsApp: {reminder.sent_whatsapp ? 'Terkirim' : 'Belum'}
                  </div>
                </div>
              </div>

              <div className="reminder-actions">
                {reminder.status === 'pending' && (
                  <button
                    className="send-now-button"
                    onClick={() => handleSendNow(reminder)}
                  >
                    Kirim Sekarang
                  </button>
                )}
                <button
                  className="delete-reminder-button"
                  onClick={() => handleDeleteReminder(reminder.id)}
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showSendModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Kirim Reminder Sekarang</h3>
            <p>Pilih channel untuk mengirim reminder:</p>
            
            <div className="channel-checkboxes">
              {selectedReminder?.email && !selectedReminder.sent_email && (
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedChannels.includes('email')}
                    onChange={() => toggleChannel('email')}
                  />
                  <span>Email ({selectedReminder.email})</span>
                </label>
              )}
              
              {selectedReminder?.whatsapp && !selectedReminder.sent_whatsapp && (
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedChannels.includes('whatsapp')}
                    onChange={() => toggleChannel('whatsapp')}
                  />
                  <span>WhatsApp ({selectedReminder.whatsapp})</span>
                </label>
              )}
            </div>

            <div className="modal-actions">
              <button onClick={() => setShowSendModal(false)}>
                Batal
              </button>
              <button
                onClick={handleConfirmSend}
                disabled={selectedChannels.length === 0}
              >
                Kirim
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UpcomingReminders;
