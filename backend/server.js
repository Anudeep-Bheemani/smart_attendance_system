require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./src/routes/auth');
const studentsRoutes = require('./src/routes/students');
const staffRoutes = require('./src/routes/staff');
const branchesRoutes = require('./src/routes/branches');
const subjectsRoutes = require('./src/routes/subjects');
const attendanceRoutes = require('./src/routes/attendance');
const notificationsRoutes = require('./src/routes/notifications');

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/branches', branchesRoutes);
app.use('/api/subjects', subjectsRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/notifications', notificationsRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
