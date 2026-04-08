import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("gym.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    status TEXT DEFAULT 'active',
    membership_type TEXT,
    expiry_date DATE,
    join_date DATE,
    last_visit DATETIME,
    goal TEXT,
    trainer_id INTEGER,
    age INTEGER,
    height TEXT,
    weight TEXT,
    body_target TEXT,
    timing TEXT
  );

  CREATE TABLE IF NOT EXISTS revenue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    amount REAL NOT NULL,
    category TEXT,
    date DATE DEFAULT CURRENT_DATE,
    member_id INTEGER
  );

  CREATE TABLE IF NOT EXISTS staff (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT,
    salary REAL,
    performance_rating REAL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_name TEXT NOT NULL,
    stock_level INTEGER DEFAULT 0,
    max_stock INTEGER DEFAULT 0,
    category TEXT,
    type TEXT DEFAULT 'product',
    status TEXT DEFAULT 'in_stock',
    price REAL DEFAULT 0,
    condition TEXT,
    last_restock DATE,
    location TEXT
  );

  CREATE TABLE IF NOT EXISTS diet_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL,
    meal_type TEXT NOT NULL,
    food_items TEXT NOT NULL,
    calories INTEGER,
    protein INTEGER,
    carbs INTEGER,
    fats INTEGER,
    notes TEXT,
    FOREIGN KEY (member_id) REFERENCES members(id)
  );

  CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL,
    check_in_time TEXT NOT NULL,
    check_out_time TEXT,
    date DATE NOT NULL,
    FOREIGN KEY (member_id) REFERENCES members(id)
  );

  CREATE TABLE IF NOT EXISTS trainer_notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL,
    trainer_id INTEGER NOT NULL,
    note TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id),
    FOREIGN KEY (trainer_id) REFERENCES staff(id)
  );

  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    type TEXT NOT NULL,
    status TEXT DEFAULT 'paid',
    date DATE NOT NULL,
    description TEXT,
    FOREIGN KEY (member_id) REFERENCES members(id)
  );

  CREATE TABLE IF NOT EXISTS staff_attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    staff_id INTEGER NOT NULL,
    date DATE NOT NULL,
    status TEXT DEFAULT 'present',
    check_in TEXT,
    check_out TEXT,
    FOREIGN KEY (staff_id) REFERENCES staff(id)
  );

  CREATE TABLE IF NOT EXISTS schedule (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    class_name TEXT NOT NULL,
    trainer_id INTEGER,
    day_of_week TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    capacity INTEGER DEFAULT 20,
    enrolled INTEGER DEFAULT 0,
    location TEXT,
    category TEXT
  );

  CREATE TABLE IF NOT EXISTS workout_programs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    level TEXT NOT NULL,
    goal TEXT NOT NULL,
    duration TEXT NOT NULL,
    days_per_week TEXT NOT NULL,
    rest_time TEXT,
    color TEXT DEFAULT 'emerald'
  );

  CREATE TABLE IF NOT EXISTS program_exercises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    program_id INTEGER NOT NULL,
    section TEXT NOT NULL,
    exercise_name TEXT NOT NULL,
    type TEXT NOT NULL,
    min_value REAL NOT NULL,
    max_value REAL NOT NULL,
    unit TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    FOREIGN KEY (program_id) REFERENCES workout_programs(id)
  );
