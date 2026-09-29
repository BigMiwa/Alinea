"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Menu, Plus, Search, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Task, categories, dateLabel, localDate, sampleTasks, type Priority } from "@/lib/tasks";

type View = "home" | "tasks" | "calendar" | "completed";
type Draft = Pick<Task, "title" | "description" | "category" | "priority" | "dueDate">;

const blankDraft = (): Draft => ({ title: "", description: "", category: "Personal", priority: "none", dueDate: localDate() });
const priorityText: Record<Priority, string> = { none: "No priority", low: "Low", medium: "Medium", high: "High" };

function Logo() { return <div className="logo" aria-label="Alinea"><span>a</span><b>ALINEA</b></div>; }
function NavIcon({ name }: { name: string }) { return <span className="nav-icon">{name === "home" ? "⌂" : name === "tasks" ? "✓" : name === "calendar" ? "□" : "↗"}</span>; }

function Sidebar({ view, setView, count, onCreate, close }: { view: View; setView: (v: View) => void; count: number; onCreate: () => void; close?: () => void }) {
  const items: { id: View; label: string; icon: string; badge?: string }[] = [
    { id: "home", label: "Home", icon: "home" }, { id: "tasks", label: "My tasks", icon: "tasks" },
    { id: "calendar", label: "Calendar", icon: "calendar" }, { id: "completed", label: "Completed", icon: "tasks", badge: String(count) },
  ];
  return <aside className="sidebar"><div className="sidebar-top"><Logo /><button className="mobile-close" onClick={close} aria-label="Close navigation"><X size={20} /></button></div>
    <nav aria-label="Main navigation">{items.map(item => <button key={item.id} className={`nav-item ${view === item.id ? "active" : ""}`} onClick={() => { setView(item.id); close?.(); }}><NavIcon name={item.icon} /><span>{item.label}</span>{item.badge && <em>{item.badge}</em>}</button>)}</nav>
    <div className="sidebar-bottom"><button className="new-task-sidebar" onClick={onCreate}><Plus size={17} /> New task</button><p>Small steps<br />make big things.</p></div></aside>;
}

function TaskRow({ task, onToggle, onOpen }: { task: Task; onToggle: (task: Task) => void; onOpen: (task: Task) => void }) {
  return <article className={`task-row ${task.completed ? "done" : ""}`}><Checkbox checked={task.completed} onCheckedChange={() => onToggle(task)} aria-label={`Mark ${task.title} ${task.completed ? "incomplete" : "complete"}`} />
    <button className="task-copy" onClick={() => onOpen(task)}><strong>{task.title}</strong><span>{task.description || task.category}</span></button>
    <div className="task-meta"><span className={`priority ${task.priority}`}>{priorityText[task.priority]}</span><span className="due">{dateLabel(task.dueDate)}</span></div></article>;
}

function TaskForm({ draft, setDraft, submitLabel, onSubmit }: { draft: Draft; setDraft: (d: Draft) => void; submitLabel: string; onSubmit: (e: FormEvent) => void }) {
  return <form className="task-form" onSubmit={onSubmit}><label>Task name<input value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })} placeholder="What needs your attention?" autoFocus required maxLength={120} /></label>
    <label>Notes <textarea value={draft.description} onChange={e => setDraft({ ...draft, description: e.target.value })} placeholder="A little context, if useful" maxLength={300} /></label>
    <div className="form-grid"><label>List<select value={draft.category} onChange={e => setDraft({ ...draft, category: e.target.value })}>{categories.map(c => <option key={c}>{c}</option>)}</select></label><label>Due date<input type="date" value={draft.dueDate} onChange={e => setDraft({ ...draft, dueDate: e.target.value })} /></label></div>
    <label>Priority<select value={draft.priority} onChange={e => setDraft({ ...draft, priority: e.target.value as Priority })}>{(Object.keys(priorityText) as Priority[]).map(p => <option key={p} value={p}>{priorityText[p]}</option>)}</select></label>
    <Button type="submit" className="primary-action"><Plus size={17} /> {submitLabel}</Button></form>;
}

