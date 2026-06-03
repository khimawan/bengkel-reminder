const express = require('express');
const router = express.Router();
const { db } = require('../config/database');
const auth = require('../middleware/auth');

// Get all customers
router.get('/', auth, (req, res) => {
  db.all('SELECT * FROM customers ORDER BY created_at DESC', [], (err, customers) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    res.json(customers);
  });
});

// Get single customer with notes
router.get('/:id', auth, (req, res) => {
  const customerId = req.params.id;
  
  db.get('SELECT * FROM customers WHERE id = ?', [customerId], (err, customer) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Get service notes for this customer
    db.all('SELECT * FROM service_notes WHERE customer_id = ? ORDER BY created_at DESC', 
      [customerId], (err, notes) => {
        if (err) {
          return res.status(500).json({ message: 'Database error' });
        }
        
        customer.service_notes = notes;
        res.json(customer);
      });
  });
});

// Add customer
router.post('/', auth, (req, res) => {
  const { name, email, whatsapp, vehicle_info } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Name is required' });
  }

  const sql = 'INSERT INTO customers (name, email, whatsapp, vehicle_info) VALUES (?, ?, ?, ?)';
  const params = [name, email || null, whatsapp || null, vehicle_info || null];

  db.run(sql, params, function(err) {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    res.status(201).json({
      id: this.lastID,
      name,
      email,
      whatsapp,
      vehicle_info
    });
  });
});

// Update customer
router.put('/:id', auth, (req, res) => {
  const customerId = req.params.id;
  const { name, email, whatsapp, vehicle_info } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Name is required' });
  }

  const sql = 'UPDATE customers SET name = ?, email = ?, whatsapp = ?, vehicle_info = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
  const params = [name, email || null, whatsapp || null, vehicle_info || null, customerId];

  db.run(sql, params, function(err) {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json({ message: 'Customer updated successfully' });
  });
});

// Delete customer
router.delete('/:id', auth, (req, res) => {
  const customerId = req.params.id;

  db.run('DELETE FROM customers WHERE id = ?', [customerId], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json({ message: 'Customer deleted successfully' });
  });
});

// Add service note to customer
router.post('/:id/notes', auth, (req, res) => {
  const customerId = req.params.id;
  const { note, repair_items } = req.body;

  if (!note) {
    return res.status(400).json({ message: 'Note is required' });
  }

  const sql = 'INSERT INTO service_notes (customer_id, note, repair_items) VALUES (?, ?, ?)';
  const params = [customerId, note, repair_items || null];

  db.run(sql, params, function(err) {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    res.status(201).json({
      id: this.lastID,
      customer_id: customerId,
      note,
      repair_items
    });
  });
});

// Get service notes for customer
router.get('/:id/notes', auth, (req, res) => {
  const customerId = req.params.id;
  
  db.all('SELECT * FROM service_notes WHERE customer_id = ? ORDER BY created_at DESC', 
    [customerId], (err, notes) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }
      res.json(notes);
    });
});

module.exports = router;
