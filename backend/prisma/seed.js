require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// June(6)-Dec(12) = Sem 1 | Jan(1)-May(5) = Sem 2
const SEM1_MONTHS = ['June', 'July', 'August', 'September', 'October', 'November', 'December'];
const SEM2_MONTHS = ['January', 'February', 'March', 'April', 'May'];

const INITIAL_BRANCHES = ["CSE", "ECE", "MECH", "CIVIL", "EEE"];

// New structure: branch → year → semester → subjects[]
const SUBJECTS = {
  CSE: {
    1: { 1: ["Programming Fundamentals", "Mathematics I", "Engineering Drawing"], 2: ["Physics", "English"] },
    2: { 1: ["Data Structures", "Digital Logic", "OOP"], 2: ["Operating Systems", "Mathematics II"] },
    3: { 1: ["DBMS", "Computer Networks", "Theory of Computation"], 2: ["Software Engineering", "Web Technologies"] },
    4: { 1: ["AI/ML", "Cloud Computing", "Cyber Security"], 2: ["Mobile Computing", "Project"] }
  },
  ECE: {
    1: { 1: ["Basic Electronics", "Mathematics I", "Engineering Drawing"], 2: ["Physics", "English"] },
    2: { 1: ["Signals & Systems", "Digital Electronics", "Circuit Theory"], 2: ["Mathematics II", "Electromagnetics"] },
    3: { 1: ["Control Systems", "VLSI", "Communication Systems"], 2: ["Microprocessors", "Analog Circuits"] },
    4: { 1: ["Embedded Systems", "Wireless Communication", "Optical Communication"], 2: ["IoT", "Project"] }
  },
  MECH: {
    1: { 1: ["Engineering Mechanics", "Mathematics I", "Engineering Drawing"], 2: ["Physics", "English"] },
    2: { 1: ["Thermodynamics", "Fluid Mechanics", "Manufacturing"], 2: ["Mathematics II", "Material Science"] },
    3: { 1: ["Heat Transfer", "Machine Design", "Dynamics"], 2: ["CAD/CAM", "Metrology"] },
    4: { 1: ["Automobile Engineering", "Robotics", "Industrial Engineering"], 2: ["Mechatronics", "Project"] }
  },
  CIVIL: {
    1: { 1: ["Engineering Mechanics", "Mathematics I", "Engineering Drawing"], 2: ["Physics", "English"] },
    2: { 1: ["Surveying", "Fluid Mechanics", "Building Materials"], 2: ["Mathematics II", "Geology"] },
    3: { 1: ["Structural Analysis", "Geotechnical Engineering", "Transportation"], 2: ["Hydraulics", "Concrete Technology"] },
    4: { 1: ["Design of Structures", "Environmental Engineering", "Construction Management"], 2: ["Estimation", "Project"] }
  },
  EEE: {
    1: { 1: ["Basic Electrical", "Mathematics I", "Engineering Drawing"], 2: ["Physics", "English"] },
    2: { 1: ["Circuit Analysis", "Electrical Machines I", "Electromagnetics"], 2: ["Mathematics II", "Measurements"] },
    3: { 1: ["Power Systems", "Electrical Machines II", "Control Systems"], 2: ["Power Electronics", "Microcontrollers"] },
    4: { 1: ["Power System Protection", "Renewable Energy", "High Voltage"], 2: ["Smart Grid", "Project"] }
  }
};

const INITIAL_STUDENTS = [
  ...Array.from({ length: 5 }).map((_, i) => ({
    id: `S${2024000 + i}`, role: 'student',
    name: `Student ${i + 1}`, email: `student${i + 1}@college.edu`, password: 'pass',
    rollNo: `24CSE${101 + i}`, branch: "CSE", year: 1,
    dob: "2004-05-15", phone: "9876543210",
    guardianName: `Parent of Student ${i + 1}`, guardianPhone: "9988776655",
    verified: i === 0
  })),
  ...Array.from({ length: 4 }).map((_, i) => ({
    id: `S${2023100 + i}`, role: 'student',
    name: `CSE 2nd Year ${i + 1}`, email: `cse2.student${i + 1}@college.edu`, password: 'pass',
    rollNo: `23CSE${101 + i}`, branch: "CSE", year: 2,
    dob: "2003-05-15", phone: "9876543210",
    guardianName: `Parent of CSE 2nd Year ${i + 1}`, guardianPhone: "9988776655",
    verified: true
  })),
  ...Array.from({ length: 4 }).map((_, i) => ({
    id: `S${2023000 + i}`, role: 'student',
    name: `ECE Student ${i + 1}`, email: `ece.student${i + 1}@college.edu`, password: 'pass',
    rollNo: `23ECE${101 + i}`, branch: "ECE", year: 2,
    dob: "2003-05-15", phone: "9876543210",
    guardianName: `Parent of ECE Student ${i + 1}`, guardianPhone: "9988776655",
    verified: true
  })),
  ...Array.from({ length: 3 }).map((_, i) => ({
    id: `S${2024100 + i}`, role: 'student',
    name: `MECH Student ${i + 1}`, email: `mech.student${i + 1}@college.edu`, password: 'pass',
    rollNo: `24MECH${101 + i}`, branch: "MECH", year: 1,
    dob: "2004-05-15", phone: "9876543210",
    guardianName: `Parent of MECH Student ${i + 1}`, guardianPhone: "9988776655",
    verified: true
  })),
  ...Array.from({ length: 3 }).map((_, i) => ({
    id: `S${2022000 + i}`, role: 'student',
    name: `Senior CSE Student ${i + 1}`, email: `senior.cse${i + 1}@college.edu`, password: 'pass',
    rollNo: `22CSE${101 + i}`, branch: "CSE", year: 3,
    dob: "2002-05-15", phone: "9876543210",
    guardianName: `Parent of Senior CSE Student ${i + 1}`, guardianPhone: "9988776655",
    verified: true
  })),
  ...Array.from({ length: 4 }).map((_, i) => ({
    id: `S${2021000 + i}`, role: 'student',
    name: `Final Year CSE ${i + 1}`, email: `final.cse${i + 1}@college.edu`, password: 'pass',
    rollNo: `21CSE${101 + i}`, branch: "CSE", year: 4,
    dob: "2001-05-15", phone: "9876543210",
    guardianName: `Parent of Final Year CSE ${i + 1}`, guardianPhone: "9988776655",
    verified: true
  }))
];

