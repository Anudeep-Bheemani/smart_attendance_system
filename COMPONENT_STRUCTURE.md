# Smart Attendance System - Refactored Component Structure

## 📁 Project Structure

```
src/
├── components/
│   ├── common/
│   │   ├── AppShell.jsx          # Main layout with sidebar & header
│   │   ├── LandingPage.jsx       # Login & verification page
│   │   └── RiskBadge.jsx         # Reusable risk status badge
│   │
│   ├── student/
│   │   ├── StudentDashboard.jsx        # Main student view with AI assistant
│   │   ├── PredictionCard.jsx          # Subject-wise attendance card
│   │   ├── OverallPredictionPanel.jsx  # Action plan panel
│   │   ├── AttendanceCalculator.jsx    # What-if calculator
│   │   ├── ClassAttendanceView.jsx     # Class leaderboard
│   │   └── StudentProfile.jsx          # Profile details view
│   │
│   ├── lecturer/
│   │   ├── LecturerDashboard.jsx       # Analytics dashboard with AI reports
│   │   ├── AttendanceEntry.jsx         # Attendance marking interface
│   │   └── LecturerRecordManager.jsx   # Student & branch management
│   │
│   └── admin/
│       ├── AdminDashboard.jsx          # System overview with charts
│       └── AdminStaffManager.jsx       # Staff CRUD operations
│
├── services/
│   └── gemini.js                 # Google Gemini AI API integration
│
├── utils/
│   └── index.js                  # Utility functions (calculations, risk status)
│
├── constants/
│   └── index.js                  # Initial data & configuration
│
├── App.jsx                       # Main app controller with routing logic
├── main.jsx                      # React entry point
└── index.css                     # Tailwind CSS imports

```

## 🎯 Key Features

### Common Components
- **AppShell**: Responsive sidebar navigation, role-based menu items
- **LandingPage**: Multi-role login (Student/Parent/Lecturer/Admin) with email verification flow
- **RiskBadge**: Color-coded attendance status (Safe/Warning/Critical)

### Student Components
- **StudentDashboard**: 
  - Overall attendance percentage card
  - Academic health status
  - AI Smart Assistant (excuse letters & improvement tips)
  - Subject-wise analytics
  
- **AttendanceCalculator**: Interactive "what-if" scenarios with slider
- **ClassAttendanceView**: Peer comparison with ranking system
- **StudentProfile**: Read-only personal & academic details

### Lecturer Components
- **LecturerDashboard**:
  - Class performance metrics (Safe/Warning/Critical counts)
  - Pie chart for attendance distribution
  - Bar chart for performance brackets
  - AI-generated insight reports
  - Filterable student list
  
- **AttendanceEntry**:
  - Bulk attendance marking by Year/Branch/Subject
  - Real-time percentage calculation
  - Student detail side panel
  - Class-wide total hours control
  
- **LecturerRecordManager**: Add students & manage branches

### Admin Components
- **AdminDashboard**: System-wide statistics with charts
- **AdminStaffManager**: CRUD operations for staff accounts

## 🔧 Services & Utils

### Gemini AI Service (`services/gemini.js`)
- Retry logic with exponential backoff
- Generates excuse letters with student details
- Provides attendance improvement tips
- Creates monthly performance reports for lecturers

### Utilities (`utils/index.js`)
- `calculatePercentage()`: Attendance percentage calculation
- `getRiskStatus()`: Returns color/icon based on percentage
- `predictHours()`: Calculates hours needed to reach target
- `generateMockAttendance()`: Creates initial demo data

### Constants (`constants/index.js`)
- Initial students, staff, admin accounts
- Branch & batch configurations
- Subject mappings per branch

## 🚀 How to Run

```bash
npm install
npm run dev
```

## 🔐 Demo Credentials

- **Student**: 24CSE100 / pass
- **Lecturer**: alan@college.edu / pass
- **Admin**: admin@college.edu / admin

## 💡 Benefits of Refactoring

✅ **Maintainability**: Each component has a single responsibility
✅ **Reusability**: Common components (RiskBadge, AppShell) used across roles
✅ **Scalability**: Easy to add new features or roles
✅ **Readability**: Clear file structure with logical grouping
✅ **Performance**: Smaller component files load faster
✅ **Collaboration**: Multiple developers can work on different components

## 🎨 UI/UX Preserved

All original styling, animations, and user interactions remain identical. The refactoring only reorganized the code structure without changing any visual elements.
