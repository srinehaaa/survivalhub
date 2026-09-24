import { useState } from 'react';
import { Wallet, TrendingDown, AlertTriangle, Utensils, Bus, ShoppingBag, Clapperboard, PenTool, Plus, Pencil, Trash2, X, Receipt } from 'lucide-react';
import { Card, ProgressBar, PageHeader } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import type { Expense } from '@/lib/types';

const iconMap: Record<string, typeof Utensils> = { Utensils, Bus, ShoppingBag, Clapperboard, PenTool, Wallet };
const colorMap: Record<string, { bg: string; text: string; bar: string }> = {
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', bar: 'bg-emerald-500' },
  sky: { bg: 'bg-sky-50', text: 'text-sky-600', bar: 'bg-sky-500' },
  violet: { bg: 'bg-violet-50', text: 'text-violet-600', bar: 'bg-violet-500' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-600', bar: 'bg-amber-500' },
  rose: { bg: 'bg-rose-50', text: 'text-rose-600', bar: 'bg-rose-500' },
};
const categoryMeta: Record<string,{color:string;icon:string}> = {
  Food:{color:'emerald',icon:'Utensils'}, Travel:{color:'sky',icon:'Bus'},
  Shopping:{color:'violet',icon:'ShoppingBag'}, Entertainment:{color:'amber',icon:'Clapperboard'}, Other:{color:'rose',icon:'PenTool'}
};
const blank = { category:'Food', description:'', amount:0, expenseDate:new Date().toISOString().slice(0,10) };

export default function Money({ expenses, onAdd, onUpdate, onDelete }: {
  expenses: Expense[];
  onAdd: (e: Omit<Expense,'id'>) => Promise<void>;
  onUpdate: (id:string,e:Partial<Expense>) => Promise<void>;
  onDelete: (id:string) => Promise<void>;
}) {
  const { profile } = useAuth();
  const budget = profile?.monthly_budget ?? 15000;
  const [showForm,setShowForm]=useState(false);
  const [editing,setEditing]=useState<Expense|null>(null);
  const [form,setForm]=useState(blank);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');

  const spent=expenses.reduce((s,e)=>s+e.amount,0);
  const remaining=budget-spent;
  const pct=budget>0?Math.round((spent/budget)*100):0;
  const isWarning=pct>=70&&pct<90, isCritical=pct>=90;
  const statusColor=isCritical?'text-red-600':isWarning?'text-amber-600':'text-emerald-600';
  const barColor=isCritical?'bg-red-500':isWarning?'bg-amber-500':'bg-emerald-500';

  function openAdd(){setEditing(null);setForm(blank);setError('');setShowForm(true);}
  function openEdit(e:Expense){setEditing(e);setForm({category:e.category,description:e.description,amount:e.amount,expenseDate:e.expenseDate});setError('');setShowForm(true);}
  async function submit(e:React.FormEvent){
    e.preventDefault();setError('');
    if(form.amount<=0)return setError('Enter an amount greater than zero.');
    setBusy(true);
    try{
      const meta=categoryMeta[form.category]??categoryMeta.Other;
      if(editing) await onUpdate(editing.id,{category:form.category,description:form.description.trim(),amount:form.amount,expenseDate:form.expenseDate,color:meta.color,icon:meta.icon});
      else await onAdd({category:form.category,description:form.description.trim(),amount:form.amount,expenseDate:form.expenseDate,color:meta.color,icon:meta.icon});
      setShowForm(false);
    }catch(err){setError(err instanceof Error?err.message:'Could not save expense.');}
    finally{setBusy(false);}
  }
  async function remove(e:Expense){if(!window.confirm(`Delete this ₹${e.amount} expense?`))return;try{await onDelete(e.id);}catch(err){setError(err instanceof Error?err.message:'Could not delete expense.');}}

  return <div>
    <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
      <PageHeader title="Money" subtitle="Your monthly budget at a glance" icon={<Wallet className="w-5 h-5"/>}/>
      <button onClick={openAdd} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold"><Plus className="w-4 h-4"/> Add Expense</button>
    </div>
    {error&&!showForm&&<p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>}
    <div className="grid lg:grid-cols-3 gap-4 mb-6">
      <Card className="p-5"><p className="text-xs font-semibold text-slate-400 uppercase">Monthly Budget</p><p className="text-3xl font-extrabold text-slate-900 mt-2">₹{budget.toLocaleString('en-IN')}</p><p className="text-xs text-slate-400 mt-1">Your spending limit</p></Card>
      <Card className="p-5"><p className="text-xs font-semibold text-slate-400 uppercase">Spent</p><p className={`text-3xl font-extrabold mt-2 ${statusColor}`}>₹{spent.toLocaleString('en-IN')}</p><p className="text-xs text-slate-400 mt-1">{pct}% of budget used</p></Card>
      <Card className={`p-5 ${isCritical?'ring-2 ring-red-200':''}`}><p className="text-xs font-semibold text-slate-400 uppercase">Remaining</p><p className={`text-3xl font-extrabold mt-2 ${remaining<0?'text-red-600':'text-emerald-600'}`}>₹{Math.abs(remaining).toLocaleString('en-IN')}{remaining<0&&<span className="text-sm ml-1">over</span>}</p><p className="text-xs text-slate-400 mt-1">{remaining>=0?'Still available':'Over budget'}</p></Card>
    </div>
    <Card className="p-5 mb-6">
      <div className="flex justify-between mb-2"><span className="text-sm font-semibold text-slate-600">Budget Usage</span><span className={`text-sm font-extrabold ${statusColor}`}>{pct}%</span></div>
      <ProgressBar value={Math.min(100,Math.max(0,pct))} barClass={barColor} bgClass="bg-slate-100" className="h-3"/>
      {(isWarning||isCritical)?<div className={`mt-4 flex items-start gap-3 p-3.5 rounded-xl ${isCritical?'bg-red-50 text-red-700':'bg-amber-50 text-amber-700'}`}><AlertTriangle className="w-5 h-5 shrink-0"/><div><p className="text-sm font-bold">{isCritical?'You have nearly exhausted your budget!':'Spending is approaching your budget.'}</p><p className="text-xs mt-0.5">You have ₹{Math.max(0,remaining).toLocaleString('en-IN')} remaining.</p></div></div>:<div className="mt-4 flex items-center gap-2 text-sm text-emerald-600"><TrendingDown className="w-4 h-4"/><span className="font-semibold">You're on track. {Math.max(0,100-pct)}% of budget remaining.</span></div>}
    </Card>
    <div className="flex items-center justify-between mb-3"><p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Recent Expenses</p></div>
    {expenses.length===0?<Card className="p-10 text-center"><Receipt className="w-10 h-10 mx-auto text-slate-300 mb-3"/><h3 className="font-bold text-slate-900">No expenses yet</h3><p className="text-sm text-slate-500 mt-1">Add your first expense to start tracking your budget.</p></Card>:
    <div className="space-y-2">{expenses.map(e=>{const c=colorMap[e.color]??colorMap.sky;const Icon=iconMap[e.icon]??Wallet;return <Card key={e.id} className="p-4"><div className="flex items-center gap-3"><div className={`w-10 h-10 rounded-xl ${c.bg} ${c.text} flex items-center justify-center shrink-0`}><Icon className="w-5 h-5"/></div><div className="flex-1 min-w-0"><p className="font-bold text-slate-900 text-sm">{e.category}</p><p className="text-xs text-slate-400 truncate">{e.description||'Expense'} · {new Date(`${e.expenseDate}T00:00:00`).toLocaleDateString('en-IN')}</p></div><span className="font-extrabold text-slate-900">₹{e.amount.toLocaleString('en-IN')}</span><button onClick={()=>openEdit(e)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"><Pencil className="w-4 h-4"/></button><button onClick={()=>void remove(e)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4"/></button></div></Card>})}</div>}
    {showForm&&<div className="fixed inset-0 z-50 flex items-center justify-center p-4"><div className="absolute inset-0 bg-slate-900/40" onClick={()=>!busy&&setShowForm(false)}/><Card className="relative w-full max-w-md p-6"><div className="flex justify-between items-center mb-5"><h2 className="text-lg font-bold">{editing?'Edit Expense':'Add Expense'}</h2><button onClick={()=>setShowForm(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><X className="w-5 h-5"/></button></div><form onSubmit={submit} className="space-y-4"><label><span className="label-text">Category</span><select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} className="input-field">{Object.keys(categoryMeta).map(c=><option key={c}>{c}</option>)}</select></label><label><span className="label-text">Amount (₹)</span><input required type="number" min="1" value={form.amount||''} onChange={e=>setForm({...form,amount:Number(e.target.value)})} className="input-field"/></label><label><span className="label-text">Description</span><input value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="e.g. Lunch" className="input-field"/></label><label><span className="label-text">Date</span><input required type="date" value={form.expenseDate} onChange={e=>setForm({...form,expenseDate:e.target.value})} className="input-field"/></label>{error&&<p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}<button disabled={busy} className="w-full py-3 rounded-xl bg-slate-900 text-white text-sm font-semibold disabled:opacity-50">{busy?'Saving...':editing?'Save Changes':'Add Expense'}</button></form></Card></div>}
  </div>;
}
