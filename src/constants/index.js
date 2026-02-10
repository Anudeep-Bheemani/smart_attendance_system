export const INITIAL_BRANCHES = ["CSE", "ECE", "MECH", "CIVIL", "EEE"];

export const YEARS = [1, 2, 3, 4];

export const SUBJECTS = {
  CSE: {
    1: ["Programming Fundamentals", "Mathematics I", "Physics", "English", "Engineering Drawing"],
    2: ["Data Structures", "Operating Systems", "Mathematics II", "Digital Logic", "OOP"],
    3: ["DBMS", "Computer Networks", "Software Engineering", "Web Technologies", "Theory of Computation"],
    4: ["AI/ML", "Cloud Computing", "Cyber Security", "Mobile Computing", "Project"]
  },
  ECE: {
    1: ["Basic Electronics", "Mathematics I", "Physics", "English", "Engineering Drawing"],
    2: ["Signals & Systems", "Digital Electronics", "Circuit Theory", "Mathematics II", "Electromagnetics"],
    3: ["Control Systems", "VLSI", "Communication Systems", "Microprocessors", "Analog Circuits"],
    4: ["Embedded Systems", "Wireless Communication", "Optical Communication", "IoT", "Project"]
  },
  MECH: {
    1: ["Engineering Mechanics", "Mathematics I", "Physics", "English", "Engineering Drawing"],
    2: ["Thermodynamics", "Fluid Mechanics", "Manufacturing", "Mathematics II", "Material Science"],
    3: ["Heat Transfer", "Machine Design", "Dynamics", "CAD/CAM", "Metrology"],
    4: ["Automobile Engineering", "Robotics", "Industrial Engineering", "Mechatronics", "Project"]
  },
  CIVIL: {
    1: ["Engineering Mechanics", "Mathematics I", "Physics", "English", "Engineering Drawing"],
    2: ["Surveying", "Fluid Mechanics", "Building Materials", "Mathematics II", "Geology"],
    3: ["Structural Analysis", "Geotechnical Engineering", "Transportation", "Hydraulics", "Concrete Technology"],
    4: ["Design of Structures", "Environmental Engineering", "Construction Management", "Estimation", "Project"]
  },
  EEE: {
    1: ["Basic Electrical", "Mathematics I", "Physics", "English", "Engineering Drawing"],
    2: ["Circuit Analysis", "Electrical Machines I", "Electromagnetics", "Mathematics II", "Measurements"],
    3: ["Power Systems", "Electrical Machines II", "Control Systems", "Power Electronics", "Microcontrollers"],
    4: ["Power System Protection", "Renewable Energy", "High Voltage", "Smart Grid", "Project"]
  }
};

export const INITIAL_STUDENTS = [
  // CSE Students - Year 1
  ...Array.from({ length: 5 }).map((_, i) => ({
    id: `S${2024000 + i}`,
    role: 'student',
    name: `Student ${i + 1}`,
    email: `student${i + 1}@college.edu`,
    password: 'pass',
    rollNo: `24CSE${101 + i}`,
    branch: "CSE",
    year: 1, 
    dob: "2004-05-15",
    phone: "9876543210",
    guardianName: `Parent of Student ${i + 1}`, 
    guardianPhone: "9988776655",
    verified: i === 0 ? true : false
  })),
  // CSE Students - Year 2
  ...Array.from({ length: 4 }).map((_, i) => ({
    id: `S${2023100 + i}`,
    role: 'student',
    name: `CSE 2nd Year ${i + 1}`,
    email: `cse2.student${i + 1}@college.edu`,
    password: 'pass',
    rollNo: `23CSE${101 + i}`,
    branch: "CSE",
    year: 2, 
    dob: "2003-05-15",
    phone: "9876543210",
    guardianName: `Parent of CSE 2nd Year ${i + 1}`, 
    guardianPhone: "9988776655",
    verified: true
  })),
  // ECE Students - Year 2
  ...Array.from({ length: 4 }).map((_, i) => ({
    id: `S${2023000 + i}`,
    role: 'student',
    name: `ECE Student ${i + 1}`,
    email: `ece.student${i + 1}@college.edu`,
    password: 'pass',
    rollNo: `23ECE${101 + i}`,
    branch: "ECE",
    year: 2, 
    dob: "2003-05-15",
    phone: "9876543210",
    guardianName: `Parent of ECE Student ${i + 1}`, 
    guardianPhone: "9988776655",
    verified: true
  })),
  // MECH Students - Year 1
  ...Array.from({ length: 3 }).map((_, i) => ({
    id: `S${2024100 + i}`,
    role: 'student',
    name: `MECH Student ${i + 1}`,
    email: `mech.student${i + 1}@college.edu`,
    password: 'pass',
    rollNo: `24MECH${101 + i}`,
    branch: "MECH",
    year: 1, 
    dob: "2004-05-15",
    phone: "9876543210",
    guardianName: `Parent of MECH Student ${i + 1}`, 
    guardianPhone: "9988776655",
    verified: true
  })),
  // CSE Students - Year 3
  ...Array.from({ length: 3 }).map((_, i) => ({
    id: `S${2022000 + i}`,
    role: 'student',
    name: `Senior CSE Student ${i + 1}`,
    email: `senior.cse${i + 1}@college.edu`,
    password: 'pass',
    rollNo: `22CSE${101 + i}`,
    branch: "CSE",
    year: 3, 
    dob: "2002-05-15",
    phone: "9876543210",
    guardianName: `Parent of Senior CSE Student ${i + 1}`, 
    guardianPhone: "9988776655",
    verified: true
  })),
  // CSE Students - Year 4
  ...Array.from({ length: 4 }).map((_, i) => ({
    id: `S${2021000 + i}`,
    role: 'student',
    name: `Final Year CSE ${i + 1}`,
    email: `final.cse${i + 1}@college.edu`,
    password: 'pass',
    rollNo: `21CSE${101 + i}`,
    branch: "CSE",
    year: 4, 
    dob: "2001-05-15",
    phone: "9876543210",
    guardianName: `Parent of Final Year CSE ${i + 1}`, 
    guardianPhone: "9988776655",
    verified: true
  }))
];

export const INITIAL_STAFF = [
  { id: 'L1', role: 'lecturer', name: "Prof. Alan Turing", email: "alan@college.edu", password: "pass", subjects: ["AI/ML", "Data Structures"] },
  { id: 'L2', role: 'lecturer', name: "Prof. Grace Hopper", email: "grace@college.edu", password: "pass", subjects: ["Operating Systems", "DBMS"] },
];

export const INITIAL_ADMIN = [
  { id: 'A1', role: 'admin', name: "Administrator", email: "admin@college.edu", password: "admin" }
];
