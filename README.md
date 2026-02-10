# Smart Attendance Management System

An AI-powered attendance tracking platform with real-time analytics, intelligent predictions, and comprehensive reporting.

## Features

- 🤖 **AI-Powered Predictions** - Smart forecasting for attendance trends
- 📊 **Live Analytics** - Real-time insights and dashboards
- ⚠️ **Risk Alerts** - Instant warnings for at-risk students
- 📧 **Email Notifications** - Automated reports to students and parents
- 📱 **Multi-Role Access** - Student, Parent, Lecturer, and Admin portals
- 📈 **Advanced Reporting** - Excel and PDF export capabilities
- 🎯 **Attendance Calculator** - Predict required classes to reach target percentage

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- Recharts (Data Visualization)
- Lucide React (Icons)
- jsPDF & XLSX (Export functionality)

## Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Demo Credentials

- **Student**: 24CSE100 / pass
- **Lecturer**: alan@college.edu / pass
- **Admin**: admin@college.edu / admin

## Project Structure

```
src/
├── components/
│   ├── admin/          # Admin dashboard components
│   ├── lecturer/       # Lecturer portal components
│   ├── student/        # Student dashboard components
│   └── common/         # Shared components
├── services/           # API services (Gemini AI, Notifications)
├── utils/              # Utility functions
└── constants/          # App constants and initial data
```

## License

MIT
