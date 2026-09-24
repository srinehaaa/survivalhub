import { useState } from 'react';
import { GraduationCap, Clock, CheckCircle2, RefreshCw, Circle, BookOpen, Plus, Pencil, Trash2, X, AlertCircle } from 'lucide-react';
import { Card, ProgressBar, PageHeader } from '@/components/ui';
import { daysUntil } from '@/lib/dateUtils';
import type { Exam, ExamTopic } from '@/lib/types';

interface Props {
  exams: Exam[];
  onAddExam: (name: string, subject: string, date: string) => Promise<string | null>;
  onUpdateExam: (id: string, name: string, subject: string, date: string) => Promise<void>;
  onDeleteExam: (id: string) => Promise<void>;
  onAddTopic: (examId: string, name: string) => Promise<void>;
  onUpdateTopic: (examId: string, topicId: string, status: ExamTopic['status']) => Promise<void>;
  onDeleteTopic: (examId: string, topicId: string) => Promise<void>;
}

function topicIcon(status: ExamTopic['status']) {
  if (status === 'completed') return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
  if (status === 'needs-revision') return <RefreshCw className="w-4 h-4 text-amber-500" />;
  return <Circle className="w-4 h-4 text-slate-300" />;
}
function topicLabel(status: ExamTopic['status']) {
  return status === 'completed' ? 'Completed' : status === 'needs-revision' ? 'Needs revision' : 'Not started';
}
function nextStatus(status: ExamTopic['status']): ExamTopic['status'] {
  return status === 'completed' ? 'needs-revision' : status === 'needs-revision' ? 'not-started' : 'completed';
}

