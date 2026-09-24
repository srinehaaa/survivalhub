import { useState } from 'react';
import Sidebar, { type Page } from '@/components/Sidebar';
import Dashboard from '@/pages/Dashboard';
import Attendance from '@/pages/Attendance';
import Assignments from '@/pages/Assignments';
import Exams from '@/pages/Exams';
import Timetable from '@/pages/Timetable';
import Money from '@/pages/Money';
import PanicMode from '@/pages/PanicMode';
import AuthScreen from '@/pages/AuthScreen';
import { AuthProvider, useAuth } from '@/lib/auth';
import { useUserData } from '@/lib/useUserData';
import { buildPriorityTasks } from '@/lib/priority';
import { Loader2, GraduationCap } from 'lucide-react';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return <AuthenticatedApp />;
}

function AuthenticatedApp() {
  const [page, setPage] = useState<Page>('dashboard');
  const data = useUserData();

  const priorityTasks = buildPriorityTasks(data.assignments, data.exams);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar current={page} onNavigate={setPage} />
      <main className="flex-1 min-w-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-6 md:py-10">
          {data.loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
            </div>
          ) : (
            <>
              {data.error && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {data.error}
                </div>
              )}
              {page === 'dashboard' && (
                <Dashboard
                  assignments={data.assignments}
                  attendance={data.subjects}
                  exams={data.exams}
                  expenses={data.expenses}
                  priorityTasks={priorityTasks}
                  onNavigate={setPage}
                  onSeedDemo={data.seedDemoData}
                />
              )}
              {page === 'attendance' && (
                <Attendance
                  attendance={data.subjects}
                  onAdd={data.addSubject}
                  onUpdate={data.updateSubject}
                  onDelete={data.deleteSubject}
                />
              )}
              {page === 'assignments' && (
                <Assignments
                  assignments={data.assignments}
                  exams={data.exams}
                  onAdd={data.addAssignment}
                  onUpdate={data.updateAssignment}
                  onDelete={data.deleteAssignment}
                />
              )}
              {page === 'exams' && (
                <Exams
                  exams={data.exams}
                  onAddExam={data.addExam}
                  onUpdateExam={data.updateExam}
                  onDeleteExam={data.deleteExam}
                  onAddTopic={data.addTopic}
                  onUpdateTopic={data.updateTopic}
                  onDeleteTopic={data.deleteTopic}
                />
              )}
              {page === 'timetable' && (
                <Timetable
                  timetable={data.timetable}
                  onAdd={data.addTimetableClass}
                  onUpdate={data.updateTimetableClass}
                  onDelete={data.deleteTimetableClass}
                />
              )}
              {page === 'money' && (
                <Money
                  expenses={data.expenses}
                  onAdd={data.addExpense}
                  onUpdate={data.updateExpense}
                  onDelete={data.deleteExpense}
                />
              )}
              {page === 'panic' && <PanicMode priorityTasks={priorityTasks} />}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
