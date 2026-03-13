// ─── MOCK DATA ────────────────────────────────────────────────────────────────
// Replace with real API calls via src/services/api.js in production

export const STUDENTS = [
  { id: 1, firstName: "Alice", lastName: "Johnson", email: "alice@school.edu", phone: "555-0101", dob: "2008-04-12", gender: "Female", grade: "Grade 10", section: "A", address: "12 Maple St, Springfield", guardianName: "Robert Johnson", guardianPhone: "555-0110", guardianRelation: "Father", bloodGroup: "O+", nationality: "American", religion: "Christian", admissionNo: "ADM-2024-001", status: "Active", enrolled: "2024-09-01", medicalNotes: "None" },
  { id: 2, firstName: "Bob", lastName: "Martinez", email: "bob@school.edu", phone: "555-0102", dob: "2007-07-23", gender: "Male", grade: "Grade 11", section: "B", address: "45 Oak Ave, Springfield", guardianName: "Maria Martinez", guardianPhone: "555-0111", guardianRelation: "Mother", bloodGroup: "A+", nationality: "American", religion: "Catholic", admissionNo: "ADM-2023-002", status: "Active", enrolled: "2023-09-01", medicalNotes: "Mild asthma" },
  { id: 3, firstName: "Carol", lastName: "Smith", email: "carol@school.edu", phone: "555-0103", dob: "2009-01-15", gender: "Female", grade: "Grade 9", section: "A", address: "7 Pine Rd, Springfield", guardianName: "David Smith", guardianPhone: "555-0112", guardianRelation: "Father", bloodGroup: "B+", nationality: "American", religion: "Protestant", admissionNo: "ADM-2024-003", status: "Active", enrolled: "2024-09-01", medicalNotes: "None" },
  { id: 4, firstName: "David", lastName: "Lee", email: "david@school.edu", phone: "555-0104", dob: "2006-11-30", gender: "Male", grade: "Grade 12", section: "C", address: "33 Elm Dr, Springfield", guardianName: "Susan Lee", guardianPhone: "555-0113", guardianRelation: "Mother", bloodGroup: "AB+", nationality: "Korean-American", religion: "Buddhist", admissionNo: "ADM-2022-004", status: "Inactive", enrolled: "2022-09-01", medicalNotes: "None" },
  { id: 5, firstName: "Emma", lastName: "Wilson", email: "emma@school.edu", phone: "555-0105", dob: "2008-08-09", gender: "Female", grade: "Grade 10", section: "B", address: "19 Birch Ln, Springfield", guardianName: "James Wilson", guardianPhone: "555-0114", guardianRelation: "Father", bloodGroup: "O-", nationality: "American", religion: "Christian", admissionNo: "ADM-2024-005", status: "Active", enrolled: "2024-09-01", medicalNotes: "None" },
];

export const TEACHERS = [
  { id: 1, firstName: "Sarah", lastName: "Brown", prefix: "Dr.", email: "sarah@school.edu", phone: "555-0201", dob: "1985-03-22", gender: "Female", subject: "Mathematics", qualification: "Ph.D. Mathematics", experience: "10 years", employeeId: "TCH-001", address: "88 Willow St, Springfield", emergencyContact: "555-0210", department: "Science & Math", salary: "5500", joinDate: "2020-08-15", status: "Active", contractType: "Permanent" },
  { id: 2, firstName: "James", lastName: "Taylor", prefix: "Prof.", email: "james@school.edu", phone: "555-0202", dob: "1980-09-14", gender: "Male", subject: "Physics", qualification: "M.Sc Physics", experience: "15 years", employeeId: "TCH-002", address: "22 Cedar Ave, Springfield", emergencyContact: "555-0211", department: "Science & Math", salary: "5800", joinDate: "2019-08-15", status: "Active", contractType: "Permanent" },
  { id: 3, firstName: "Linda", lastName: "Davis", prefix: "Ms.", email: "linda@school.edu", phone: "555-0203", dob: "1990-06-05", gender: "Female", subject: "English", qualification: "M.A. English Literature", experience: "8 years", employeeId: "TCH-003", address: "15 Poplar Blvd, Springfield", emergencyContact: "555-0212", department: "Arts & Humanities", salary: "5200", joinDate: "2021-08-15", status: "Active", contractType: "Permanent" },
  { id: 4, firstName: "Robert", lastName: "Garcia", prefix: "Mr.", email: "robert@school.edu", phone: "555-0204", dob: "1988-12-19", gender: "Male", subject: "Chemistry", qualification: "M.Sc Chemistry", experience: "7 years", employeeId: "TCH-004", address: "60 Magnolia Way, Springfield", emergencyContact: "555-0213", department: "Science & Math", salary: "5300", joinDate: "2022-08-15", status: "Active", contractType: "Contract" },
];

