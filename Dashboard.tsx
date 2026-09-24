import { useState } from 'react';
import {
  CalendarCheck,
  ClipboardList,
  GraduationCap,
  Wallet,
  TrendingUp,
  Clock,
  Target,
  ChevronRight,
  Sparkles,
  Zap,
  Plus,
} from 'lucide-react';
import { Card, StatusBadge, ProgressBar } from '@/components/ui';
import { statusConfig, attendanceStatus } from '@/lib/status';
import { formatDeadline, formatMinutes, daysUntil, greeting } from '@/lib/dateUtils';
import { WEIGHT_LABELS } from '@/lib/priority';
import { useAuth } from '@/lib/auth';
import type { Assignment, AttendanceSubject, Exam, Expense, PriorityTask } from '@/lib/types';

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent,
  onClick,
}: {
  label: string;
  value: string;
  sub: string;
  icon: typeof CalendarCheck;
  accent: string;
  onClick?: () => void;
}) {
  return (
    <Card onClick={onClick} className="p-5 animate-fade-in-up">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-1.5 tracking-tight">{value}</p>
          <p className="text-xs text-slate-500 mt-1">{sub}</p>
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${accent}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </Card>
  );
}

export default function Dashboard({
  assignments,
  attendance,
  exams,
  expenses,
  priorityTasks,
  onNavigate,
  onSeedDemo,
}: {
  assignments: Assignment[];
  attendance: AttendanceSubject[];
  exams: Exam[];
  expenses: Expense[];
  priorityTasks: PriorityTask[];
  onNavigate: (p: 'attendance' | 'assignments' | 'exams' | 'money') => void;
  onSeedDemo: () => Promise<void>;
}) {
  const { profile } = useAuth();
  const [selected, setSelected] = useState<PriorityTask | null>(null);
  const [seeding, setSeeding] = useState(false);

  const studentName = profile?.full_name?.split(' ')[0] ?? 'Student';
  const budget = profile?.monthly_budget ?? 15000;

  const totalAttended = attendance.reduce((s, a) => s + a.attended, 0);
  const totalConducted = attendance.reduce((s, a) => s + a.conducted, 0);
  const overallPct = totalConducted > 0 ? Math.round((totalAttended / totalConducted) * 100) : 0;

  const pending = assignments.filter((a) => a.status !== 'completed');
  const nextExam = exams
    .map((e) => ({ ...e, days: daysUntil(e.date) }))
    .filter((e) => e.days >= 0)
    .sort((a, b) => a.days - b.days)[0];

  const spent = expenses.reduce((s, e) => s + e.amount, 0);
  const top3 = priorityTasks.slice(0, 3);
  const isEmpty = attendance.length === 0 && assignments.length === 0 && exams.length === 0 && expenses.length === 0;

  async function handleSeed() {
    setSeeding(true);
    try {
      await onSeedDemo();
    } catch (err) {
      console.error('Seed error:', err);
    }
    setSeeding(false);
  }

  return (
    <div>
      {/* Greeting */}
      <div className="mb-7 animate-fade-in-up">
        <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600 mb-1">
          <Sparkles className="w-4 h-4" />
          {greeting()}, {studentName}
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Here's what matters today.
        </h1>
        <p className="text-slate-500 mt-1.5 max-w-lg">
          We turned your scattered info into a ranked priority list — so you know exactly what to do next.
        </p>
      </div>

      {/* Empty state — seed demo data */}
      {isEmpty && (
        <Card className="p-8 mb-6 text-center animate-scale-in border-emerald-200 bg-emerald-50/50">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <Plus className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900">Welcome to your hub!</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            You don't have any data yet. Add subjects, assignments, and expenses from the sidebar — or load realistic demo data to explore.
          </p>
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            {seeding ? 'Loading demo data...' : 'Load Demo Data'}
          </button>
        </Card>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Overall Attendance"
          value={totalConducted > 0 ? `${overallPct}%` : '—'}
          sub={totalConducted > 0 ? `${totalAttended} of ${totalConducted} classes` : 'No subjects yet'}
          icon={CalendarCheck}
          accent="bg-emerald-50 text-emerald-600"
          onClick={() => onNavigate('attendance')}
        />
        <StatCard
          label="Pending Assignments"
          value={`${pending.length}`}
          sub={pending.length > 0 ? `${pending.filter((a) => daysUntil(a.deadline) <= 2).length} due soon` : 'All clear'}
          icon={ClipboardList}
          accent="bg-orange-50 text-orange-600"
          onClick={() => onNavigate('assignments')}
        />
        <StatCard
          label="Next Exam"
          value={nextExam ? `${nextExam.days}d` : '—'}
          sub={nextExam ? nextExam.name : 'None scheduled'}
          icon={GraduationCap}
          accent="bg-sky-50 text-sky-600"
          onClick={() => onNavigate('exams')}
        />
        <StatCard
          label="Monthly Spending"
          value={`₹${spent.toLocaleString('en-IN')}`}
          sub={`₹${(budget - spent).toLocaleString('en-IN')} left`}
          icon={Wallet}
          accent="bg-violet-50 text-violet-600"
          onClick={() => onNavigate('money')}
        />
      </div>

      {/* Priority section */}
      <div className="mb-4 flex items-center gap-2">
        <Target className="w-5 h-5 text-slate-900" />
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Your Priority</h2>
        <span className="text-xs text-slate-400 font-medium">— ranked by what needs attention first</span>
      </div>

      {top3.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-sm text-slate-400">No pending tasks. Add assignments or exams to see your priorities ranked here.</p>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-3 gap-4">
          {top3.map((task, i) => {
            const cfg = statusConfig[task.status];
            return (
              <Card
                key={task.id}
                className={`p-5 animate-fade-in-up ${selected?.id === task.id ? 'ring-2 ring-slate-900 ring-offset-1' : ''}`}
                onClick={() => setSelected(selected?.id === task.id ? null : task)}
              >
                <div className="flex items-center justify-between mb-3">
                  <StatusBadge status={task.status} />
                  <span className="text-xs font-semibold text-slate-400">#{i + 1}</span>
                </div>

                <h3 className="font-bold text-slate-900 text-[15px] leading-snug">{task.name}</h3>
                <p className="text-sm text-slate-500 mt-0.5">{task.subject}</p>

                <div className="flex items-center gap-4 mt-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {formatDeadline(task.deadline)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    {formatMinutes(task.estimatedMinutes)}
                  </span>
                </div>

                {/* Priority score */}
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Priority Score</span>
                    <span className={`text-sm font-extrabold ${cfg.text}`}>{task.priorityScore}/100</span>
                  </div>
                  <ProgressBar value={task.priorityScore} barClass={cfg.bar} bgClass={cfg.barBg} />
                </div>

                <button className="mt-4 w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors">
                  Start Now
                  <ChevronRight className="w-4 h-4" />
                </button>
              </Card>
            );
          })}
        </div>
      )}

      {/* Why is this my priority? */}
      {selected && (
        <Card className="mt-5 p-6 animate-scale-in">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-slate-700" />
            <h3 className="font-bold text-slate-900">Why is "{selected.name}" my priority?</h3>
          </div>
          <p className="text-sm text-slate-500 mb-5">
            Your priority score isn't random. It's a weighted model that decides what deserves your attention first.
          </p>

          <div className="space-y-3">
            {WEIGHT_LABELS.map((w) => {
              const detail =
                w.label === 'Deadline urgency'
                  ? `${formatDeadline(selected.deadline)}`
                  : w.label === 'Importance'
                  ? `${selected.importance[0].toUpperCase()}${selected.importance.slice(1)} importance`
                  : w.label === 'Exam proximity'
                  ? selected.type === 'exam'
                    ? `Exam in ${daysUntil(selected.deadline)} days`
                    : 'Subject exam tracked'
                  : `${formatMinutes(selected.estimatedMinutes)} needed`;

              const pct =
                w.label === 'Deadline urgency'
                  ? 40
                  : w.label === 'Importance'
                  ? 25
                  : w.label === 'Exam proximity'
                  ? 20
                  : 15;

              return (
                <div key={w.label} className="flex items-center gap-4">
                  <div className="w-40 shrink-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-700">{w.label}</span>
                      <span className="text-xs font-bold text-slate-400">{w.value}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{detail}</p>
                  </div>
                  <div className="flex-1">
                    <ProgressBar value={pct} barClass="bg-slate-800" bgClass="bg-slate-100" />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-600">Final Priority Score</span>
              <span className={`text-2xl font-extrabold ${statusConfig[selected.status].text}`}>
                {selected.priorityScore}
                <span className="text-sm text-slate-400 font-bold">/100</span>
              </span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
