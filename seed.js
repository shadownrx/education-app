const mongoose = require('mongoose');

const MONGODB_URI = "mongodb://localhost:27017/eduflow";

const StudentSchema = new mongoose.Schema({
  name: String,
  email: String,
  status: String,
});

const LessonPlanSchema = new mongoose.Schema({
  week: Number,
  title: String,
  topics: [String],
  status: String,
  date: String
});

const AssignmentSchema = new mongoose.Schema({
  student: String,
  title: String,
  submittedAt: Date,
  status: String,
  grade: Number,
  file: String,
  subject: String,
  deadline: String
});

const Student = mongoose.models.Student || mongoose.model("Student", StudentSchema);
const LessonPlan = mongoose.models.LessonPlan || mongoose.model("LessonPlan", LessonPlanSchema);
const Assignment = mongoose.models.Assignment || mongoose.model("Assignment", AssignmentSchema);

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  // Clear existing data
  await Student.deleteMany({});
  await LessonPlan.deleteMany({});
  await Assignment.deleteMany({});

  // Seed Students
  const students = [
    { name: "Gómez, Facundo", email: "facundo.gomez@school.com", status: "present" },
    { name: "Martínez, Lucía", email: "lucia.mtz@school.com", status: "present" },
    { name: "Rodríguez, Mateo", email: "mateo.rod@school.com", status: "absent" },
    { name: "Sánchez, Sofía", email: "sofia.san@school.com", status: "late" },
    { name: "López, Julián", email: "julian.lpz@school.com", status: "present" },
    { name: "Fernández, Emma", email: "emma.fdz@school.com", status: "present" },
  ];
  await Student.insertMany(students);
  console.log("Students seeded");

  // Seed Lesson Plans
  const lessons = [
    { week: 1, title: "Introducción a la Dinámica", topics: ["Leyes de Newton", "Diagrama de cuerpo libre"], status: "completed", date: "12 Mar - 16 Mar" },
    { week: 2, title: "Cinemática de la Partícula", topics: ["MRU y MRUV", "Caída Libre"], status: "completed", date: "19 Mar - 23 Mar" },
    { week: 3, title: "Energía y Trabajo", topics: ["Energía Cinética", "Potencial", "Conservación"], status: "current", date: "26 Mar - 30 Mar" },
  ];
  await LessonPlan.insertMany(lessons);
  console.log("Lessons seeded");

  // Seed Assignments
  const assignments = [
    { student: "Facundo Gómez", title: "TP #3 - Cinemática", submittedAt: new Date(), status: "submitted", subject: "Física", deadline: "5 May, 2026" },
    { student: "Lucía Martínez", title: "TP #3 - Cinemática", submittedAt: new Date(), status: "graded", grade: 9.5, subject: "Física", deadline: "5 May, 2026" },
    { student: "Juan Pérez", title: "TP #4 - Energía", status: "pending", subject: "Física", deadline: "15 May, 2026" },
  ];
  await Assignment.insertMany(assignments);
  console.log("Assignments seeded");

  await mongoose.connection.close();
  console.log("Connection closed");
}

seed().catch(err => console.log(err));