export default function Alinea() {
  const [tasks, setTasks] = useState<Task[]>(sampleTasks);
  const [view, setView] = useState<View>("home"); const [query, setQuery] = useState("");
  const [newOpen, setNewOpen] = useState(false); const [menuOpen, setMenuOpen] = useState(false); const [detail, setDetail] = useState<Task | null>(null); const [draft, setDraft] = useState<Draft>(blankDraft());
  const [aiOpen, setAiOpen] = useState(false); const [goal, setGoal] = useState(""); const [suggestions, setSuggestions] = useState<string[]>([]);
  const today = localDate();
  useEffect(() => { const saved = window.localStorage.getItem("alinea-tasks"); if (saved) { try { setTasks(JSON.parse(saved)); } catch {} } fetch("/api/tasks").then(async response => response.ok ? response.json() : null).then(savedTasks => { if (Array.isArray(savedTasks) && savedTasks.length) setTasks(savedTasks); }).catch(() => undefined); }, []);
  useEffect(() => { window.localStorage.setItem("alinea-tasks", JSON.stringify(tasks)); }, [tasks]);
  const completed = tasks.filter(t => t.completed); const openTasks = tasks.filter(t => !t.completed);
  const todayTasks = openTasks.filter(t => t.dueDate === today); const upcoming = openTasks.filter(t => t.dueDate > today);
  const progress = tasks.length ? Math.round((completed.length / tasks.length) * 100) : 0;
  const visible = useMemo(() => { const source = view === "completed" ? completed : view === "tasks" ? openTasks : view === "calendar" ? openTasks : todayTasks; return source.filter(t => `${t.title} ${t.description} ${t.category}`.toLowerCase().includes(query.toLowerCase())); }, [view, completed, openTasks, todayTasks, query]);
  const openCreate = (prefill?: string) => { setDraft({ ...blankDraft(), title: prefill || "" }); setNewOpen(true); };
  const addTask = (e: FormEvent) => { e.preventDefault(); const now = new Date().toISOString(); const task: Task = { ...draft, id: crypto.randomUUID(), completed: false, createdAt: now, updatedAt: now, completedAt: null }; setTasks(current => [task, ...current]); fetch("/api/tasks", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(task) }).catch(() => undefined); setNewOpen(false); };
  const toggle = (task: Task) => { const now = new Date().toISOString(); const completedNext = !task.completed; setTasks(current => current.map(t => t.id === task.id ? { ...t, completed: completedNext, completedAt: completedNext ? now : null, updatedAt: now } : t)); fetch(`/api/tasks/${task.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ completed: completedNext }) }).catch(() => undefined); };
  const remove = (id: string) => { setTasks(current => current.filter(t => t.id !== id)); fetch(`/api/tasks/${id}`, { method: "DELETE" }).catch(() => undefined); setDetail(null); };
  const planGoal = () => { const cleaned = goal.trim(); if (!cleaned) return; const base = cleaned.replace(/[.!?]+$/, ""); setSuggestions([`Define the smallest useful outcome for ${base}`, `Block 25 focused minutes for ${base}`, `Review progress and choose the next step`]); };
  const addSuggestion = (title: string) => { openCreate(title); setAiOpen(false); };
  const heading = view === "home" ? "A gentle place to begin" : view === "tasks" ? "My tasks" : view === "calendar" ? "Your week, at a glance" : "Completed";
  return <div className="app-shell"><Sidebar view={view} setView={setView} count={completed.length} onCreate={() => openCreate()} />
    <main id="main" className="main-panel"><header className="topbar"><button className="menu-button" onClick={() => setMenuOpen(true)} aria-label="Open navigation"><Menu /></button><div className="search-field"><Search size={18} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search your tasks" aria-label="Search your tasks" /></div><button className="avatar" aria-label="Your profile">S</button></header>
      <section className="hero"><div><p className="eyebrow">MONDAY, SEPTEMBER 29</p><h1>{heading}</h1><p className="hero-copy">{view === "home" ? "Choose one thing, then give it your full attention." : "Keep your next action clear and within reach."}</p></div><button className="add-task" onClick={() => openCreate()}><Plus size={18} /> Add task</button></section>
      {view === "home" && <><section className="focus-card"><div><span className="focus-label">TODAY'S FOCUS</span><h2>{todayTasks[0]?.title || "Your day is clear"}</h2><p>{todayTasks[0]?.description || "Add a thoughtful task when you are ready."}</p></div><button onClick={() => todayTasks[0] && toggle(todayTasks[0])} className="circle-check" aria-label="Complete focus task"><Check size={21} /></button></section>
        <section className="dashboard-grid"><div className="task-section"><div className="section-head"><div><p className="section-kicker">UP NEXT</p><h2>Today’s tasks</h2></div><button className="quiet-link" onClick={() => setView("tasks")}>See all <ChevronRight size={16} /></button></div><TaskList tasks={visible} onToggle={toggle} onOpen={setDetail} empty="Nothing pressing today. Make space for what matters." /></div>
        <aside className="progress-card"><p className="section-kicker">YOUR RHYTHM</p><h2>{progress}% complete</h2><Progress value={progress} /><p>{completed.length} of {tasks.length} tasks complete</p><button onClick={() => setAiOpen(true)} className="ai-card-button"><span className="ai-dot">✦</span><span><b>Plan my day</b><small>Turn a goal into calm next steps</small></span><ChevronRight size={18} /></button></aside></section></>}
      {view === "tasks" && <section className="list-page"><div className="list-toolbar"><span>{openTasks.length} open tasks</span><button className="quiet-link" onClick={() => setAiOpen(true)}>Plan with Alinea <ChevronRight size={16} /></button></div><TaskList tasks={visible} onToggle={toggle} onOpen={setDetail} empty="No matching tasks. Try a different search or add a task." /></section>}
      {view === "completed" && <section className="list-page"><p className="section-kicker">DONE AND DUSTED</p><TaskList tasks={visible} onToggle={toggle} onOpen={setDetail} empty="Your completed tasks will appear here." /></section>}
      {view === "calendar" && <section className="calendar-page"><div className="calendar-heading"><button aria-label="Previous week"><ChevronLeft /></button><h2>This week</h2><button aria-label="Next week"><ChevronRight /></button></div><div className="week-grid">{Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() + i); const key = localDate(d); return <div key={key} className={`day-column ${key === today ? "today" : ""}`}><b>{d.toLocaleDateString(undefined, { weekday: "short" })}</b><span>{d.getDate()}</span>{openTasks.filter(t => t.dueDate === key).map(t => <button key={t.id} onClick={() => setDetail(t)}>{t.title}</button>)}</div>; })}</div><div className="calendar-tasks"><p className="section-kicker">UPCOMING</p><TaskList tasks={upcoming.filter(t => t.title.toLowerCase().includes(query.toLowerCase()))} onToggle={toggle} onOpen={setDetail} empty="Nothing scheduled beyond today." /></div></section>}
    </main>
    <Sheet open={menuOpen} onOpenChange={setMenuOpen}><SheetContent side="left" className="mobile-sheet"><Sidebar view={view} setView={setView} count={completed.length} onCreate={() => { setMenuOpen(false); openCreate(); }} close={() => setMenuOpen(false)} /></SheetContent></Sheet>
    <Dialog open={newOpen} onOpenChange={setNewOpen}><DialogContent className="alinea-dialog"><DialogHeader><DialogTitle>Make room for a new task</DialogTitle></DialogHeader><TaskForm draft={draft} setDraft={setDraft} submitLabel="Add to my list" onSubmit={addTask} /></DialogContent></Dialog>
    <Dialog open={aiOpen} onOpenChange={setAiOpen}><DialogContent className="alinea-dialog"><DialogHeader><DialogTitle>Plan a calmer day</DialogTitle></DialogHeader><p className="dialog-copy">Describe what you want to move forward. Alinea will turn it into simple, editable starting points.</p><form className="goal-form" onSubmit={e => { e.preventDefault(); planGoal(); }}><input value={goal} onChange={e => setGoal(e.target.value)} placeholder="e.g. Prepare for my presentation" /><Button className="primary-action" type="submit">Create next steps</Button></form>{suggestions.length > 0 && <div className="suggestions">{suggestions.map(s => <button key={s} onClick={() => addSuggestion(s)}><Plus size={16} /> {s}</button>)}</div>}</DialogContent></Dialog>
    <Dialog open={!!detail} onOpenChange={open => !open && setDetail(null)}><DialogContent className="alinea-dialog detail-dialog">{detail && <><DialogHeader><DialogTitle>{detail.title}</DialogTitle></DialogHeader><p className="detail-notes">{detail.description || "No additional notes."}</p><div className="detail-tags"><span>{detail.category}</span><span>{priorityText[detail.priority]}</span><span>{dateLabel(detail.dueDate)}</span></div><div className="detail-actions"><Button className="primary-action" onClick={() => { toggle(detail); setDetail(null); }}><Check size={16} /> {detail.completed ? "Mark incomplete" : "Complete task"}</Button><button className="delete-button" onClick={() => remove(detail.id)}>Delete task</button></div></>}</DialogContent></Dialog>
  </div>;
}

function TaskList({ tasks, onToggle, onOpen, empty }: { tasks: Task[]; onToggle: (task: Task) => void; onOpen: (task: Task) => void; empty: string }) { return <div className="task-list">{tasks.length ? tasks.map(task => <TaskRow key={task.id} task={task} onToggle={onToggle} onOpen={onOpen} />) : <div className="empty-state"><Check size={22} /><p>{empty}</p></div>}</div>; }