export const STAFF = [
  { id: 1, firstName: "Mary", lastName: "Johnson", email: "mary@school.edu", phone: "555-0301", dob: "1982-04-10", gender: "Female", role: "Administrator", department: "Administration", employeeId: "STF-001", address: "5 Rose Ct, Springfield", emergencyContact: "555-0310", salary: "4200", joinDate: "2018-01-10", status: "Active", shift: "Morning", contractType: "Permanent" },
  { id: 2, firstName: "Tom", lastName: "Williams", email: "tom@school.edu", phone: "555-0302", dob: "1975-08-22", gender: "Male", role: "Security", department: "Security", employeeId: "STF-002", address: "9 Ivy Ln, Springfield", emergencyContact: "555-0311", salary: "3200", joinDate: "2019-03-01", status: "Active", shift: "Evening", contractType: "Permanent" },
  { id: 3, firstName: "Susan", lastName: "Miller", email: "susan@school.edu", phone: "555-0303", dob: "1990-02-14", gender: "Female", role: "Librarian", department: "Library", employeeId: "STF-003", address: "77 Fern Ave, Springfield", emergencyContact: "555-0312", salary: "3800", joinDate: "2020-07-15", status: "Active", shift: "Morning", contractType: "Permanent" },
];

export const COURSES = [
  { id: 1, name: "Advanced Mathematics", code: "MATH-401", teacher: "Dr. Sarah Brown", teacherId: 1, grade: "Grade 11", section: "A", maxStudents: 30, enrolled: 28, duration: "40 hrs", schedule: "Mon, Wed, Fri", startDate: "2025-01-06", endDate: "2025-05-30", room: "Room 101", credits: 4, description: "Covers calculus, linear algebra, and statistics.", status: "Active" },
  { id: 2, name: "Physics Fundamentals", code: "PHY-301", teacher: "Prof. James Taylor", teacherId: 2, grade: "Grade 10", section: "B", maxStudents: 28, enrolled: 24, duration: "36 hrs", schedule: "Tue, Thu", startDate: "2025-01-07", endDate: "2025-05-29", room: "Lab 2", credits: 3, description: "Introduction to mechanics, thermodynamics, and optics.", status: "Active" },
  { id: 3, name: "English Literature", code: "ENG-201", teacher: "Ms. Linda Davis", teacherId: 3, grade: "Grade 9", section: "A", maxStudents: 32, enrolled: 30, duration: "32 hrs", schedule: "Mon, Wed", startDate: "2025-01-06", endDate: "2025-05-28", room: "Room 203", credits: 3, description: "Study of classic and modern literature.", status: "Active" },
  { id: 4, name: "Organic Chemistry", code: "CHEM-402", teacher: "Mr. Robert Garcia", teacherId: 4, grade: "Grade 12", section: "C", maxStudents: 24, enrolled: 20, duration: "44 hrs", schedule: "Tue, Thu, Fri", startDate: "2025-01-07", endDate: "2025-05-30", room: "Lab 1", credits: 4, description: "Advanced organic reactions and mechanisms.", status: "Active" },
];

export const PAYMENTS = [
  { id: 1, studentId: 1, studentName: "Alice Johnson", admissionNo: "ADM-2024-001", grade: "Grade 10", amount: 1200, discount: 0, paid: 1200, type: "Tuition Fee", method: "Bank Transfer", date: "2025-01-15", dueDate: "2025-01-15", status: "Paid", invoice: "INV-2025-001", reference: "TXN-88001", remarks: "" },
  { id: 2, studentId: 2, studentName: "Bob Martinez", admissionNo: "ADM-2023-002", grade: "Grade 11", amount: 1200, discount: 100, paid: 1100, type: "Tuition Fee", method: "Cash", date: "2025-01-16", dueDate: "2025-01-16", status: "Paid", invoice: "INV-2025-002", reference: "TXN-88002", remarks: "Sibling discount applied" },
  { id: 3, studentId: 3, studentName: "Carol Smith", admissionNo: "ADM-2024-003", grade: "Grade 9", amount: 800, discount: 0, paid: 800, type: "Lab Fee", method: "Card", date: "2025-01-17", dueDate: "2025-01-17", status: "Paid", invoice: "INV-2025-003", reference: "TXN-88003", remarks: "" },
  { id: 4, studentId: 4, studentName: "David Lee", admissionNo: "ADM-2022-004", grade: "Grade 12", amount: 1200, discount: 0, paid: 0, type: "Tuition Fee", method: "", date: "", dueDate: "2025-02-01", status: "Pending", invoice: "INV-2025-004", reference: "", remarks: "Payment overdue" },
  { id: 5, studentId: 5, studentName: "Emma Wilson", admissionNo: "ADM-2024-005", grade: "Grade 10", amount: 1200, discount: 0, paid: 1200, type: "Tuition Fee", method: "Online", date: "2025-02-05", dueDate: "2025-02-05", status: "Paid", invoice: "INV-2025-005", reference: "TXN-88005", remarks: "" },
];

