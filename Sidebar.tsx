import { useState } from 'react';
import {
  LayoutDashboard, CalendarCheck, ClipboardList, GraduationCap, CalendarDays, Wallet,
  Siren, X, LogOut, Settings, Save,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';

export type Page = 'dashboard' | 'attendance' | 'assignments' | 'exams' | 'timetable' | 'money' | 'panic';

const navItems: { id: Page; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
  { id: 'assignments', label: 'Assignments', icon: ClipboardList },
  { id: 'exams', label: 'Exams', icon: GraduationCap },
  { id: 'timetable', label: 'Timetable', icon: CalendarDays },
  { id: 'money', label: 'Money', icon: Wallet },
  { id: 'panic', label: 'Panic Mode', icon: Siren },
];

export default function Sidebar({ current, onNavigate }: { current: Page; onNavigate: (p: Page) => void }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { profile, signOut, updateProfile } = useAuth();
  const firstName = profile?.full_name?.split(' ')[0] ?? 'Student';

  const content = (
    <>
      <div className="px-5 pt-6 pb-7">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-sm shrink-0"><GraduationCap className="w-5 h-5 text-white" /></div>
          <div className="leading-tight"><div className="font-extrabold text-slate-900 text-[15px] tracking-tight">Survival Hub</div><div className="text-[11px] text-slate-400 font-medium">Know what matters</div></div>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.slice(0, 6).map(item => {
          const active=current===item.id; const Icon=item.icon;
          return <button key={item.id} onClick={()=>{onNavigate(item.id);setMobileOpen(false);}} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${active?'bg-slate-900 text-white shadow-sm':'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}><Icon className="w-[18px] h-[18px] shrink-0"/>{item.label}</button>;
        })}
      </nav>

      <div className="px-3 pt-2">
        <button onClick={()=>{onNavigate('panic');setMobileOpen(false);}} className={`w-full flex items-center justify-center gap-2.5 px-3 py-3 rounded-xl text-sm font-bold transition-all ${current==='panic'?'bg-red-600 text-white shadow-md':'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'}`}><Siren className={`w-5 h-5 ${current==='panic'?'':'animate-pulse-ring rounded-full'}`}/>Panic Mode</button>
      </div>

      <div className="p-3 pt-3 border-t border-slate-100 mt-2">
        <button onClick={()=>setProfileOpen(true)} className="w-full flex items-center gap-2.5 px-2 py-1.5 mb-2 text-left rounded-xl hover:bg-slate-50">
          <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold shrink-0">{firstName.charAt(0).toUpperCase()}</div>
          <div className="min-w-0 flex-1"><div className="text-sm font-bold text-slate-800 truncate">{profile?.full_name ?? firstName}</div><div className="text-[11px] text-slate-400 truncate">{profile?.course} {profile?.year}</div></div>
          <Settings className="w-4 h-4 text-slate-300"/>
        </button>
        <button onClick={()=>void signOut()} className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-red-600 hover:bg-red-50"><LogOut className="w-3.5 h-3.5"/>Sign Out</button>
      </div>
    </>
  );

  return <>
    <aside className="hidden md:flex w-64 shrink-0 flex-col bg-white border-r border-slate-200 h-screen sticky top-0">{content}</aside>
    <div className="md:hidden sticky top-0 z-30 bg-white border-b border-slate-200 flex items-center justify-between px-4 py-3"><div className="flex items-center gap-2"><div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center"><GraduationCap className="w-4 h-4 text-white"/></div><span className="font-extrabold text-slate-900 text-sm tracking-tight">Survival Hub</span></div><button onClick={()=>setMobileOpen(true)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"><span className="text-xl">☰</span></button></div>
    {mobileOpen&&<div className="md:hidden fixed inset-0 z-50 animate-fade-in"><div className="absolute inset-0 bg-slate-900/40" onClick={()=>setMobileOpen(false)}/><div className="absolute left-0 top-0 bottom-0 w-64 bg-white flex flex-col animate-slide-in-right"><button onClick={()=>setMobileOpen(false)} className="absolute top-4 right-3 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><X className="w-5 h-5"/></button>{content}</div></div>}

    {profileOpen&&profile&&<ProfileModal profile={profile} onClose={()=>setProfileOpen(false)} onSave={updateProfile}/>}
  </>;
}

function ProfileModal({ profile, onClose, onSave }: {
  profile: { full_name:string; course:string; year:string; monthly_budget:number; min_attendance:number };
  onClose:()=>void;
  onSave:(updates: Partial<{full_name:string;course:string;year:string;monthly_budget:number;min_attendance:number}>)=>Promise<{error:string|null}>;
}) {
  const [form,setForm]=useState({full_name:profile.full_name,course:profile.course,year:profile.year,monthly_budget:profile.monthly_budget,min_attendance:profile.min_attendance});
  const [error,setError]=useState(''); const [busy,setBusy]=useState(false);
  async function submit(e:React.FormEvent){e.preventDefault();if(form.min_attendance<1||form.min_attendance>100)return setError('Minimum attendance must be between 1% and 100%.');if(form.monthly_budget<0)return setError('Budget cannot be negative.');setBusy(true);const result=await onSave(form);setBusy(false);if(result.error)setError(result.error);else onClose();}
  return <div className="fixed inset-0 z-[60] flex items-center justify-center p-4"><div className="absolute inset-0 bg-slate-900/40" onClick={()=>!busy&&onClose()}/><div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6"><div className="flex items-center justify-between mb-5"><div><h2 className="text-lg font-bold text-slate-900">My Profile</h2><p className="text-xs text-slate-400 mt-0.5">These settings belong only to your account.</p></div><button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><X className="w-5 h-5"/></button></div><form onSubmit={submit} className="space-y-4">
    <label><span className="label-text">Full Name</span><input required value={form.full_name} onChange={e=>setForm({...form,full_name:e.target.value})} className="input-field"/></label>
    <div className="grid grid-cols-2 gap-3"><label><span className="label-text">Course</span><input value={form.course} onChange={e=>setForm({...form,course:e.target.value})} className="input-field"/></label><label><span className="label-text">Year</span><input value={form.year} onChange={e=>setForm({...form,year:e.target.value})} className="input-field"/></label></div>
    <div className="grid grid-cols-2 gap-3"><label><span className="label-text">Monthly Budget (₹)</span><input type="number" min="0" value={form.monthly_budget} onChange={e=>setForm({...form,monthly_budget:Number(e.target.value)})} className="input-field"/></label><label><span className="label-text">Minimum Attendance %</span><input type="number" min="1" max="100" value={form.min_attendance} onChange={e=>setForm({...form,min_attendance:Number(e.target.value)})} className="input-field"/></label></div>
    {error&&<p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}<button disabled={busy} className="w-full py-3 rounded-xl bg-slate-900 text-white text-sm font-semibold disabled:opacity-50"><Save className="inline w-4 h-4 mr-1"/>{busy?'Saving...':'Save Profile'}</button>
  </form></div></div>;
}
