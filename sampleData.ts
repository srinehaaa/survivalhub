import type { Assignment, AttendanceSubject, Exam, Expense, TimetableClass } from './types';

function dayOffset(days: number): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });

export const sampleAssignments: Assignment[] = [
  {
    id: 'a1',
    name: 'Finance Assignment',
    subject: 'Finance',
    deadline: dayOffset(1),
    progress: 40,
    importance: 'high',
    estimatedMinutes: 90,
    status: 'in-progress',
  },
  {
    id: 'a2',
    name: 'Marketing Presentation',
    subject: 'Marketing',
    deadline: dayOffset(5),
    progress: 20,
    importance: 'medium',
    estimatedMinutes: 60,
    status: 'pending',
  },
  {
    id: 'a3',
    name: 'Operations Case Study',
    subject: 'Operations Management',
    deadline: dayOffset(8),
    progress: 10,
    importance: 'medium',
    estimatedMinutes: 75,
    status: 'pending',
  },
  {
    id: 'a4',
    name: 'MIS Lab Report',
    subject: 'MIS',
    deadline: dayOffset(3),
    progress: 55,
    importance: 'high',
    estimatedMinutes: 50,
    status: 'in-progress',
  },
];

export const sampleAttendance: AttendanceSubject[] = [
  { id: 's1', name: 'Finance', attended: 43, conducted: 50 },
  { id: 's2', name: 'MIS', attended: 38, conducted: 47 },
  { id: 's3', name: 'Marketing', attended: 32, conducted: 42 },
  { id: 's4', name: 'Operations Management', attended: 27, conducted: 38 },
];

export const sampleExams: Exam[] = [
  {
    id: 'e1',
    name: 'Finance Exam',
    subject: 'Finance',
    date: dayOffset(4),
    prepProgress: 75,
    topics: [
      { id: 't1', name: 'Final Accounts', status: 'completed' },
      { id: 't2', name: 'Cash Flow Statement', status: 'completed' },
      { id: 't3', name: 'Ratio Analysis', status: 'needs-revision' },
      { id: 't4', name: 'Working Capital', status: 'not-started' },
    ],
  },
  {
    id: 'e2',
    name: 'MIS Exam',
    subject: 'MIS',
    date: dayOffset(6),
    prepProgress: 50,
    topics: [
      { id: 't5', name: 'Database Concepts', status: 'completed' },
      { id: 't6', name: 'ERP Systems', status: 'needs-revision' },
      { id: 't7', name: 'Data Warehousing', status: 'not-started' },
      { id: 't8', name: 'Business Intelligence', status: 'not-started' },
    ],
  },
  {
    id: 'e3',
    name: 'Marketing Exam',
    subject: 'Marketing',
    date: dayOffset(12),
    prepProgress: 30,
    topics: [
      { id: 't9', name: 'Market Segmentation', status: 'completed' },
      { id: 't10', name: 'Consumer Behavior', status: 'needs-revision' },
      { id: 't11', name: 'Brand Positioning', status: 'not-started' },
    ],
  },
];

export const sampleTimetable: TimetableClass[] = [
  { id: 'c1', subject: 'Finance', dayOfWeek: todayName, startTime: '10:00', endTime: '11:30', room: 'Room 204', color: 'emerald' },
  { id: 'c2', subject: 'MIS', dayOfWeek: todayName, startTime: '12:00', endTime: '13:30', room: 'Lab 3', color: 'sky' },
  { id: 'c3', subject: 'Marketing', dayOfWeek: todayName, startTime: '14:00', endTime: '15:30', room: 'Room 110', color: 'amber' },
  { id: 'c4', subject: 'Operations Management', dayOfWeek: todayName, startTime: '16:00', endTime: '17:30', room: 'Room 204', color: 'violet' },
];

export const sampleExpenses: Expense[] = [
  { id: 'x1', category: 'Food', description: 'Monthly meals', amount: 3200, expenseDate: dayOffset(0), color: 'emerald', icon: 'Utensils' },
  { id: 'x2', category: 'Travel', description: 'Commute', amount: 1800, expenseDate: dayOffset(0), color: 'sky', icon: 'Bus' },
  { id: 'x3', category: 'Shopping', description: 'Supplies', amount: 2000, expenseDate: dayOffset(0), color: 'violet', icon: 'ShoppingBag' },
  { id: 'x4', category: 'Entertainment', description: 'Movies & outings', amount: 1200, expenseDate: dayOffset(0), color: 'amber', icon: 'Clapperboard' },
  { id: 'x5', category: 'Stationery', description: 'Books & supplies', amount: 1000, expenseDate: dayOffset(0), color: 'rose', icon: 'PenTool' },
];

export const DEFAULT_BUDGET = 15000;
export const DEFAULT_MIN_ATTENDANCE = 75;
