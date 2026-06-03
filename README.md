# Bengkel Reminder - Vehicle Service Reminder System

A web application for workshops to manage customer vehicle service reminders via email and WhatsApp.

## Features

- **Authentication System**: Secure login with username and password
- **Customer Management**: Add, remove, and manage customer information
- **Service Notes**: Add notes and repair lists for each customer
- **Reminder System**: Schedule reminders with date and time
- **Multi-channel Notifications**: Send reminders via email and WhatsApp
- **Immediate Send**: Send reminders instantly without waiting for scheduled time
- **Dashboard**: Overview of customers, reminders, and management tools

## Tech Stack

- **Frontend**: React.js
- **Backend**: Node.js with Express
- **Database**: SQLite3
- **Email**: Nodemailer
- **WhatsApp**: Twilio API
- **Authentication**: JWT (JSON Web Tokens)
- **Scheduling**: node-cron

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Local Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd bengkel-reminder
```

2. Install dependencies:
```bash
npm run install-all
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` file with your configuration:
- Email settings (Gmail app password recommended)
- Twilio credentials for WhatsApp
- JWT secret key
- Admin credentials

4. Start the application:
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Environment Configuration

### Email Setup (Gmail)
1. Enable 2-factor authentication on your Gmail account
2. Generate an app password: Google Account → Security → App Passwords
3. Use the app password in `EMAIL_PASSWORD` field

### WhatsApp Setup (Twilio)
1. Sign up at https://www.twilio.com/
2. Get your Account SID and Auth Token from the console
3. Set up a WhatsApp sender number
4. Add credentials to `.env` file

## Project Structure

```
bengkel-reminder/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.js
│   └── package.json
├── server/                # Node.js backend
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── index.js
├── database/              # SQLite database
├── .env
├── .gitignore
├── package.json
└── README.md
```

## Usage

### Login
- Default username: `admin`
- Default password: `admin123`
- Change these in `.env` file

### Dashboard Sections

1. **Customer Checklist**: View and manage customer service status
2. **Customer Management**: Add or remove customers
3. **Upcoming Reminders**: View scheduled reminders

### Adding a Customer
1. Go to Customer Management section
2. Click "Add Customer"
3. Fill in customer details (name, email, WhatsApp, vehicle info)
4. Save

### Creating a Reminder
1. Select a customer
2. Add service notes and repair items
3. Set reminder date and time
4. Choose notification channels (email/WhatsApp)
5. Save or click "Send Now" for immediate delivery

## GitHub Deployment

### Deploy to Vercel/Netlify (Frontend)
1. Push code to GitHub
2. Connect repository to Vercel/Netlify
3. Configure build settings:
   - Build command: `cd client && npm run build`
   - Output directory: `client/build`

### Deploy Backend (Render/Railway)
1. Push code to GitHub
2. Connect repository to Render/Railway
3. Configure environment variables
4. Set start command: `node server/index.js`

## Security Notes

- Change default admin credentials in production
- Use strong JWT secret key
- Keep `.env` file secure and never commit to Git
- Use HTTPS in production
- Implement rate limiting for API endpoints

## License

ISC