const INITIAL_STAFF = [
  { id: 'L1', role: 'lecturer', name: "Prof. Alan Turing", email: "alan@college.edu", password: "pass", subjects: ["AI/ML", "Data Structures"] },
  { id: 'L2', role: 'lecturer', name: "Prof. Grace Hopper", email: "grace@college.edu", password: "pass", subjects: ["Operating Systems", "DBMS"] }
];

const INITIAL_ADMIN = [
  { id: 'A1', role: 'admin', name: "Administrator", email: "admin@college.edu", password: "admin" }
];

function randAttended(rand) {
  if (rand > 0.8) return 38;
  if (rand > 0.5) return 28;
  return 18;
}

function generateAttendance(students) {
  const records = [];

  students.forEach(student => {
    const branchSubs = SUBJECTS[student.branch];
    if (!branchSubs) return;
    const yearSubs = branchSubs[student.year];
    if (!yearSubs) return;

    // ── Sem 1 demo data (Jul–Dec) ────────────────────────────────────────
    const sem1DemoMonths = ['September', 'October'];
    const sem1Subjects = yearSubs[1] || [];
    sem1Subjects.forEach(sub => {
      sem1DemoMonths.forEach(month => {
        records.push({
          studentId: student.id,
          studentName: student.name,
          rollNo: student.rollNo,
          subject: sub,
          month,
          semester: 1,
          totalHours: 40,
          attendedHours: randAttended(Math.random())
        });
      });
    });

    // ── Sem 2 demo data (Jan–Jun) ────────────────────────────────────────
    const sem2DemoMonths = ['March', 'April'];
    const sem2Subjects = yearSubs[2] || [];
    sem2Subjects.forEach(sub => {
      sem2DemoMonths.forEach(month => {
        records.push({
          studentId: student.id,
          studentName: student.name,
          rollNo: student.rollNo,
          subject: sub,
          month,
          semester: 2,
          totalHours: 40,
          attendedHours: randAttended(Math.random())
        });
      });
    });
  });

  return records;
}

async function main() {
  console.log('Seeding database...');

  await prisma.attendance.deleteMany();
  await prisma.student.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.admin.deleteMany();
  await prisma.branch.deleteMany();
  await prisma.subjectConfig.deleteMany();
  await prisma.semConfig.deleteMany();

  for (const name of INITIAL_BRANCHES) {
    await prisma.branch.create({ data: { name } });
  }
  console.log(`Seeded ${INITIAL_BRANCHES.length} branches`);

  await prisma.subjectConfig.create({ data: { data: SUBJECTS } });
  console.log('Seeded subjects config');

  const DEFAULT_SEM_CONFIG = {
    "1": { "1": ["July","August","September","October","November","December"], "2": ["January","February","March","April","May","June"] },
    "2": { "1": ["July","August","September","October","November","December"], "2": ["January","February","March","April","May","June"] },
    "3": { "1": ["July","August","September","October","November","December"], "2": ["January","February","March","April","May","June"] },
    "4": { "1": ["July","August","September","October","November","December"], "2": ["January","February","March","April","May","June"] }
  };
  await prisma.semConfig.create({ data: { data: DEFAULT_SEM_CONFIG } });
  console.log('Seeded semester configuration');

  for (const admin of INITIAL_ADMIN) {
    const hashed = await bcrypt.hash(admin.password, 10);
    await prisma.admin.create({ data: { ...admin, password: hashed } });
  }
  console.log(`Seeded ${INITIAL_ADMIN.length} admins`);

  for (const staff of INITIAL_STAFF) {
    const hashed = await bcrypt.hash(staff.password, 10);
    await prisma.staff.create({ data: { ...staff, password: hashed } });
  }
  console.log(`Seeded ${INITIAL_STAFF.length} staff`);

  for (const student of INITIAL_STUDENTS) {
    const hashed = await bcrypt.hash(student.password, 10);
    await prisma.student.create({ data: { ...student, password: hashed } });
  }
  console.log(`Seeded ${INITIAL_STUDENTS.length} students`);

  const attendanceRecords = generateAttendance(INITIAL_STUDENTS);
  for (const record of attendanceRecords) {
    await prisma.attendance.create({ data: record });
  }
  console.log(`Seeded ${attendanceRecords.length} attendance records (Sem 1 + Sem 2 demo data)`);

  console.log('Done!');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
