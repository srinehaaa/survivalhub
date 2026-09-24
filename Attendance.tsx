import { useState } from 'react';
import {
  CalendarCheck, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2,
  Lightbulb, Plus, Pencil, Trash2, X,
} from 'lucide-react';
import { Card, ProgressBar, PageHeader } from '@/components/ui';
import { statusConfig, attendanceStatus } from '@/lib/status';
import { useAuth } from '@/lib/auth';
import type { AttendanceSubject } from '@/lib/types';

interface AttendanceProps {
  attendance: AttendanceSubject[];
  onAdd: (name: string, attended: number, conducted: number) => Promise<void>;
  onUpdate: (id: string, name: string, attended: number, conducted: number) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

function calculateAdvisor(attended: number, conducted: number, minimum: number) {
  if (conducted <= 0) return { status: 'above' as const, canMiss: 0 };
  const pct = (attended / conducted) * 100;
  const target = minimum / 100;
  if (pct < minimum) {
    const needed = Math.ceil((target * conducted - attended) / (1 - target));
    return { status: 'below' as const, classesNeeded: Math.max(0, needed) };
  }
  const canMiss = Math.floor(attended / target - conducted);
  return { status: 'above' as const, canMiss: Math.max(0, canMiss) };
}

export default function Attendance({ attendance, onAdd, onUpdate, onDelete }: AttendanceProps) {
  const { profile } = useAuth();
  const minimum = profile?.min_attendance ?? 75;
  const [editing, setEditing] = useState<AttendanceSubject | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', attended: 0, conducted: 0 });

  const totalAttended = attendance.reduce((s, a) => s + a.attended, 0);
  const totalConducted = attendance.reduce((s, a) => s + a.conducted, 0);
  const overallPct = totalConducted > 0 ? Math.round((totalAttended / totalConducted) * 100) : 0;

  function openAdd() {
    setEditing(null); setError('');
    setForm({ name: '', attended: 0, conducted: 0 }); setShowForm(true);
  }

  function openEdit(subject: AttendanceSubject) {
    setEditing(subject); setError('');
    setForm({ name: subject.name, attended: subject.attended, conducted: subject.conducted });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) return setError('Please enter a subject name.');
    if (form.conducted < 1) return setError('Classes conducted must be at least 1.');
    if (form.attended < 0 || form.attended > form.conducted) return setError('Classes attended must be between 0 and classes conducted.');
    setBusy(true);
    try {
      if (editing) await onUpdate(editing.id, form.name.trim(), form.attended, form.conducted);
      else await onAdd(form.name.trim(), form.attended, form.conducted);
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save subject.');
    } finally { setBusy(false); }
  }

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`Delete ${name}? This cannot be undone.`)) return;
    try { await onDelete(id); } catch (err) { setError(err instanceof Error ? err.message : 'Could not delete subject.'); }
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <PageHeader title="Attendance" subtitle="Track every subject and know exactly where you stand" icon={<CalendarCheck className="w-5 h-5" />} />
        <button onClick={openAdd} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800">
          <Plus className="w-4 h-4" /> Add Subject
        </button>
      </div>

      {error && !showForm && <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>}

      <Card className="p-5 mb-6 animate-fade-in-up">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overall Attendance</p>
            <p className="text-4xl font-extrabold text-slate-900 mt-1 tracking-tight">{totalConducted ? `${overallPct}%` : '—'}</p>
            <p className="text-sm text-slate-500 mt-1">{totalAttended} classes attended out of {totalConducted} conducted</p>
          </div>
          <div className="w-full sm:w-64">
            <ProgressBar value={overallPct} barClass={statusConfig[attendanceStatus(overallPct)].bar} bgClass="bg-slate-100" className="h-3" />
            <p className="text-xs text-slate-400 mt-2 text-right">Minimum required: <span className="font-bold text-slate-600">{minimum}%</span></p>
          </div>
        </div>
      </Card>

      {attendance.length === 0 ? (
        <Card className="p-8 text-center mb-6">
          <CalendarCheck className="w-10 h-10 mx-auto text-slate-300 mb-3" />
          <h3 className="font-bold text-slate-900">No subjects yet</h3>
          <p className="text-sm text-slate-500 mt-1">Add your first subject to start tracking attendance.</p>
          <button onClick={openAdd} className="mt-4 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold"><Plus className="inline w-4 h-4 mr-1" /> Add Subject</button>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {attendance.map((s) => {
            const pct = s.conducted > 0 ? Math.round((s.attended / s.conducted) * 100) : 0;
            const status = attendanceStatus(pct);
            const cfg = statusConfig[status];
            return (
              <Card key={s.id} className="p-5 animate-fade-in-up">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-slate-900">{s.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{s.attended} / {s.conducted} classes</p>
                  </div>
                  <span className={`text-2xl font-extrabold ${cfg.text}`}>{pct}%</span>
                </div>
                <ProgressBar value={pct} barClass={cfg.bar} bgClass={cfg.barBg} className="h-2.5" />
                <div className="flex items-center justify-between mt-3">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.badge}`}><span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />{pct >= minimum ? 'Safe' : pct >= minimum - 5 ? 'Watch' : 'At Risk'}</span>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(s)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700" aria-label={`Edit ${s.name}`}><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => void handleDelete(s.id, s.name)} className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600" aria-label={`Delete ${s.name}`}><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Card className="p-6 animate-fade-in-up">
        <div className="flex items-center gap-2 mb-1"><Lightbulb className="w-5 h-5 text-amber-500" /><h2 className="text-lg font-bold text-slate-900">Attendance Advisor</h2></div>
        <p className="text-sm text-slate-500 mb-5">Smart calculations based on your {minimum}% minimum requirement.</p>
        <div className="space-y-3">
          {attendance.map((s) => {
            const pct = s.conducted > 0 ? Math.round((s.attended / s.conducted) * 100) : 0;
            const advisor = calculateAdvisor(s.attended, s.conducted, minimum);
            const cfg = statusConfig[attendanceStatus(pct)];
            return (
              <div key={s.id} className={`flex items-start gap-4 p-4 rounded-xl border ${advisor.status === 'below' ? 'bg-red-50/50 border-red-200' : 'bg-emerald-50/50 border-emerald-200'}`}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${advisor.status === 'below' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                  {advisor.status === 'below' ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2"><span className="font-bold text-slate-900">{s.name}</span><span className={`text-xs font-bold ${cfg.text}`}>{pct}%</span></div>
                  {advisor.status === 'below'
                    ? <p className="text-sm text-slate-600 mt-1 flex items-center gap-1.5"><TrendingUp className="w-4 h-4 text-red-500" />Attend <span className="font-bold text-red-600">{advisor.classesNeeded}</span> more class{advisor.classesNeeded === 1 ? '' : 'es'} to reach {minimum}%.</p>
                    : <p className="text-sm text-slate-600 mt-1 flex items-center gap-1.5"><TrendingDown className="w-4 h-4 text-emerald-500" />You can miss up to <span className="font-bold text-emerald-600">{advisor.canMiss}</span> class{advisor.canMiss === 1 ? '' : 'es'} and stay at {minimum}% or above.</p>}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => !busy && setShowForm(false)} />
          <Card className="relative w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5"><h2 className="text-lg font-bold text-slate-900">{editing ? 'Edit Subject' : 'Add Subject'}</h2><button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><X className="w-5 h-5" /></button></div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block"><span className="label-text">Subject Name</span><input required value={form.name} onChange={e => setForm({...form,name:e.target.value})} placeholder="e.g. Finance" className="input-field" /></label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block"><span className="label-text">Classes Attended</span><input type="number" min="0" value={form.attended} onChange={e => setForm({...form,attended:Number(e.target.value)})} className="input-field" /></label>
                <label className="block"><span className="label-text">Classes Conducted</span><input type="number" min="1" value={form.conducted} onChange={e => setForm({...form,conducted:Number(e.target.value)})} className="input-field" /></label>
              </div>
              <p className="text-xs text-slate-400">Your minimum attendance is {minimum}%. You can update it from your profile settings when we add that option.</p>
              {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
              <button disabled={busy} className="w-full py-3 rounded-xl bg-slate-900 text-white text-sm font-semibold disabled:opacity-50">{busy ? 'Saving...' : editing ? 'Save Changes' : 'Add Subject'}</button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