export default function Exams({ exams, onAddExam, onUpdateExam, onDeleteExam, onAddTopic, onUpdateTopic, onDeleteTopic }: Props) {
  const [showExamForm, setShowExamForm] = useState(false);
  const [editing, setEditing] = useState<Exam | null>(null);
  const [form, setForm] = useState({ name: '', subject: '', date: '' });
  const [topicInputs, setTopicInputs] = useState<Record<string,string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  function openAdd() { setEditing(null); setForm({ name:'',subject:'',date:'' }); setError(''); setShowExamForm(true); }
  function openEdit(e: Exam) { setEditing(e); setForm({ name:e.name, subject:e.subject, date:e.date }); setError(''); setShowExamForm(true); }

  async function saveExam(e: React.FormEvent) {
    e.preventDefault(); setError('');
    if (!form.name.trim() || !form.subject.trim() || !form.date) return setError('Please fill in all fields.');
    setBusy(true);
    try {
      if (editing) await onUpdateExam(editing.id, form.name.trim(), form.subject.trim(), form.date);
      else await onAddExam(form.name.trim(), form.subject.trim(), form.date);
      setShowExamForm(false);
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not save exam.'); }
    finally { setBusy(false); }
  }

  async function addTopic(examId: string) {
    const name = (topicInputs[examId] ?? '').trim();
    if (!name) return;
    try {
      await onAddTopic(examId, name);
      setTopicInputs(prev => ({...prev, [examId]: ''}));
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not add topic.'); }
  }

  async function removeExam(e: Exam) {
    if (!window.confirm(`Delete "${e.name}" and its topics?`)) return;
    try { await onDeleteExam(e.id); } catch (err) { setError(err instanceof Error ? err.message : 'Could not delete exam.'); }
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <PageHeader title="Exams" subtitle="Countdown, preparation progress, and topic tracking" icon={<GraduationCap className="w-5 h-5" />} />
        <button onClick={openAdd} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold"><Plus className="w-4 h-4" /> Add Exam</button>
      </div>
      {error && !showExamForm && <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>}

      <div className="space-y-5">
        {exams.length === 0 ? <Card className="p-10 text-center"><GraduationCap className="w-10 h-10 mx-auto text-slate-300 mb-3" /><h3 className="font-bold text-slate-900">No exams yet</h3><p className="text-sm text-slate-500 mt-1">Add an exam to start your preparation tracker.</p></Card> :
        exams.map(exam => {
          const days = daysUntil(exam.date);
          const isClose = days >= 0 && days <= 4;
          return (
            <Card key={exam.id} className="p-6 animate-fade-in-up">
              <div className="flex items-start justify-between flex-wrap gap-4 mb-5">
                <div><h2 className="text-xl font-bold text-slate-900">{exam.name}</h2><p className="text-sm text-slate-500 mt-0.5">{exam.subject} · {new Date(`${exam.date}T00:00:00`).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</p></div>
                <div className="flex items-center gap-2">
                  <div className={`text-center px-5 py-3 rounded-2xl ${days < 0 ? 'bg-slate-100' : isClose ? 'bg-red-50' : 'bg-sky-50'}`}>
                    <div className={`text-3xl font-extrabold leading-none ${days < 0 ? 'text-slate-500' : isClose ? 'text-red-600' : 'text-sky-600'}`}>{Math.max(0,days)}</div>
                    <div className="text-xs font-semibold mt-1 text-slate-500">{days < 0 ? 'past' : `day${days===1?'':'s'} left`}</div>
                  </div>
                  <button onClick={() => openEdit(exam)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => void removeExam(exam)} className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>

              <div className="mb-5">
                <div className="flex items-center justify-between mb-2"><span className="text-sm font-semibold text-slate-600 flex items-center gap-1.5"><BookOpen className="w-4 h-4" /> Preparation Progress</span><span className={`text-sm font-extrabold ${exam.prepProgress>=75?'text-emerald-600':exam.prepProgress>=40?'text-amber-600':'text-red-600'}`}>{exam.prepProgress}%</span></div>
                <ProgressBar value={exam.prepProgress} barClass={exam.prepProgress>=75?'bg-emerald-500':exam.prepProgress>=40?'bg-amber-500':'bg-red-500'} bgClass="bg-slate-100" className="h-2.5" />
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Topics</p>
                <div className="grid sm:grid-cols-2 gap-2">
                  {exam.topics.map(t => (
                    <div key={t.id} className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 hover:bg-slate-50">
                      <button onClick={() => void onUpdateTopic(exam.id,t.id,nextStatus(t.status))} className="flex items-center gap-3 flex-1 min-w-0 text-left">{topicIcon(t.status)}<div className="min-w-0"><div className="text-sm font-semibold text-slate-800 truncate">{t.name}</div><div className={`text-xs ${t.status==='completed'?'text-emerald-600':t.status==='needs-revision'?'text-amber-600':'text-slate-400'}`}>{topicLabel(t.status)}</div></div></button>
                      <button onClick={() => void onDeleteTopic(exam.id,t.id)} className="p-1.5 rounded-lg text-slate-300 hover:text-red-600 hover:bg-red-50"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-3">
                  <input value={topicInputs[exam.id] ?? ''} onChange={e=>setTopicInputs({...topicInputs,[exam.id]:e.target.value})} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();void addTopic(exam.id)}}} placeholder="Add a topic..." className="input-field" />
                  <button onClick={()=>void addTopic(exam.id)} className="px-4 rounded-xl bg-slate-900 text-white text-sm font-semibold"><Plus className="w-4 h-4" /></button>
                </div>
                <p className="text-xs text-slate-400 mt-2">Click a topic to cycle: not started → completed → needs revision.</p>
              </div>
            </Card>
          );
        })}
      </div>

      {showExamForm && <div className="fixed inset-0 z-50 flex items-center justify-center p-4"><div className="absolute inset-0 bg-slate-900/40" onClick={()=>!busy&&setShowExamForm(false)} /><Card className="relative w-full max-w-md p-6"><div className="flex justify-between items-center mb-5"><h2 className="text-lg font-bold">{editing?'Edit Exam':'Add Exam'}</h2><button onClick={()=>setShowExamForm(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><X className="w-5 h-5"/></button></div><form onSubmit={saveExam} className="space-y-4"><label><span className="label-text">Exam Name</span><input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="e.g. Financial Management" className="input-field"/></label><label><span className="label-text">Subject</span><input required value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})} placeholder="e.g. Finance" className="input-field"/></label><label><span className="label-text">Exam Date</span><input required type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} className="input-field"/></label>{error&&<p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2"><AlertCircle className="inline w-4 h-4 mr-1"/>{error}</p>}<button disabled={busy} className="w-full py-3 rounded-xl bg-slate-900 text-white text-sm font-semibold disabled:opacity-50">{busy?'Saving...':editing?'Save Changes':'Add Exam'}</button></form></Card></div>}
    </div>
  );
}
