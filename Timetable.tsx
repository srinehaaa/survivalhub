import { useState } from 'react';
import { CalendarDays, MapPin, Clock, Plus, Pencil, Trash2, X, CalendarCheck } from 'lucide-react';
import { Card, PageHeader } from '@/components/ui';
import { todayName } from '@/lib/dateUtils';
import type { TimetableClass } from '@/lib/types';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const colorOptions = ['emerald', 'sky', 'amber', 'violet'];
const colorMap: Record<string, { dot: string; bg: string; text: string }> = {
  emerald: { dot: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  sky: { dot: 'bg-sky-500', bg: 'bg-sky-50', text: 'text-sky-700' },
  amber: { dot: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-700' },
  violet: { dot: 'bg-violet-500', bg: 'bg-violet-50', text: 'text-violet-700' },
};

function minutesBetween(a: string, b: string) {
  const [ah, am] = a.split(':').map(Number);
  const [bh, bm] = b.split(':').map(Number);
  let diff = (bh * 60 + bm) - (ah * 60 + am);
  if (diff < 0) diff += 1440;
  return diff;
}

const blank = {
  subject: '',
  dayOfWeek: todayName(),
  startTime: '10:00',
  endTime: '11:00',
  room: '',
  color: 'sky',
};

export default function Timetable({
  timetable,
  onAdd,
  onUpdate,
  onDelete,
}: {
  timetable: TimetableClass[];
  onAdd: (c: Omit<TimetableClass, 'id'>) => Promise<void>;
  onUpdate: (id: string, c: Partial<TimetableClass>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const today = todayName();
  const [selectedDay, setSelectedDay] = useState(today);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<TimetableClass | null>(null);
  const [form, setForm] = useState(blank);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const visible = timetable
    .filter((c) => c.dayOfWeek === selectedDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  function openAdd() {
    setEditing(null);
    setForm({ ...blank, dayOfWeek: selectedDay });
    setError('');
    setShowForm(true);
  }

  function openEdit(c: TimetableClass) {
    setEditing(c);
    setForm({
      subject: c.subject,
      dayOfWeek: c.dayOfWeek,
      startTime: c.startTime,
      endTime: c.endTime,
      room: c.room,
      color: c.color,
    });
    setError('');
    setShowForm(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!form.subject.trim()) return setError('Enter a subject.');
    if (!form.startTime || !form.endTime) return setError('Enter start and end times.');
    if (form.startTime === form.endTime) return setError('Start and end time cannot be the same.');

    setBusy(true);
    try {
      if (editing) {
        await onUpdate(editing.id, { ...form, subject: form.subject.trim() });
      } else {
        await onAdd({ ...form, subject: form.subject.trim() });
      }
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save class.');
    } finally {
      setBusy(false);
    }
  }

  async function remove(c: TimetableClass) {
    if (!window.confirm(`Delete ${c.subject} class?`)) return;

    try {
      await onDelete(c.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete class.');
    }
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <PageHeader
          title="Timetable"
          subtitle={`${selectedDay}'s schedule at a glance`}
          icon={<CalendarDays className="w-5 h-5" />}
        />
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold"
        >
          <Plus className="w-4 h-4" /> Add Class
        </button>
      </div>

      {error && !showForm && (
        <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {days.map((d) => (
          <button
            key={d}
            onClick={() => setSelectedDay(d)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap ${
              selectedDay === d
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
            }`}
          >
            {d}
            {d === today && <span className="ml-1.5 text-[10px] opacity-70">TODAY</span>}
          </button>
        ))}
      </div>

      <Card className="p-6">
        {visible.length === 0 ? (
          <div className="py-12 text-center">
            <CalendarCheck className="w-10 h-10 mx-auto text-slate-300 mb-3" />
            <h3 className="font-bold text-slate-900">No classes on {selectedDay}</h3>
            <p className="text-sm text-slate-500 mt-1">Add a class to build your timetable.</p>
            <button
              onClick={openAdd}
              className="mt-4 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold"
            >
              <Plus className="inline w-4 h-4 mr-1" /> Add Class
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {visible.map((c) => {
              const cfg = colorMap[c.color] ?? colorMap.sky;
              const mins = minutesBetween(c.startTime, c.endTime);

              return (
                <div key={c.id} className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50">
                  <div className="w-16 shrink-0 text-right">
                    <div className="text-xs font-bold text-slate-700">{c.startTime}</div>
                    <div className="text-[10px] text-slate-400">{c.endTime}</div>
                  </div>

                  <div className={`w-3.5 h-3.5 rounded-full ${cfg.dot} ring-4 ring-white mt-1.5 shrink-0`} />

                  <div className="flex-1">
                    <div className={`rounded-xl ${cfg.bg} p-4`}>
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h3 className={`font-bold ${cfg.text}`}>{c.subject}</h3>
                          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                            <MapPin className="w-3 h-3" />
                            {c.room || 'Room not set'}
                          </p>
                        </div>

                        <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {mins} min
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(c)}
                      className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => void remove(c)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <div className="grid grid-cols-2 gap-4 mt-5">
        <Card className="p-4 text-center">
          <p className="text-2xl font-extrabold text-slate-900">{visible.length}</p>
          <p className="text-xs text-slate-400 font-semibold">Classes on {selectedDay}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-extrabold text-slate-900">
            {visible.reduce((sum, c) => sum + minutesBetween(c.startTime, c.endTime), 0)}
            <span className="text-sm text-slate-400"> min</span>
          </p>
          <p className="text-xs text-slate-400 font-semibold">Total class time</p>
        </Card>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => !busy && setShowForm(false)} />

          <Card className="relative w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-slate-900">{editing ? 'Edit Class' : 'Add Class'}</h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={submit} className="space-y-4">
              <label>
                <span className="label-text">Subject</span>
                <input
                  required
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="e.g. Finance"
                  className="input-field"
                />
              </label>

              <label>
                <span className="label-text">Day</span>
                <select
                  value={form.dayOfWeek}
                  onChange={(e) => setForm({ ...form, dayOfWeek: e.target.value })}
                  className="input-field"
                >
                  {days.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label>
                  <span className="label-text">Start</span>
                  <input
                    required
                    type="time"
                    value={form.startTime}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    className="input-field"
                  />
                </label>
                <label>
                  <span className="label-text">End</span>
                  <input
                    required
                    type="time"
                    value={form.endTime}
                    onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                    className="input-field"
                  />
                </label>
              </div>

              <label>
                <span className="label-text">Room</span>
                <input
                  value={form.room}
                  onChange={(e) => setForm({ ...form, room: e.target.value })}
                  placeholder="e.g. B204"
                  className="input-field"
                />
              </label>

              <label>
                <span className="label-text">Colour</span>
                <select
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  className="input-field"
                >
                  {colorOptions.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>

              {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

              <button
                disabled={busy}
                className="w-full py-3 rounded-xl bg-slate-900 text-white text-sm font-semibold disabled:opacity-50"
              >
                {busy ? 'Saving...' : editing ? 'Save Changes' : 'Add Class'}
              </button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}