`);

// Seed data if empty
const memberCount = db.prepare("SELECT COUNT(*) as count FROM members").get() as { count: number };
if (memberCount.count === 0) {
  const insertMember = db.prepare("INSERT INTO members (name, email, status, membership_type, expiry_date, join_date, last_visit, goal, trainer_id, age, height, weight, body_target, timing) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
  insertMember.run("Alex Johnson", "alex@example.com", "active", "Premium", "2026-05-01", "2025-01-01", "2026-02-25", "Muscle gain and strength", 1, 28, '5\'11"', "82kg", "78kg Lean", "Morning (6AM-10AM)");
  insertMember.run("Sarah Smith", "sarah@example.com", "expiring", "Standard", "2026-03-05", "2025-02-15", "2026-02-20", "Weight loss and toning", 2, 24, '5\'6"', "65kg", "58kg Toned", "Evening (4PM-8PM)");
  insertMember.run("Mike Ross", "mike@example.com", "due", "Basic", "2026-02-20", "2025-08-10", "2026-02-10", "General fitness", 1, 35, '5\'9"', "90kg", "80kg Athletic", "Night (8PM-11PM)");

  const insertRevenue = db.prepare("INSERT INTO revenue (amount, category, date, member_id) VALUES (?, ?, ?, ?)");
  insertRevenue.run(5000, "Memberships", "2026-02-24", 1);
  insertRevenue.run(1200, "Supplements", "2026-02-24", 1);
  insertRevenue.run(4500, "Memberships", "2026-02-23", 2);

  // Seed staff (trainers)
  const insertStaff = db.prepare("INSERT INTO staff (name, role, salary, performance_rating) VALUES (?, ?, ?, ?)");
  insertStaff.run("Raj Patel", "Head Trainer", 45000, 4.8);
  insertStaff.run("Priya Sharma", "Trainer", 35000, 4.5);
  insertStaff.run("David Kim", "Nutritionist", 40000, 4.6);

  // Seed diet plans
  const insertDiet = db.prepare("INSERT INTO diet_plans (member_id, meal_type, food_items, calories, protein, carbs, fats, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
  insertDiet.run(1, "Breakfast", "6 Egg whites, Oatmeal with banana, Black coffee", 450, 35, 55, 8, "Pre-workout meal");
  insertDiet.run(1, "Lunch", "Grilled chicken breast, Brown rice, Broccoli", 650, 50, 60, 15, "Post-workout");
  insertDiet.run(1, "Dinner", "Salmon fillet, Sweet potato, Mixed salad", 580, 42, 45, 20, null);
  insertDiet.run(1, "Snack", "Whey protein shake, Almonds, Apple", 350, 30, 25, 12, "Between meals");
  insertDiet.run(2, "Breakfast", "Greek yogurt, Berries, Granola", 320, 20, 40, 8, "Light and filling");
  insertDiet.run(2, "Lunch", "Quinoa salad, Grilled tofu, Avocado", 480, 25, 50, 18, null);
  insertDiet.run(2, "Dinner", "Grilled fish, Steamed vegetables, Lemon dressing", 380, 35, 20, 12, "Low carb");
  insertDiet.run(2, "Snack", "Protein bar, Green tea", 200, 15, 22, 6, null);
  insertDiet.run(3, "Breakfast", "Scrambled eggs, Whole wheat toast, Orange juice", 420, 28, 45, 14, null);
  insertDiet.run(3, "Lunch", "Turkey wrap, Side salad, Fruit cup", 550, 35, 55, 15, null);
  insertDiet.run(3, "Dinner", "Lean beef steak, Mashed potatoes, Green beans", 620, 45, 50, 18, null);
  insertDiet.run(3, "Snack", "Trail mix, Banana", 280, 8, 35, 14, null);

  // Seed attendance
  const insertAttendance = db.prepare("INSERT INTO attendance (member_id, check_in_time, check_out_time, date) VALUES (?, ?, ?, ?)");
  const alexDates = ["2026-01-28","2026-01-29","2026-01-30","2026-02-01","2026-02-02","2026-02-03","2026-02-04","2026-02-05","2026-02-07","2026-02-08","2026-02-09","2026-02-10","2026-02-11","2026-02-12","2026-02-14","2026-02-15","2026-02-16","2026-02-17","2026-02-18","2026-02-19","2026-02-20","2026-02-21","2026-02-22","2026-02-24","2026-02-25"];
  alexDates.forEach(d => insertAttendance.run(1, "06:30", "08:15", d));
  const sarahDates = ["2026-01-28","2026-01-30","2026-02-01","2026-02-03","2026-02-05","2026-02-07","2026-02-09","2026-02-11","2026-02-13","2026-02-14","2026-02-16","2026-02-17","2026-02-18","2026-02-19","2026-02-20"];
  sarahDates.forEach(d => insertAttendance.run(2, "17:00", "18:30", d));
  const mikeDates = ["2026-01-29","2026-02-01","2026-02-04","2026-02-07","2026-02-10"];
  mikeDates.forEach(d => insertAttendance.run(3, "20:30", "21:45", d));

  // Seed trainer notes
  const insertNote = db.prepare("INSERT INTO trainer_notes (member_id, trainer_id, note, created_at) VALUES (?, ?, ?, ?)");
  insertNote.run(1, 1, "Alex is progressing well on his bench press. Increased to 100kg this week. Form is excellent.", "2026-02-24 10:00:00");
  insertNote.run(1, 1, "Recommended creatine supplementation. Discussed meal timing around workouts.", "2026-02-20 09:30:00");
  insertNote.run(1, 1, "Slight shoulder discomfort reported. Adjusted overhead press form. Monitor next session.", "2026-02-15 08:45:00");
  insertNote.run(2, 2, "Sarah hit her 5km run target today. Moving to interval training next week.", "2026-02-19 18:00:00");
  insertNote.run(2, 2, "Great consistency this month. Body fat down 2%. Keep current diet plan.", "2026-02-14 17:30:00");
  insertNote.run(3, 1, "Mike missed 3 sessions this week. Sent follow-up message. Needs motivation.", "2026-02-10 21:00:00");
  insertNote.run(3, 1, "Discussed reducing workout intensity to prevent burnout. Suggested group classes.", "2026-02-04 20:30:00");

  // Seed payments
  const insertPayment = db.prepare("INSERT INTO payments (member_id, amount, type, status, date, description) VALUES (?, ?, ?, ?, ?, ?)");
  insertPayment.run(1, 5000, "membership", "paid", "2026-02-01", "Premium Monthly - Feb 2026");
  insertPayment.run(1, 5000, "membership", "paid", "2026-01-01", "Premium Monthly - Jan 2026");
  insertPayment.run(1, 5000, "membership", "paid", "2025-12-01", "Premium Monthly - Dec 2025");
  insertPayment.run(1, 1200, "supplement", "paid", "2026-02-15", "Whey Protein Isolate 2kg");
  insertPayment.run(1, 800, "supplement", "paid", "2026-01-20", "Creatine Monohydrate");
  insertPayment.run(1, 2000, "personal_training", "paid", "2026-02-10", "4 PT Sessions Package");
  insertPayment.run(2, 3000, "membership", "paid", "2026-02-01", "Standard Monthly - Feb 2026");
  insertPayment.run(2, 3000, "membership", "paid", "2026-01-01", "Standard Monthly - Jan 2026");
  insertPayment.run(2, 3000, "membership", "paid", "2025-12-01", "Standard Monthly - Dec 2025");
  insertPayment.run(2, 600, "supplement", "paid", "2026-02-05", "BCAA Powder");
  insertPayment.run(3, 1500, "membership", "overdue", "2026-02-01", "Basic Monthly - Feb 2026");
  insertPayment.run(3, 1500, "membership", "paid", "2026-01-01", "Basic Monthly - Jan 2026");
  insertPayment.run(3, 1500, "membership", "paid", "2025-12-01", "Basic Monthly - Dec 2025");
  insertPayment.run(3, 1500, "membership", "pending", "2025-11-01", "Basic Monthly - Nov 2025");

  // Seed inventory
  const insertInventory = db.prepare("INSERT INTO inventory (item_name, stock_level, max_stock, category, type, status, price, condition, last_restock, location) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
  // Equipment
  insertInventory.run("Treadmill", 8, 10, "Cardio", "equipment", "in_stock", 85000, "Good", "2025-06-15", "Cardio Zone");
  insertInventory.run("Elliptical Trainer", 5, 6, "Cardio", "equipment", "in_stock", 65000, "Good", "2025-06-15", "Cardio Zone");
  insertInventory.run("Stationary Bike", 6, 8, "Cardio", "equipment", "low_stock", 45000, "Fair", "2025-04-10", "Cardio Zone");
  insertInventory.run("Flat Bench", 6, 6, "Strength", "equipment", "in_stock", 15000, "Excellent", "2025-08-01", "Free Weights");
  insertInventory.run("Adjustable Dumbbell Set", 10, 12, "Strength", "equipment", "in_stock", 8000, "Good", "2025-09-20", "Free Weights");
  insertInventory.run("Barbell (Olympic)", 8, 8, "Strength", "equipment", "in_stock", 12000, "Excellent", "2025-09-20", "Free Weights");
  insertInventory.run("Smith Machine", 2, 2, "Strength", "equipment", "in_stock", 120000, "Good", "2025-03-10", "Machine Area");
  insertInventory.run("Cable Crossover", 2, 2, "Strength", "equipment", "in_stock", 95000, "Good", "2025-03-10", "Machine Area");
  insertInventory.run("Leg Press Machine", 2, 3, "Strength", "equipment", "low_stock", 75000, "Fair", "2025-01-20", "Machine Area");
  insertInventory.run("Yoga Mat", 15, 30, "Accessories", "equipment", "low_stock", 500, "Good", "2026-01-10", "Studio");
  insertInventory.run("Resistance Bands Set", 8, 20, "Accessories", "equipment", "low_stock", 300, "Good", "2026-01-10", "Studio");
  insertInventory.run("Foam Roller", 10, 15, "Accessories", "equipment", "in_stock", 800, "Excellent", "2026-02-01", "Stretching Area");
  // Products / Supplements
  insertInventory.run("Whey Protein Isolate 2kg", 25, 50, "Supplements", "product", "in_stock", 1200, null, "2026-02-15", "Front Desk");
  insertInventory.run("Creatine Monohydrate 500g", 18, 40, "Supplements", "product", "in_stock", 800, null, "2026-02-15", "Front Desk");
  insertInventory.run("BCAA Powder 300g", 8, 30, "Supplements", "product", "low_stock", 600, null, "2026-01-20", "Front Desk");
  insertInventory.run("Pre-Workout Mix", 5, 25, "Supplements", "product", "low_stock", 900, null, "2026-01-20", "Front Desk");
  insertInventory.run("Energy Drinks (Pack)", 30, 100, "Beverages", "product", "in_stock", 150, null, "2026-02-20", "Vending Area");
  insertInventory.run("Protein Bar (Box of 12)", 12, 40, "Supplements", "product", "low_stock", 350, null, "2026-02-10", "Front Desk");
  insertInventory.run("Gym Gloves", 15, 30, "Accessories", "product", "in_stock", 250, null, "2026-02-01", "Front Desk");
  insertInventory.run("Shaker Bottle", 20, 50, "Accessories", "product", "in_stock", 200, null, "2026-02-01", "Front Desk");
  insertInventory.run("Wrist Wraps", 10, 25, "Accessories", "product", "in_stock", 180, null, "2026-01-15", "Front Desk");
  insertInventory.run("Lifting Belt", 3, 10, "Accessories", "product", "low_stock", 1500, null, "2025-12-20", "Front Desk");

  // Additional revenue data for charts
  // Nov 2025
  insertRevenue.run(5000, "Memberships", "2025-11-01", 1);
  insertRevenue.run(3000, "Memberships", "2025-11-01", 2);
  insertRevenue.run(1500, "Memberships", "2025-11-01", 3);
  insertRevenue.run(900, "Supplements", "2025-11-05", 1);
  insertRevenue.run(2000, "Personal Training", "2025-11-10", 1);
  insertRevenue.run(600, "Supplements", "2025-11-15", 2);
  insertRevenue.run(400, "Other", "2025-11-20", null);
  // Dec 2025
  insertRevenue.run(5000, "Memberships", "2025-12-01", 1);
  insertRevenue.run(3000, "Memberships", "2025-12-01", 2);
  insertRevenue.run(1500, "Memberships", "2025-12-01", 3);
  insertRevenue.run(1200, "Supplements", "2025-12-10", 1);
  insertRevenue.run(800, "Supplements", "2025-12-15", 3);
  insertRevenue.run(2000, "Personal Training", "2025-12-05", 2);
  insertRevenue.run(500, "Other", "2025-12-20", null);
  // Jan 2026
  insertRevenue.run(5000, "Memberships", "2026-01-01", 1);
  insertRevenue.run(3000, "Memberships", "2026-01-01", 2);
  insertRevenue.run(1500, "Memberships", "2026-01-01", 3);
  insertRevenue.run(800, "Supplements", "2026-01-10", 1);
  insertRevenue.run(2000, "Personal Training", "2026-01-15", 1);
  insertRevenue.run(350, "Supplements", "2026-01-20", 2);
  insertRevenue.run(600, "Other", "2026-01-25", null);
  // Feb 2026 (additional)
  insertRevenue.run(5000, "Memberships", "2026-02-01", 1);
  insertRevenue.run(3000, "Memberships", "2026-02-01", 2);
  insertRevenue.run(1500, "Memberships", "2026-02-01", 3);
  insertRevenue.run(2000, "Personal Training", "2026-02-10", 1);
  insertRevenue.run(900, "Supplements", "2026-02-18", 2);
  insertRevenue.run(350, "Other", "2026-02-22", null);

  // Seed staff attendance (Feb 2026 - working days)
  const insertStaffAtt = db.prepare("INSERT INTO staff_attendance (staff_id, date, status, check_in, check_out) VALUES (?, ?, ?, ?, ?)");
  const febWorkDays = [
    "2026-02-02","2026-02-03","2026-02-04","2026-02-05","2026-02-06",
    "2026-02-09","2026-02-10","2026-02-11","2026-02-12","2026-02-13",
    "2026-02-16","2026-02-17","2026-02-18","2026-02-19","2026-02-20",
    "2026-02-23","2026-02-24","2026-02-25","2026-02-26","2026-02-27"
  ];
  // Raj Patel (id=1): 2 leaves, 1 half-day, rest present
  febWorkDays.forEach((d, i) => {
    if (i === 5 || i === 14) insertStaffAtt.run(1, d, "leave", null, null);
    else if (i === 10) insertStaffAtt.run(1, d, "half_day", "06:00", "12:00");
    else insertStaffAtt.run(1, d, "present", "06:00", "14:00");
  });
  // Priya Sharma (id=2): 3 leaves, 1 half-day, 1 absent, rest present
  febWorkDays.forEach((d, i) => {
    if (i === 2 || i === 8 || i === 17) insertStaffAtt.run(2, d, "leave", null, null);
    else if (i === 12) insertStaffAtt.run(2, d, "half_day", "07:00", "13:00");
    else if (i === 19) insertStaffAtt.run(2, d, "absent", null, null);
    else insertStaffAtt.run(2, d, "present", "07:00", "15:00");
  });
  // David Kim (id=3): 1 leave, rest present
  febWorkDays.forEach((d, i) => {
    if (i === 7) insertStaffAtt.run(3, d, "leave", null, null);
    else insertStaffAtt.run(3, d, "present", "08:00", "16:00");
  });
  // Jan 2026 data for salary history
  const janWorkDays = [
    "2026-01-02","2026-01-05","2026-01-06","2026-01-07","2026-01-08","2026-01-09",
    "2026-01-12","2026-01-13","2026-01-14","2026-01-15","2026-01-16",
    "2026-01-19","2026-01-20","2026-01-21","2026-01-22","2026-01-23",
    "2026-01-26","2026-01-27","2026-01-28","2026-01-29","2026-01-30"
  ];
  janWorkDays.forEach((d, i) => {
    if (i === 3 || i === 15) insertStaffAtt.run(1, d, "leave", null, null);
    else insertStaffAtt.run(1, d, "present", "06:00", "14:00");
    if (i === 6 || i === 11 || i === 18) insertStaffAtt.run(2, d, "leave", null, null);
    else insertStaffAtt.run(2, d, "present", "07:00", "15:00");
    if (i === 9) insertStaffAtt.run(3, d, "leave", null, null);
    else insertStaffAtt.run(3, d, "present", "08:00", "16:00");
  });

  // Seed schedule
  const insertSchedule = db.prepare("INSERT INTO schedule (class_name, trainer_id, day_of_week, start_time, end_time, capacity, enrolled, location, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
  // Monday
  insertSchedule.run("Morning Yoga", 2, "Monday", "06:00", "07:00", 25, 18, "Studio A", "Flexibility");
  insertSchedule.run("HIIT Blast", 1, "Monday", "07:30", "08:30", 20, 20, "Main Floor", "Cardio");
  insertSchedule.run("Spin Class", 2, "Monday", "17:00", "18:00", 15, 12, "Spin Room", "Cardio");
  insertSchedule.run("Boxing Fundamentals", 1, "Monday", "18:30", "19:30", 16, 14, "Boxing Ring", "Combat");
  // Tuesday
  insertSchedule.run("Pilates Core", 2, "Tuesday", "06:30", "07:30", 20, 15, "Studio A", "Flexibility");
  insertSchedule.run("CrossFit WOD", 1, "Tuesday", "08:00", "09:00", 12, 12, "CrossFit Zone", "Strength");
  insertSchedule.run("Zumba", 2, "Tuesday", "17:30", "18:30", 30, 25, "Studio A", "Dance");
  insertSchedule.run("Strength Training", 1, "Tuesday", "19:00", "20:00", 15, 10, "Free Weights", "Strength");
  // Wednesday
  insertSchedule.run("Power Yoga", 2, "Wednesday", "06:00", "07:00", 25, 20, "Studio A", "Flexibility");
  insertSchedule.run("HIIT Blast", 1, "Wednesday", "07:30", "08:30", 20, 18, "Main Floor", "Cardio");
  insertSchedule.run("Nutrition Workshop", 3, "Wednesday", "12:00", "13:00", 20, 8, "Conference Room", "Education");
  insertSchedule.run("Spin Class", 2, "Wednesday", "17:00", "18:00", 15, 14, "Spin Room", "Cardio");
  // Thursday
  insertSchedule.run("Pilates Core", 2, "Thursday", "06:30", "07:30", 20, 16, "Studio A", "Flexibility");
  insertSchedule.run("CrossFit WOD", 1, "Thursday", "08:00", "09:00", 12, 11, "CrossFit Zone", "Strength");
  insertSchedule.run("Boxing Fundamentals", 1, "Thursday", "18:00", "19:00", 16, 13, "Boxing Ring", "Combat");
  insertSchedule.run("Zumba", 2, "Thursday", "19:30", "20:30", 30, 22, "Studio A", "Dance");
  // Friday
  insertSchedule.run("Morning Yoga", 2, "Friday", "06:00", "07:00", 25, 15, "Studio A", "Flexibility");
  insertSchedule.run("HIIT Blast", 1, "Friday", "07:30", "08:30", 20, 17, "Main Floor", "Cardio");
  insertSchedule.run("Open Gym", null, "Friday", "12:00", "14:00", 50, 30, "Main Floor", "Open");
  insertSchedule.run("Strength Training", 1, "Friday", "17:00", "18:00", 15, 12, "Free Weights", "Strength");
  // Saturday
  insertSchedule.run("Weekend Warriors HIIT", 1, "Saturday", "08:00", "09:30", 25, 22, "Main Floor", "Cardio");
  insertSchedule.run("Yoga Flow", 2, "Saturday", "10:00", "11:00", 25, 20, "Studio A", "Flexibility");
  insertSchedule.run("Open Gym", null, "Saturday", "11:00", "15:00", 50, 35, "Main Floor", "Open");
  // Sunday
  insertSchedule.run("Gentle Yoga", 2, "Sunday", "09:00", "10:00", 25, 12, "Studio A", "Flexibility");
  insertSchedule.run("Open Gym", null, "Sunday", "10:00", "14:00", 50, 20, "Main Floor", "Open");
}

// Seed workout programs if empty
const programCount = db.prepare("SELECT COUNT(*) as count FROM workout_programs").get() as { count: number };
if (programCount.count === 0) {
  const insertProgram = db.prepare("INSERT INTO workout_programs (name, level, goal, duration, days_per_week, rest_time, color) VALUES (?, ?, ?, ?, ?, ?, ?)");
  insertProgram.run("Beginner Routine", "Beginner", "Fat Loss + Basic Fitness", "40–50 min", "3–4 Days/Week", "30–45 sec", "emerald");
  insertProgram.run("Intermediate Routine", "Intermediate", "Muscle Gain", "60–70 min", "4–5 Days/Week", "60–90 sec", "amber");
  insertProgram.run("Advanced Routine", "Advanced", "Strength & Conditioning", "70–90 min", "5–6 Days/Week", "90–120 sec", "rose");

  const insertExercise = db.prepare("INSERT INTO program_exercises (program_id, section, exercise_name, type, min_value, max_value, unit, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");

  // Program 1 - Beginner: Warm-Up
  insertExercise.run(1, "warm_up", "Cycling", "time_slider", 5, 10, "mins", 0);
  insertExercise.run(1, "warm_up", "Jump Rope", "reps", 50, 100, "reps", 1);
  insertExercise.run(1, "warm_up", "Arm Circles", "time", 30, 60, "sec", 2);
  // Program 1 - Beginner: Main Workout
  insertExercise.run(1, "main", "Bodyweight Squats", "reps", 12, 15, "reps", 0);
  insertExercise.run(1, "main", "Push-ups", "reps", 10, 15, "reps", 1);
  insertExercise.run(1, "main", "Lunges", "reps", 10, 10, "each leg", 2);
  insertExercise.run(1, "main", "Dumbbell Shoulder Press", "reps", 10, 12, "reps", 3);
  insertExercise.run(1, "main", "Plank", "time", 20, 40, "sec", 4);
  // Program 1 - Beginner: Cool Down
  insertExercise.run(1, "cool_down", "Stretching", "time", 5, 7, "mins", 0);

  // Program 2 - Intermediate: Warm-Up
  insertExercise.run(2, "warm_up", "Cycling", "time_slider", 5, 15, "mins", 0);
  insertExercise.run(2, "warm_up", "Jump Rope", "reps", 100, 200, "reps", 1);
  // Program 2 - Intermediate: Strength Block
  insertExercise.run(2, "main", "Barbell Squats", "reps", 8, 12, "reps", 0);
  insertExercise.run(2, "main", "Bench Press", "reps", 8, 12, "reps", 1);
  insertExercise.run(2, "main", "Lat Pulldown", "reps", 8, 12, "reps", 2);
  insertExercise.run(2, "main", "Romanian Deadlift", "reps", 8, 12, "reps", 3);
  insertExercise.run(2, "main", "Mountain Climbers", "time", 30, 45, "sec", 4);
  insertExercise.run(2, "main", "Plank", "time", 40, 60, "sec", 5);

  // Program 3 - Advanced: Warm-Up
  insertExercise.run(3, "warm_up", "Rowing Machine", "time", 5, 15, "mins", 0);
  insertExercise.run(3, "warm_up", "Jump Rope", "reps", 200, 300, "reps", 1);
  // Program 3 - Advanced: Heavy Block
  insertExercise.run(3, "main", "Deadlift", "reps", 4, 8, "reps", 0);
  insertExercise.run(3, "main", "Barbell Squats", "reps", 4, 8, "reps", 1);
  insertExercise.run(3, "main", "Bench Press", "reps", 4, 8, "reps", 2);
  insertExercise.run(3, "main", "Pull-ups", "reps", 6, 10, "reps", 3);
  insertExercise.run(3, "main", "Battle Rope", "time", 30, 60, "sec", 4);
  insertExercise.run(3, "main", "Plank Hold", "time", 60, 90, "sec", 5);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/dashboard/stats", (req, res) => {
    const stats = {
      presentToday: 42,
      todayRevenue: db.prepare("SELECT SUM(amount) as total FROM revenue WHERE date = CURRENT_DATE").get(),
      expiringSoon: db.prepare("SELECT COUNT(*) as count FROM members WHERE status = 'expiring'").get(),
      birthdays: 3,
      growth: 12.5
    };
    res.json(stats);
  });

  app.get("/api/inventory", (req, res) => {
    const items = db.prepare("SELECT * FROM inventory ORDER BY category, item_name").all() as any[];

    const totalItems = items.length;
    const totalEquipment = items.filter(i => i.type === 'equipment').length;
    const totalProducts = items.filter(i => i.type === 'product').length;
    const lowStockCount = items.filter(i => i.status === 'low_stock').length;
    const totalValue = items.reduce((sum, i) => sum + (i.price * i.stock_level), 0);

    const categoryBreakdown = items.reduce((acc: any[], i: any) => {
      const existing = acc.find(c => c.category === i.category);
      if (existing) { existing.count++; existing.value += i.price * i.stock_level; }
      else acc.push({ category: i.category, count: 1, value: i.price * i.stock_level });
      return acc;
    }, []);

    res.json({
      items,
      stats: { totalItems, totalEquipment, totalProducts, lowStockCount, totalValue },
      categoryBreakdown
    });
  });

  app.get("/api/members", (req, res) => {
    const members = db.prepare("SELECT * FROM members").all();
    res.json(members);
  });

  app.post("/api/members", (req, res) => {
    const { name, email, membership_type, expiry_date, goal, age, height, weight, body_target, timing } = req.body;
    try {
      const info = db.prepare(
        "INSERT INTO members (name, email, status, membership_type, expiry_date, join_date, goal, age, height, weight, body_target, timing) VALUES (?, ?, ?, ?, ?, CURRENT_DATE, ?, ?, ?, ?, ?, ?)"
      ).run(name, email, 'active', membership_type, expiry_date, goal, age || null, height || null, weight || null, body_target || null, timing || null);

      const newMember = db.prepare("SELECT * FROM members WHERE id = ?").get(info.lastInsertRowid);
      res.status(201).json(newMember);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/members/:id", (req, res) => {
    const { id } = req.params;
    const { name, email, membership_type, expiry_date, goal, status } = req.body;
    try {
      db.prepare(
        "UPDATE members SET name = ?, email = ?, membership_type = ?, expiry_date = ?, goal = ?, status = ? WHERE id = ?"
      ).run(name, email, membership_type, expiry_date, goal, status, id);
      const updated = db.prepare("SELECT * FROM members WHERE id = ?").get(id);
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/members/:id", (req, res) => {
    const { id } = req.params;
    try {
      const result = db.prepare("DELETE FROM members WHERE id = ?").run(id);
      if (result.changes === 0) {
        res.status(404).json({ error: "Member not found" });
      } else {
        res.json({ success: true });
      }
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/staff", (req, res) => {
    const staff = db.prepare(`
      SELECT s.*,
        (SELECT COUNT(*) FROM members m WHERE m.trainer_id = s.id) as assigned_members,
        (SELECT COUNT(*) FROM trainer_notes tn WHERE tn.trainer_id = s.id AND tn.created_at >= datetime('now', '-30 days')) as recent_notes_count,
        (SELECT GROUP_CONCAT(m.name, '||') FROM members m WHERE m.trainer_id = s.id) as member_names,
        (SELECT GROUP_CONCAT(m.id, '||') FROM members m WHERE m.trainer_id = s.id) as member_ids
      FROM staff s
      ORDER BY s.performance_rating DESC
    `).all();

    const totalStaff = staff.length;
    const avgRating = totalStaff > 0 ? Number(((staff as any[]).reduce((sum, s) => sum + (s as any).performance_rating, 0) / totalStaff).toFixed(1)) : 0;
    const totalSalary = (staff as any[]).reduce((sum, s) => sum + (s as any).salary, 0);
    const totalAssigned = (staff as any[]).reduce((sum, s) => sum + (s as any).assigned_members, 0);

    // Per-staff attendance summary for current month & auto salary
    const staffWithAttendance = (staff as any[]).map((s: any) => {
      const monthAtt = db.prepare(`
        SELECT status, COUNT(*) as count FROM staff_attendance
        WHERE staff_id = ? AND strftime('%Y-%m', date) = strftime('%Y-%m', 'now')
        GROUP BY status
      `).all(s.id) as any[];
      const present = monthAtt.find((a: any) => a.status === 'present')?.count || 0;
      const leave = monthAtt.find((a: any) => a.status === 'leave')?.count || 0;
      const absent = monthAtt.find((a: any) => a.status === 'absent')?.count || 0;
      const halfDay = monthAtt.find((a: any) => a.status === 'half_day')?.count || 0;
      const totalWorkDays = present + leave + absent + halfDay;
      const paidLeaves = 2; // 2 paid leaves per month
      const unpaidLeaves = Math.max(0, leave - paidLeaves);
      const perDaySalary = totalWorkDays > 0 ? s.salary / totalWorkDays : 0;
      const deduction = (absent * perDaySalary) + (unpaidLeaves * perDaySalary) + (halfDay * perDaySalary * 0.5);
      const calculatedSalary = Math.round(s.salary - deduction);
      return {
        ...s,
        attendance: { present, leave, absent, halfDay, totalWorkDays, paidLeaves },
        calculatedSalary,
        deduction: Math.round(deduction)
      };
    });

    // Attendance records for calendar view
    const allAttendance = db.prepare(`
      SELECT staff_id, date, status, check_in, check_out FROM staff_attendance
      WHERE strftime('%Y-%m', date) = strftime('%Y-%m', 'now')
      ORDER BY date ASC
    `).all();

    const totalPresent = staffWithAttendance.reduce((sum, s) => sum + s.attendance.present, 0);
    const totalLeaves = staffWithAttendance.reduce((sum, s) => sum + s.attendance.leave, 0);
    const totalAbsent = staffWithAttendance.reduce((sum, s) => sum + s.attendance.absent, 0);

    res.json({
      staff: staffWithAttendance,
      stats: { totalStaff, avgRating, totalSalary, totalAssigned, totalPresent, totalLeaves, totalAbsent },
      attendanceRecords: allAttendance
    });
  });

  app.get("/api/members/:id/profile", (req, res) => {
    const memberId = req.params.id;

    const member = db.prepare("SELECT * FROM members WHERE id = ?").get(memberId) as any;
    if (!member) return res.status(404).json({ error: "Member not found" });

    const dietPlan = db.prepare(
      "SELECT * FROM diet_plans WHERE member_id = ? ORDER BY CASE meal_type WHEN 'Breakfast' THEN 1 WHEN 'Lunch' THEN 2 WHEN 'Dinner' THEN 3 WHEN 'Snack' THEN 4 END"
    ).all(memberId);

    const attendance = db.prepare(
      "SELECT * FROM attendance WHERE member_id = ? AND date >= date('now', '-30 days') ORDER BY date DESC"
    ).all(memberId);

    const attendanceByDay = db.prepare(`
      SELECT
        CASE CAST(strftime('%w', date) AS INTEGER)
          WHEN 0 THEN 'Sun' WHEN 1 THEN 'Mon' WHEN 2 THEN 'Tue'
          WHEN 3 THEN 'Wed' WHEN 4 THEN 'Thu' WHEN 5 THEN 'Fri' WHEN 6 THEN 'Sat'
        END as day,
        COUNT(*) as visits
      FROM attendance
      WHERE member_id = ? AND date >= date('now', '-30 days')
      GROUP BY strftime('%w', date)
      ORDER BY CAST(strftime('%w', date) AS INTEGER)
    `).all(memberId);

    const trainerNotes = db.prepare(
      "SELECT tn.*, s.name as trainer_name FROM trainer_notes tn LEFT JOIN staff s ON tn.trainer_id = s.id WHERE tn.member_id = ? ORDER BY tn.created_at DESC"
    ).all(memberId);

    const payments = db.prepare(
      "SELECT * FROM payments WHERE member_id = ? ORDER BY date DESC LIMIT 12"
    ).all(memberId) as any[];

    const supplements = db.prepare(
      "SELECT * FROM payments WHERE member_id = ? AND type = 'supplement' ORDER BY date DESC"
    ).all(memberId);

    const paymentsByMonth = db.prepare(`
      SELECT strftime('%Y-%m', date) as month,
             SUM(amount) as total,
             SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as paid,
             SUM(CASE WHEN status != 'paid' THEN amount ELSE 0 END) as unpaid
      FROM payments WHERE member_id = ?
      GROUP BY strftime('%Y-%m', date)
      ORDER BY month DESC LIMIT 6
    `).all(memberId);

    // Risk of quitting calculation
    const totalAttendanceLast30 = attendance.length;
    const daysSinceLastVisit = member.last_visit
      ? Math.floor((Date.now() - new Date(member.last_visit).getTime()) / (1000 * 60 * 60 * 24))
      : 999;
    const daysUntilExpiry = member.expiry_date
      ? Math.floor((new Date(member.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : 0;
    const overduePayments = payments.filter((p: any) => p.status === "overdue").length;
    const pendingPayments = payments.filter((p: any) => p.status === "pending").length;

    let riskScore = 0;
    riskScore += Math.max(0, (10 - totalAttendanceLast30)) * 3;
    riskScore += Math.min(25, Math.max(0, (daysSinceLastVisit - 3)) * 3);
    riskScore += daysUntilExpiry < 15 ? Math.max(0, (15 - daysUntilExpiry)) : 0;
    riskScore += Math.min(30, overduePayments * 15);
    riskScore += Math.min(10, pendingPayments * 5);
    riskScore = Math.min(100, Math.max(0, riskScore));

    res.json({
      member,
      dietPlan,
      attendance,
      attendanceByDay,
      trainerNotes,
      payments,
      paymentsByMonth: (paymentsByMonth as any[]).reverse(),
      supplements,
      riskScore,
      riskFactors: {
        attendanceRate: totalAttendanceLast30,
        daysSinceLastVisit,
        daysUntilExpiry,
        overduePayments,
        pendingPayments
      }
    });
  });

  app.get("/api/revenue/pulse", (req, res) => {
    const pulse = db.prepare("SELECT date, SUM(amount) as total FROM revenue GROUP BY date ORDER BY date DESC LIMIT 7").all();
    res.json(pulse.reverse());
  });

  app.get("/api/revenue/details", (req, res) => {
    const totalRevenue = db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM revenue").get() as any;
    const thisMonthRevenue = db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM revenue WHERE strftime('%Y-%m', date) = strftime('%Y-%m', 'now')").get() as any;
    const lastMonthRevenue = db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM revenue WHERE strftime('%Y-%m', date) = strftime('%Y-%m', 'now', '-1 month')").get() as any;
    const membershipRevenue = db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM revenue WHERE category = 'Memberships'").get() as any;
    const supplementRevenue = db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM revenue WHERE category = 'Supplements'").get() as any;
    const ptRevenue = db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM revenue WHERE category = 'Personal Training'").get() as any;

    const revenueGrowth = lastMonthRevenue.total > 0
      ? Number(((thisMonthRevenue.total - lastMonthRevenue.total) / lastMonthRevenue.total * 100).toFixed(1))
      : 0;

    const monthlyRevenue = db.prepare(`
      SELECT strftime('%Y-%m', date) as month,
             COALESCE(SUM(CASE WHEN category = 'Memberships' THEN amount ELSE 0 END), 0) as memberships,
             COALESCE(SUM(CASE WHEN category = 'Supplements' THEN amount ELSE 0 END), 0) as supplements,
             COALESCE(SUM(CASE WHEN category = 'Personal Training' THEN amount ELSE 0 END), 0) as personal_training,
             COALESCE(SUM(amount), 0) as total
      FROM revenue
      GROUP BY strftime('%Y-%m', date)
      ORDER BY month ASC
    `).all();

    const categoryBreakdown = db.prepare("SELECT category, SUM(amount) as total FROM revenue GROUP BY category ORDER BY total DESC").all();

    const recentTransactions = db.prepare(`
      SELECT r.id, r.amount, r.category, r.date, m.name as member_name
      FROM revenue r LEFT JOIN members m ON r.member_id = m.id
      ORDER BY r.date DESC, r.id DESC LIMIT 10
    `).all();

    // Top paying members
    const topMembers = db.prepare(`
      SELECT m.id, m.name, m.membership_type, m.status,
             COALESCE(SUM(p.amount), 0) as total_paid,
             COUNT(p.id) as transaction_count
      FROM members m
      LEFT JOIN payments p ON p.member_id = m.id AND p.status = 'paid'
      GROUP BY m.id
      ORDER BY total_paid DESC
      LIMIT 5
    `).all();

    // Payment collection status
    const paymentStatus = {
      paid: db.prepare("SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'paid'").get() as any,
      pending: db.prepare("SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'pending'").get() as any,
      overdue: db.prepare("SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'overdue'").get() as any,
    };

    // Month-over-month comparison
    const thisMonthBreakdown = db.prepare(`
      SELECT
        COALESCE(SUM(amount), 0) as total,
        COUNT(*) as transactions,
        COALESCE(SUM(CASE WHEN category = 'Memberships' THEN amount ELSE 0 END), 0) as memberships,
        COALESCE(SUM(CASE WHEN category = 'Supplements' THEN amount ELSE 0 END), 0) as supplements,
        COALESCE(SUM(CASE WHEN category = 'Personal Training' THEN amount ELSE 0 END), 0) as personal_training
      FROM revenue WHERE strftime('%Y-%m', date) = strftime('%Y-%m', 'now')
    `).get() as any;
    const lastMonthBreakdown = db.prepare(`
      SELECT
        COALESCE(SUM(amount), 0) as total,
        COUNT(*) as transactions,
        COALESCE(SUM(CASE WHEN category = 'Memberships' THEN amount ELSE 0 END), 0) as memberships,
        COALESCE(SUM(CASE WHEN category = 'Supplements' THEN amount ELSE 0 END), 0) as supplements,
        COALESCE(SUM(CASE WHEN category = 'Personal Training' THEN amount ELSE 0 END), 0) as personal_training
      FROM revenue WHERE strftime('%Y-%m', date) = strftime('%Y-%m', 'now', '-1 month')
    `).get() as any;

    // Revenue by membership tier
    const tierRevenue = db.prepare(`
      SELECT m.membership_type as tier,
             COUNT(DISTINCT m.id) as member_count,
             COALESCE(SUM(p.amount), 0) as total_revenue
      FROM members m
      LEFT JOIN payments p ON p.member_id = m.id AND p.status = 'paid'
      GROUP BY m.membership_type
      ORDER BY total_revenue DESC
    `).all();

    res.json({
      stats: { totalRevenue: totalRevenue.total, thisMonthRevenue: thisMonthRevenue.total, membershipRevenue: membershipRevenue.total, supplementRevenue: supplementRevenue.total, ptRevenue: ptRevenue.total, revenueGrowth },
      monthlyRevenue,
      categoryBreakdown,
      recentTransactions,
      topMembers,
      paymentStatus,
      monthComparison: { thisMonth: thisMonthBreakdown, lastMonth: lastMonthBreakdown },
      tierRevenue
    });
  });

  app.get("/api/schedule", (req, res) => {
    const classes = db.prepare(`
      SELECT sc.*, s.name as trainer_name
      FROM schedule sc LEFT JOIN staff s ON sc.trainer_id = s.id
      ORDER BY CASE sc.day_of_week
        WHEN 'Monday' THEN 1 WHEN 'Tuesday' THEN 2 WHEN 'Wednesday' THEN 3
        WHEN 'Thursday' THEN 4 WHEN 'Friday' THEN 5 WHEN 'Saturday' THEN 6 WHEN 'Sunday' THEN 7
      END, sc.start_time
    `).all() as any[];

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayName = dayNames[new Date().getDay()];
    const todayClasses = classes.filter(c => c.day_of_week === todayName).length;
    const totalClasses = classes.length;
    const totalCapacity = classes.reduce((sum, c) => sum + c.capacity, 0);
    const totalEnrolled = classes.reduce((sum, c) => sum + c.enrolled, 0);
    const avgEnrollment = totalCapacity > 0 ? Math.round((totalEnrolled / totalCapacity) * 100) : 0;

    res.json({
      classes,
      stats: { totalClasses, todayClasses, totalCapacity, avgEnrollment }
    });
  });

  app.get("/api/programs", (req, res) => {
    const programs = db.prepare("SELECT * FROM workout_programs ORDER BY id").all() as any[];
    const exercises = db.prepare("SELECT * FROM program_exercises ORDER BY program_id, sort_order").all() as any[];

    const programsWithExercises = programs.map((p: any) => ({
      ...p,
      exercises: exercises.filter((e: any) => e.program_id === p.id)
    }));

    const totalExercises = exercises.length;
    const beginnerCount = programs.filter((p: any) => p.level === 'Beginner').length;
    const intermediateCount = programs.filter((p: any) => p.level === 'Intermediate').length;
    const advancedCount = programs.filter((p: any) => p.level === 'Advanced').length;

    res.json({
      programs: programsWithExercises,
      stats: { totalPrograms: programs.length, totalExercises, beginnerCount, intermediateCount, advancedCount }
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
