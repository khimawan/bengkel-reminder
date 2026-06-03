const cron = require('node-cron');
const { db } = require('../config/database');
const { sendEmailReminder, sendWhatsappReminder } = require('./notifications');

const startReminderScheduler = () => {
  // Run every minute to check for due reminders
  cron.schedule('* * * * *', async () => {
    console.log('Checking for due reminders...');
    
    const sql = `SELECT r.*, c.name, c.email, c.whatsapp, s.note, s.repair_items 
                 FROM reminders r 
                 JOIN customers c ON r.customer_id = c.id 
                 JOIN service_notes s ON r.service_note_id = s.id 
                 WHERE r.status = 'pending' 
                 AND r.reminder_date <= datetime('now')`;
    
    db.all(sql, [], async (err, reminders) => {
      if (err) {
        console.error('Error fetching due reminders:', err);
        return;
      }

      if (reminders.length === 0) {
        return;
      }

      console.log(`Found ${reminders.length} due reminders`);

      for (const reminder of reminders) {
        try {
          // Send email if configured and not already sent
          if (reminder.email && !reminder.sent_email && process.env.EMAIL_USER) {
            try {
              await sendEmailReminder(reminder);
              db.run('UPDATE reminders SET sent_email = 1 WHERE id = ?', [reminder.id]);
              console.log(`Email sent for reminder ${reminder.id}`);
            } catch (error) {
              console.error(`Error sending email for reminder ${reminder.id}:`, error.message);
            }
          }

          // Send WhatsApp if configured and not already sent
          if (reminder.whatsapp && !reminder.sent_whatsapp && process.env.TWILIO_ACCOUNT_SID) {
            try {
              await sendWhatsappReminder(reminder);
              db.run('UPDATE reminders SET sent_whatsapp = 1 WHERE id = ?', [reminder.id]);
              console.log(`WhatsApp sent for reminder ${reminder.id}`);
            } catch (error) {
              console.error(`Error sending WhatsApp for reminder ${reminder.id}:`, error.message);
            }
          }

          // Update status if at least one channel was sent
          if (reminder.sent_email || reminder.sent_whatsapp) {
            db.run('UPDATE reminders SET status = ? WHERE id = ?', ['sent', reminder.id]);
          }
        } catch (error) {
          console.error(`Error processing reminder ${reminder.id}:`, error.message);
        }
      }
    });
  });

  console.log('Reminder scheduler started');
};

module.exports = { startReminderScheduler };
