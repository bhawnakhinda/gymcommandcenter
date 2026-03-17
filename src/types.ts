export interface Member {
  id: number;
  name: string;
  email: string;
  status: 'active' | 'expiring' | 'due' | 'new';
  membership_type: string;
  expiry_date: string;
  join_date: string;
  last_visit?: string;
  goal?: string;
  trainer_id?: number;
  age?: number;
  height?: string;
  weight?: string;
  body_target?: string;
  timing?: string;
}

export interface DashboardStats {
  presentToday: number;
  todayRevenue: { total: number | null };
  expiringSoon: { count: number };
  birthdays: number;
  growth: number;
}

export interface RevenuePulse {
  date: string;
  total: number;
}

export interface DietPlan {
  id: number;
  member_id: number;
  meal_type: string;
  food_items: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  notes: string | null;
}

export interface AttendanceByDay {
  day: string;
  visits: number;
}

export interface TrainerNote {
  id: number;
  member_id: number;
  trainer_id: number;
  trainer_name: string;
  note: string;
  created_at: string;
}

export interface Payment {
  id: number;
  member_id: number;
  amount: number;
  type: string;
  status: string;
  date: string;
  description: string | null;
}

export interface PaymentByMonth {
  month: string;
  total: number;
  paid: number;
  unpaid: number;
}

export interface MemberProfile {
  member: Member;
  dietPlan: DietPlan[];
  attendanceByDay: AttendanceByDay[];
  trainerNotes: TrainerNote[];
  payments: Payment[];
  paymentsByMonth: PaymentByMonth[];
  supplements: Payment[];
  riskScore: number;
  riskFactors: {
    attendanceRate: number;
    daysSinceLastVisit: number;
    daysUntilExpiry: number;
    overduePayments: number;
    pendingPayments: number;
  };
}

export interface StaffAttendanceSummary {
  present: number;
  leave: number;
  absent: number;
  halfDay: number;
  totalWorkDays: number;
  paidLeaves: number;
}

export interface StaffAttendanceRecord {
  staff_id: number;
  date: string;
  status: 'present' | 'leave' | 'absent' | 'half_day';
  check_in: string | null;
  check_out: string | null;
}

export interface StaffMember {
  id: number;
  name: string;
  role: string;
  salary: number;
  performance_rating: number;
  assigned_members: number;
  recent_notes_count: number;
  member_names: string | null;
  member_ids: string | null;
  attendance: StaffAttendanceSummary;
  calculatedSalary: number;
  deduction: number;
}

export interface StaffData {
  staff: StaffMember[];
  stats: {
    totalStaff: number;
    avgRating: number;
    totalSalary: number;
    totalAssigned: number;
    totalPresent: number;
    totalLeaves: number;
    totalAbsent: number;
  };
  attendanceRecords: StaffAttendanceRecord[];
}

export interface InventoryItem {
  id: number;
  item_name: string;
  stock_level: number;
  max_stock: number;
  category: string;
  type: string;
  status: string;
  price: number;
  condition: string | null;
  last_restock: string;
  location: string;
}

export interface InventoryData {
  items: InventoryItem[];
  stats: {
    totalItems: number;
    totalEquipment: number;
    totalProducts: number;
    lowStockCount: number;
    totalValue: number;
  };
  categoryBreakdown: { category: string; count: number; value: number }[];
}

export interface RevenueTransaction {
  id: number;
  amount: number;
  category: string;
  date: string;
  member_name: string | null;
}

export interface TopMember {
  id: number;
  name: string;
  membership_type: string;
  status: string;
  total_paid: number;
  transaction_count: number;
}

export interface TierRevenue {
  tier: string;
  member_count: number;
  total_revenue: number;
}

export interface RevenueData {
  stats: {
    totalRevenue: number;
    thisMonthRevenue: number;
    membershipRevenue: number;
    supplementRevenue: number;
    ptRevenue: number;
    revenueGrowth: number;
  };
  monthlyRevenue: { month: string; memberships: number; supplements: number; personal_training: number; total: number }[];
  categoryBreakdown: { category: string; total: number }[];
  recentTransactions: RevenueTransaction[];
  topMembers: TopMember[];
  paymentStatus: {
    paid: { count: number; total: number };
    pending: { count: number; total: number };
    overdue: { count: number; total: number };
  };
  monthComparison: {
    thisMonth: { total: number; transactions: number; memberships: number; supplements: number; personal_training: number };
    lastMonth: { total: number; transactions: number; memberships: number; supplements: number; personal_training: number };
  };
  tierRevenue: TierRevenue[];
}

export interface ScheduleClass {
  id: number;
  class_name: string;
  trainer_name: string | null;
  day_of_week: string;
  start_time: string;
  end_time: string;
  capacity: number;
  enrolled: number;
  location: string;
  category: string;
}

export interface ScheduleData {
  classes: ScheduleClass[];
  stats: {
    totalClasses: number;
    todayClasses: number;
    totalCapacity: number;
    avgEnrollment: number;
  };
}

export interface ProgramExercise {
  id: number;
  program_id: number;
  section: string;
  exercise_name: string;
  type: string;
  min_value: number;
  max_value: number;
  unit: string;
  sort_order: number;
}

export interface WorkoutProgram {
  id: number;
  name: string;
  level: string;
  goal: string;
  duration: string;
  days_per_week: string;
  rest_time: string;
  color: string;
  exercises: ProgramExercise[];
}

export interface ProgramsData {
  programs: WorkoutProgram[];
  stats: {
    totalPrograms: number;
    totalExercises: number;
    beginnerCount: number;
    intermediateCount: number;
    advancedCount: number;
  };
}