export const NOTES = [
  { id: 1, title: "Midterm Exam Schedule — March 2025", content: "The midterm examinations will be conducted from March 10–14, 2025. All students are required to bring their student ID and stationery. No electronic devices are permitted in the examination hall. Exam timetables will be posted on the notice board by February 28.", teacher: "Dr. Sarah Brown", teacherId: 1, course: "Advanced Mathematics", courseCode: "MATH-401", targetGrade: "Grade 11", date: "2025-02-20", pinned: true, category: "Exam" },
  { id: 2, title: "Lab Safety Refresher — Mandatory", content: "All students enrolled in Organic Chemistry must complete the updated Lab Safety module on the portal before attending the next lab session on February 25. Failure to complete this will result in restricted lab access.", teacher: "Mr. Robert Garcia", teacherId: 4, course: "Organic Chemistry", courseCode: "CHEM-402", targetGrade: "Grade 12", date: "2025-02-18", pinned: false, category: "Safety" },
  { id: 3, title: "Reading Assignment — Chapters 5–7", content: "Please read chapters 5 through 7 of 'Great Expectations' by Charles Dickens before Thursday's class. Be prepared to discuss the themes of social class and personal ambition. A short written response (1 page) should be submitted at the beginning of class.", teacher: "Ms. Linda Davis", teacherId: 3, course: "English Literature", courseCode: "ENG-201", targetGrade: "Grade 9", date: "2025-02-17", pinned: false, category: "Assignment" },
];

export const VIDEOS = [
  { id: 1, title: "Introduction to Differential Calculus", teacher: "Dr. Sarah Brown", teacherId: 1, course: "Advanced Mathematics", courseCode: "MATH-401", grade: "Grade 11", duration: "45:30", description: "Covers the concept of limits, derivatives, and their applications in real-world problems.", tags: "calculus, derivatives, limits", views: 142, uploadDate: "2025-02-01", size: "480 MB" },
  { id: 2, title: "Newton's Laws of Motion — Full Lecture", teacher: "Prof. James Taylor", teacherId: 2, course: "Physics Fundamentals", courseCode: "PHY-301", grade: "Grade 10", duration: "38:15", description: "An in-depth look at Newton's three laws with demonstrations and problem solving.", tags: "newton, mechanics, forces", views: 98, uploadDate: "2025-02-05", size: "320 MB" },
  { id: 3, title: "Shakespeare's Sonnets: Analysis & Context", teacher: "Ms. Linda Davis", teacherId: 3, course: "English Literature", courseCode: "ENG-201", grade: "Grade 9", duration: "52:00", description: "Analysis of selected sonnets, including historical context, meter, and themes.", tags: "shakespeare, sonnets, poetry", views: 87, uploadDate: "2025-02-10", size: "540 MB" },
];

// ─── CHART DATA ───────────────────────────────────────────────────────────────
export const REV_DATA = [
  { month: "Sep", revenue: 48000, expenses: 32000 },
  { month: "Oct", revenue: 52000, expenses: 34000 },
  { month: "Nov", revenue: 49000, expenses: 33000 },
  { month: "Dec", revenue: 44000, expenses: 30000 },
  { month: "Jan", revenue: 58000, expenses: 35000 },
  { month: "Feb", revenue: 61000, expenses: 37000 },
];

export const ATT_DATA = [
  { date: "Feb 10", present: 142, absent: 12 },
  { date: "Feb 11", present: 148, absent: 6 },
  { date: "Feb 12", present: 139, absent: 15 },
  { date: "Feb 13", present: 151, absent: 3 },
  { date: "Feb 14", present: 145, absent: 9 },
  { date: "Feb 17", present: 146, absent: 8 },
];

export const GRADE_DATA = [
  { name: "Grade 9",  value: 42, color: "#1f2937" },
  { name: "Grade 10", value: 38, color: "#4b5563" },
  { name: "Grade 11", value: 35, color: "#9ca3af" },
  { name: "Grade 12", value: 29, color: "#d1d5db" },
];

// ─── DEMO AUTH USERS ──────────────────────────────────────────────────────────
export const DEMO_USERS = [
  { email: "admin@school.edu",   password: "admin123",   role: "Admin",   name: "Admin User"       },
  { email: "sarah@school.edu",   password: "teacher123", role: "Teacher", name: "Dr. Sarah Brown"  },
  { email: "alice@school.edu",   password: "student123", role: "Student", name: "Alice Johnson"    },
  { email: "mary@school.edu",    password: "staff123",   role: "Staff",   name: "Mary Johnson"     },
];
