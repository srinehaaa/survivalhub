import { useState } from 'react';
import { ClipboardList, Plus, Clock, X, ChevronRight, AlertCircle, Pencil, Trash2, CheckCircle2 } from 'lucide-react';
import { Card, StatusBadge, ProgressBar, PageHeader } from '@/components/ui';
import { statusConfig } from '@/lib/status';
import { formatDeadline, formatMinutes, daysUntil } from '@/lib/dateUtils';
import { calculatePriorityScore, scoreToStatus } from '@/lib/priority';
import type { Assignment, Exam } from '@/lib/types';

interface Props {
  assignments: Assignment[];
  exams: Exam[];
  onAdd: (a: Omit<Assignment, 'id'>) => Promise<void>;
  onUpdate: (id: string, a: Partial<Assignment>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const blank = { name: '', subject: '', deadline: '', importance: 'medium' as const, estimatedMinutes: 60, progress: 0 };

export default function Assignments({ assignments, exams, onAdd, onUpdate, onDelete }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Assignment | null>(null);
  const [form, setForm] = useState(blank);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function openAdd() { setEditing(null); setForm(blank); setError(''); setShowForm(true); }
  function openEdit(a: Assignment) {
    setEditing(a);
    setForm({ name: a.name, subject: a.subject, deadline: a.deadline, importance: a.importance, estimatedMinutes: a.estimatedMinutes, progress: a.progress });
    setError(''); setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError('');
    if (!form.name.trim() || !form.subject.trim() || !form.deadline) return setError('Please fill in the required fields.');
    if (form.estimatedMinutes < 15) return setError('Estimated time must be at least 15 minutes.');
    setBusy(true);
    try {
      if (editing) {
        await onUpdate(editing.id, { name: form.name.trim(), subject: form.subject.trim(), deadline: form.deadline, importance: form.importance, estimatedMinutes: form.estimatedMinutes, progress: form.progress, status: form.progress >= 100 ? 'completed' : form.progress > 0 ? 'in-progress' : 'pending' });
      } else {
        await onAdd({ name: form.name.trim(), subject: form.subject.trim(), deadline: form.deadline, progress: form.progress, importance: form.importance, estimatedMinutes: form.estimatedMinutes, status: form.progress >= 100 ? 'completed' : form.progress > 0 ? 'in-progress' : 'pending' });
      }
      setShowForm(false);
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not save assignment.'); }
    finally { setBusy(false); }
  }

  async function remove(a: Assignment) {
    if (!window.confirm(`Delete "${a.name}"?`)) return;
    try { await onDelete(a.id); } catch (err) { setError(err instanceof Error ? err.message : 'Could not delete assignment.'); }
  }

  async function toggleComplete(a: Assignment) {
    try { await onUpdate(a.id, { status: a.status === 'completed' ? 'pending' : 'completed', progress: a.status === 'completed' ? a.progress : 100 }); }
    catch (err) { setError(err instanceof Error ? err.message : 'Could not update assignment.'); }
  }

  return (
    <div>
      <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
        <PageHeader title="Assignments" subtitle={`${assignments.filter(a => a.status !== 'completed').length} pending · priority auto-calculated`} icon={<ClipboardList className="w-5 h-5" />} />
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800"><Plus className="w-4 h-4" /> New Assignment</button>
      </div>
      {error && !showForm && <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>}

      <div className="space-y-3">
        {assignments.length === 0 ? (
          <Card className="p-10 text-center"><ClipboardList className="w-10 h-10 mx-auto text-slate-300 mb-3" /><h3 className="font-bold text-slate-900">No assignments yet</h3><p className="text-sm text-slate-500 mt-1">Add your first assignment and the hub will rank it for you.</p><button onClick={openAdd} className="mt-4 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold"><Plus className="inline w-4 h-4 mr-1" /> Add Assignment</button></Card>
        ) : assignments.map((a) => {
          const relatedExam = exams.find(e => e.subject.toLowerCase() === a.subject.toLowerCase());
          const examDays = relatedExam ? daysUntil(relatedExam.date) : null;
          const score = calculatePriorityScore(daysUntil(a.deadline), a.importance, examDays, a.estimatedMinutes);
          const status = a.status === 'completed' ? 'safe' : scoreToStatus(score);
          const cfg = statusConfig[status];
          const overdue = daysUntil(a.deadline) < 0 && a.status !== 'completed';
          return (
            <Card key={a.id} className="p-5 animate-fade-in-up">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2.5 mb-1"><h3 className={`font-bold text-slate-900 ${a.status === 'completed' ? 'line-through text-slate-400' : ''}`}>{a.name}</h3><StatusBadge status={status} /></div>
                  <p className="text-sm text-slate-500">{a.subject}</p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-slate-500 flex-wrap">
                    <span className={`flex items-center gap-1.5 ${overdue ? 'text-red-600 font-semibold' : ''}`}><Clock className="w-3.5 h-3.5" />{formatDeadline(a.deadline)}</span>
                    <span className="flex items-center gap-1.5"><ChevronRight className="w-3.5 h-3.5" />{formatMinutes(a.estimatedMinutes)}</span>
                    <span className="capitalize">{a.importance} importance</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <div className="text-right mr-2"><span className={`text-2xl font-extrabold ${cfg.text}`}>{score}</span><span className="text-sm text-slate-400 font-bold">/100</span><div className="text-[10px] font-semibold text-slate-400 uppercase">Priority</div></div>
                  <button onClick={() => void toggleComplete(a)} className="p-2 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-600" title={a.status === 'completed' ? 'Mark pending' : 'Mark complete'}><CheckCircle2 className="w-4 h-4" /></button>
                  <button onClick={() => openEdit(a)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700" title="Edit"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => void remove(a)} className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600" title="Delete"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="mt-4"><div className="flex items-center justify-between mb-1.5"><span className="text-xs font-semibold text-slate-400">Progress</span><span className="text-xs font-bold text-slate-600">{a.progress}%</span></div><ProgressBar value={a.progress} barClass={cfg.bar} bgClass={cfg.barBg} /></div>
            </Card>
          );
        })}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => !busy && setShowForm(false)} />
          <Card className="relative w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5"><h2 className="text-lg font-bold text-slate-900">{editing ? 'Edit Assignment' : 'New Assignment'}</h2><button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><X className="w-5 h-5" /></button></div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <label><span className="label-text">Assignment Name</span><input required value={form.name} onChange={e => setForm({...form,name:e.target.value})} placeholder="e.g. Finance Case Study" className="input-field" /></label>
              <label><span className="label-text">Subject</span><input required value={form.subject} onChange={e => setForm({...form,subject:e.target.value})} placeholder="e.g. Finance" className="input-field" /></label>
              <div className="grid grid-cols-2 gap-3">
                <label><span className="label-text">Deadline</span><input required type="date" value={form.deadline} onChange={e => setForm({...form,deadline:e.target.value})} className="input-field" /></label>
                <label><span className="label-text">Time (minutes)</span><input required type="number" min="15" step="15" value={form.estimatedMinutes} onChange={e => setForm({...form,estimatedMinutes:Number(e.target.value)})} className="input-field" /></label>
              </div>
              <div><span className="label-text">Importance</span><div className="grid grid-cols-3 gap-2">{(['high','medium','low'] as const).map(l => <button type="button" key={l} onClick={() => setForm({...form,importance:l})} className={`py-2.5 rounded-xl text-sm font-semibold capitalize border ${form.importance===l?'bg-slate-900 text-white border-slate-900':'bg-white text-slate-600 border-slate-200'}`}>{l}</button>)}</div></div>
              <label><span className="label-text">Progress: {form.progress}%</span><input type="range" min="0" max="100" step="5" value={form.progress} onChange={e => setForm({...form,progress:Number(e.target.value)})} className="w-full" /></label>
              {error && <p className="text-sm text-red-600 flex items-center gap-1.5"><AlertCircle className="w-4 h-4" />{error}</p>}
              <button disabled={busy} className="w-full py-3 rounded-xl bg-slate-900 text-white text-sm font-semibold disabled:opacity-50">{busy ? 'Saving...' : editing ? 'Save Changes' : 'Add Assignment'}</button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
