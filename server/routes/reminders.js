const express = require('express');
const router = express.Router();
const { db } = require('../config/database');
const auth = require('../middleware/auth');
const { sendEmailReminder, sendWhatsappReminder } = require('../utils/notifications');

// Get all reminders
router.get('/', auth, (req, res) => {
  db.all(`SELECT r.*, c.name as customer_name, c.email, c.whatsapp, s.note, s.repair_items 
          FROM reminders r 
          JOIN customers c ON r.customer_id = c.id 
          JOIN service_notes s ON r.service_note_id = s.id 
          ORDER BY r.reminder_date ASC`, [], (err, reminders) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    res.json(reminders);
  });
});

// Get upcoming reminders (next 7 days)
router.get('/upcoming', auth, (req, res) => {
  const sql = `SELECT r.*, c.name as customer_name, c.email, c.whatsapp, s.note, s.repair_items 
               FROM reminders r 
               JOIN customers c ON r.customer_id = c.id 
               JOIN service_notes s ON r.service_note_id = s.id 
               WHERE r.status = 'pending' 
               AND r.reminder_date >= datetime('now')
               AND r.reminder_date <= datetime('now', '+7 days')
               ORDER BY r.reminder_date ASC`;
  
  db.all(sql, [], (err, reminders) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    res.json(reminders);
  });
});

// Create reminder
router.post('/', auth, (req, res) => {
  const { customer_id, service_note_id, reminder_date } = req.body;

  if (!customer_id || !service_note_id || !reminder_date) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const sql = 'INSERT INTO reminders (customer_id, service_note_id, reminder_date) VALUES (?, ?, ?)';
  const params = [customer_id, service_note_id, reminder_date];

  db.run(sql, params, function(err) {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    res.status(201).json({
      id: this.lastID,
      customer_id,
      service_note_id,
      reminder_date,
      status: 'pending'
    });
  });
});

// Send reminder immediately
router.post('/:id/send-now', auth, async (req, res) => {
  const reminderId = req.params.id;
  const { channels } = req.body; // ['email', 'whatsapp'] or one of them

  try {
    // Get reminder details
    db.get(`SELECT r.*, c.name, c.email, c.whatsapp, s.note, s.repair_items 
            FROM reminders r 
            JOIN customers c ON r.customer_id = c.id 
            JOIN service_notes s ON r.service_note_id = s.id 
            WHERE r.id = ?`, [reminderId], async (err, reminder) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }

      if (!reminder) {
        return res.status(404).json({ message: 'Reminder not found' });
      }

      const results = {
        email: { sent: false, message: '' },
        whatsapp: { sent: false, message: '' }
      };

      // Send email if requested and not already sent
      if (channels.includes('email') && reminder.email && !reminder.sent_email) {
        try {
          await sendEmailReminder(reminder);
          results.email.sent = true;
          results.email.message = 'Email sent successfully';
          
          db.run('UPDATE reminders SET sent_email = 1 WHERE id = ?', [reminderId]);
        } catch (error) {
          results.email.message = error.message;
        }
      }

      // Send WhatsApp if requested and not already sent
      if (channels.includes('whatsapp') && reminder.whatsapp && !reminder.sent_whatsapp) {
        try {
          await sendWhatsappReminder(reminder);
          results.whatsapp.sent = true;
          results.whatsapp.message = 'WhatsApp sent successfully';
          
          db.run('UPDATE reminders SET sent_whatsapp = 1 WHERE id = ?', [reminderId]);
        } catch (error) {
          results.whatsapp.message = error.message;
        }
      }

      // Update status if all channels sent
      if (results.email.sent || results.whatsapp.sent) {
        db.run('UPDATE reminders SET status = ? WHERE id = ?', ['sent', reminderId]);
      }

      res.json(results);
    });
  } catch (error) {
    res.status(500).json({ message: 'Error sending reminder' });
  }
});

// Delete reminder
router.delete('/:id', auth, (req, res) => {
  const reminderId = req.params.id;

  db.run('DELETE FROM reminders WHERE id = ?', [reminderId], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    res.json({ message: 'Reminder deleted successfully' });
  });
});

module.exports = router;
