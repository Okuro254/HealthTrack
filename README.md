# HealthCheck - AI-Powered Health Monitoring App

A comprehensive mobile-first health checkup web application with AI-powered symptom analysis, clinic finder, and integrated payments.

## Features

### 🔐 Authentication & Authorization
- Supabase Auth with email/password authentication
- Role-based access control (User/Admin)
- Secure route protection

### 📝 Symptom Tracking
- Detailed symptom logging
- AI-powered health advice using Hugging Face
- Automatic referral recommendations
- Personal symptom history

### 🏥 Clinic Finder
- GPS-based location detection
- OpenStreetMap integration for nearby clinics
- Fallback to curated clinic database
- Distance calculation and directions

### 💳 Payment Integration
- Paystack payment gateway integration
- Premium health advice features
- Real-time payment status updates
- Webhook handling for payment verification

### 👨‍💼 Admin Dashboard
- User and payment analytics
- Symptom trends monitoring
- Revenue tracking
- System health overview

### 📱 Mobile-First Design
- Progressive Web App (PWA) features
- Responsive design for all devices
- Touch-friendly interface
- Offline capability support

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (Database, Auth, Real-time)
- **AI**: Hugging Face (google/flan-t5-base)
- **Maps**: OpenStreetMap with Overpass API + Leaflet
- **Payments**: Paystack
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Deployment**: Vite build system

## Setup Instructions

### 1. Supabase Setup
1. Create a new Supabase project
2. Run the migration files in `supabase/migrations/`
3. Copy your project URL and anon key to `.env`

### 2. Environment Variables
Copy `.env.example` to `.env` and fill in your API keys:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_HF_API_KEY=your_hugging_face_api_key
VITE_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
PAYSTACK_SECRET_KEY=your_paystack_secret_key
```

### 3. API Keys Setup

#### Hugging Face API Key
1. Visit [Hugging Face](https://huggingface.co/)
2. Create an account and go to Settings > Access Tokens
3. Create a new token with read permissions
4. Add it to your `.env` file

#### Paystack API Key
1. Visit [Paystack](https://paystack.com/)
2. Create an account and get your API keys
3. Use the public key in your `.env` file  
4. Configure webhook URL: `your-app-url/functions/v1/paystack-webhook`

### 4. Admin User Setup
To create an admin user:
1. Sign up normally through the app
2. Go to your Supabase dashboard
3. Navigate to Authentication > Users
4. Edit the user and add to raw_user_meta_data: `{"role": "admin"}`

### 5. Database Schema
The app includes comprehensive RLS policies:
- Users can only access their own data
- Admins can view all data for analytics
- Secure payment handling with webhook verification

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Deployment

1. Deploy the Supabase edge function for webhook handling
2. Configure Paystack webhook URL
3. Build and deploy the frontend
4. Set environment variables in your hosting platform

## Security Features

- Row Level Security (RLS) on all database tables
- Role-based access control
- Secure payment webhook verification
- Protected admin routes
- Data encryption in transit and at rest

## Mobile PWA Features

- Install as mobile app
- Offline symptom logging
- Push notifications (future enhancement)
- Mobile-optimized navigation

## Support

For issues or questions, please check the documentation or create an issue in the repository.