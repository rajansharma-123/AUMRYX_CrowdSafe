# AUMRYX CrowdSafe

**Official Safety & Visitor Information Platform for Braj Holi**

A comprehensive web application designed to enhance visitor safety and provide real-time information during the Braj Holi festival. The platform offers crowd monitoring, emergency assistance, event scheduling, and visitor guidance features.

![AUMRYX CrowdSafe](https://img.shields.io/badge/Status-Active-success)
![React](https://img.shields.io/badge/React-19.0.0-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110.1-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 🌟 Features

### Core Features
- **📅 Event Schedule** - Complete Holi festival schedule with event details, timings, and locations
- **🗺️ Live Crowd Map** - Real-time interactive map showing crowd levels, safety status, and key locations
- **🚨 Emergency Assistance** - Quick access to emergency contacts, SOS button, and help locations
- **🛣️ Safe Routes** - Route suggestions based on real-time crowd conditions
- **📱 Lost & Found** - Report and search for lost items with photo uploads
- **📍 Help Near Me** - Find nearby help points, medical facilities, police stations, and amenities
- **🔔 Real-time Alerts** - Safety alerts and important notifications
- **📖 Visitor Guide** - Comprehensive guide for visitors with travel tips and information
- **❓ FAQ** - Frequently asked questions and answers
- **✅ Do's & Don'ts** - Safety guidelines and best practices
- **🔖 Bookmarks** - Save favorite events and locations
- **👨‍💼 Admin Dashboard** - Management interface for events, alerts, and safety status

### Key Highlights
- **Bilingual Support** - Available in English and Hindi (हिंदी)
- **Progressive Web App (PWA)** - Installable on mobile devices with offline support
- **Real-time Updates** - Live crowd status and safety information
- **Responsive Design** - Optimized for mobile, tablet, and desktop
- **Service Worker** - Offline functionality and caching

## 🛠️ Tech Stack

### Frontend
- **React 19.0.0** - UI library
- **React Router DOM 7.5.1** - Routing
- **Tailwind CSS 3.4.17** - Styling
- **Radix UI** - Accessible component primitives
- **Leaflet & React Leaflet** - Interactive maps
- **Axios** - HTTP client
- **Lucide React** - Icons
- **Sonner** - Toast notifications
- **React Hook Form & Zod** - Form handling and validation

### Backend
- **FastAPI 0.110.1** - Python web framework
- **MongoDB** - Database (via Motor async driver)
- **Uvicorn** - ASGI server
- **Pydantic** - Data validation
- **JWT** - Authentication
- **Boto3** - AWS S3 integration for file uploads

### Development Tools
- **CRACO** - Create React App Configuration Override
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Webpack** - Module bundler

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Python** (v3.9 or higher)
- **MongoDB** (local or cloud instance)
- **Git**

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/rajansharma-123/AUMRYX-CrowdSafe.git
cd AUMRYX-CrowdSafe
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
# Copy the example and fill in your values
cp .env.example .env
```

**Backend Environment Variables:**
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=crowdsafe
REACT_APP_BACKEND_URL=http://localhost:8000
# Add other required environment variables
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install --legacy-peer-deps

# Create .env file
# Add your environment variables
REACT_APP_BACKEND_URL=http://localhost:8000
```

### 4. Run the Application

**Start Backend Server:**
```bash
cd backend
uvicorn server:app --reload --port 8000
```

**Start Frontend Development Server:**
```bash
cd frontend
npm start
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 📁 Project Structure

```
AUMRYX-CrowdSafe/
├── backend/
│   ├── server.py              # FastAPI application
│   └── requirements.txt        # Python dependencies
├── frontend/
│   ├── public/                 # Static files
│   │   ├── index.html
│   │   ├── manifest.json       # PWA manifest
│   │   └── service-worker.js   # Service worker
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── ui/            # UI components (shadcn/ui)
│   │   │   ├── Header.js
│   │   │   ├── SOSButton.js
│   │   │   └── ...
│   │   ├── contexts/          # React contexts
│   │   │   ├── AuthContext.js
│   │   │   └── LanguageContext.js
│   │   ├── pages/             # Page components
│   │   │   ├── Home.js
│   │   │   ├── Schedule.js
│   │   │   ├── LiveMap.js
│   │   │   └── ...
│   │   ├── App.js             # Main app component
│   │   └── index.js           # Entry point
│   ├── package.json
│   ├── vercel.json            # Vercel deployment config
│   └── tailwind.config.js     # Tailwind configuration
├── tests/                      # Test files
├── .gitignore
└── README.md
```

## 🌐 Deployment

### Deploy to Vercel (Frontend)

1. **Via Vercel CLI:**
   ```bash
   cd frontend
   npm install -g vercel
   vercel login
   vercel --prod
   ```

2. **Via Vercel Dashboard:**
   - Push code to GitHub
   - Import repository in Vercel
   - Configure build settings:
     - **Root Directory**: `frontend`
     - **Build Command**: `npm run build`
     - **Output Directory**: `build`
     - **Install Command**: `npm install --legacy-peer-deps`

### Deploy Backend

The backend can be deployed to:
- **Heroku**
- **Railway**
- **AWS EC2/ECS**
- **Google Cloud Run**
- **DigitalOcean**

See `frontend/DEPLOYMENT.md` for detailed deployment instructions.

## 🔧 Configuration

### Environment Variables

**Frontend (.env):**
```env
REACT_APP_BACKEND_URL=http://localhost:8000
REACT_APP_AUTH_URL=your-auth-url
```

**Backend (.env):**
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=crowdsafe
SECRET_KEY=your-secret-key
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_S3_BUCKET=your-bucket-name
```

## 📱 Progressive Web App (PWA)

The application is configured as a PWA:
- Installable on mobile devices
- Offline support via service worker
- App-like experience
- Push notifications support

## 🌍 Internationalization

The app supports multiple languages:
- English (en)
- Hindi (हिंदी)

Language switching is available in the header.

## 🔐 Authentication

Admin authentication is handled through:
- JWT tokens
- Session management
- Protected routes for admin dashboard

## 📊 API Endpoints

Key API endpoints include:
- `/api/events` - Event management
- `/api/safety-status` - Crowd and safety status
- `/api/alerts` - Safety alerts
- `/api/lost-found` - Lost and found items
- `/api/help-locations` - Help point locations
- `/api/auth` - Authentication endpoints

Full API documentation available at `/docs` when backend is running.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👥 Authors

- **Rajansharma-123** - [GitHub](https://github.com/rajansharma-123)

## 🙏 Acknowledgments

- Braj Holi Festival organizers
- All contributors and supporters
- Open source community

## 📞 Support

For support, email support@aumryx.com or open an issue in the GitHub repository.

## 🔗 Links

- **GitHub Repository**: https://github.com/rajansharma-123/AUMRYX-CrowdSafe
- **Live Demo**: (Add your deployment URL)
- **Documentation**: (Add documentation link if available)

---

**Made with ❤️ for Braj Holi Festival**
