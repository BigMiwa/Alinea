export type Priority = 'none' | 'low' | 'medium' | 'high';
export type Task = {
  id: string; title: string; description: string; category: string;
  priority: Priority; dueDate: string; completed: boolean;
  createdAt: string; updatedAt: string; completedAt: string | null;
};
export type Profile = { name: string; email: string };
export const categories = ['Work', 'Personal', 'Learning'];
export function localDate(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}
export function dateLabel(value: string, today = localDate()) {
  if (!value) return 'No due date';
  if (value === today) return 'Today';
  const d = new Date(`${today}T12:00:00`); d.setDate(d.getDate()+1);
  if(value === localDate(d)) return 'Tomorrow';
  return new Date(`${value}T12:00:00`).toLocaleDateString(undefined,{month:'short',day:'numeric'});
}
export function sampleTasks(): Task[] {
  const now = new Date(); const today = localDate(now);
  const tomorrow = new Date(now); tomorrow.setDate(now.getDate()+1);
  return [
    ['Finish the ALINEA wireframes','Work','high',today,false],
    ['Review portfolio case study','Work','high',today,false],
    ['Read 20 pages','Learning','low',today,false],
    ['Pick up groceries','Personal','medium',today,false],
    ['Plan tomorrow’s priorities','Personal','low',today,false],
    ['Write the product brief','Work','none',today,true],
    ['Go for a morning walk','Personal','none',today,true],
    ['Reply to project feedback','Work','none',today,true],
    ['Submit HNG project','Work','high',localDate(tomorrow),false],
  ].map(([title,category,priority,dueDate,completed],i)=>({id:`sample-${i}`,title:String(title),category:String(category),priority:priority as Priority,dueDate:String(dueDate),completed:Boolean(completed),description:'',createdAt:now.toISOString(),updatedAt:now.toISOString(),completedAt:completed?now.toISOString():null}));
}
