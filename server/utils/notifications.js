const nodemailer = require('nodemailer');
const twilio = require('twilio');

// Email transporter configuration
const createEmailTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Send email reminder
const sendEmailReminder = async (reminder) => {
  const transporter = createEmailTransporter();
  
  const repairItems = reminder.repair_items ? reminder.repair_items.split(',').map(item => item.trim()).join('\n- ') : 'Tidak ada';
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: reminder.email,
    subject: `Pengingat Servis Kendaraan - ${reminder.name}`,
    text: `Halo ${reminder.name},

Ini adalah pengingat untuk servis kendaraan Anda.

Catatan Servis:
${reminder.note}

Item yang perlu diperbaiki:
- ${repairItems}

Mohon segera hubungi bengkel kami untuk menjadwalkan servis.

Terima kasih!`
  };

  await transporter.sendMail(mailOptions);
  console.log(`Email sent to ${reminder.email}`);
};

// Send WhatsApp reminder
const sendWhatsappReminder = async (reminder) => {
  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );

  const repairItems = reminder.repair_items ? reminder.repair_items.split(',').map(item => item.trim()).join('\n- ') : 'Tidak ada';
  
  const message = `Halo ${reminder.name},\n\nIni adalah pengingat untuk servis kendaraan Anda.\n\nCatatan Servis:\n${reminder.note}\n\nItem yang perlu diperbaiki:\n- ${repairItems}\n\nMohon segera hubungi bengkel kami untuk menjadwalkan servis.\n\nTerima kasih!`;

  await client.messages.create({
    from: process.env.TWILIO_WHATSAPP_NUMBER,
    to: `whatsapp:${reminder.whatsapp}`,
    body: message
  });

  console.log(`WhatsApp sent to ${reminder.whatsapp}`);
};

module.exports = { sendEmailReminder, sendWhatsappReminder };
