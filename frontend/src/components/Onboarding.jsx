import React, { useState } from 'react';

const guides = {
  user: ['Welcome to LogiTrack', ['Add your pickup address in Profile & Addresses.', 'Book a courier, then review its waybill in the manifest.', 'Track only the courier assigned to your active parcel.'], 'book-step1'],
  staff: ['Your operations workspace', ['Review parcels and shipments requiring attention.', 'Assign an available courier and follow up on failed deliveries.', 'Use Live Worker Map to monitor consented on-duty locations and stale signals.'], 'staff-workspace'],
  admin: ['Set up your logistics workspace', ['Add supervisors and couriers before assigning shipments.', 'Review the manifest, fuel ledger, and financial simulator.', 'Use Live Worker Map for role-protected fleet oversight.'], 'staff-management'],
  worker: ['Start your delivery run', ['Review the parcels assigned to you.', 'Open Duty Location Sharing, confirm consent, and start your eight-hour shift.', 'Stop location sharing immediately when your delivery duty ends.'], 'worker-location'],
};
export default function Onboarding({ user, onNavigate }) {
  const key = `logitrack-guide-${user.id}-${user.systemRole}`;
  const [open, setOpen] = useState(() => { try { return localStorage.getItem(key) !== 'done'; } catch { return true; } });
  const [title, steps, destination] = guides[user.systemRole] || guides.user;
  const close = () => { try { localStorage.setItem(key, 'done'); } catch {} setOpen(false); };
  if (!open) return <button className="mb-4 text-sm text-sky-400 underline" onClick={() => setOpen(true)}>Show getting-started guide</button>;
  return <section aria-label="Getting started" className="mb-6 p-5 bg-slate-900 border border-slate-700 rounded-2xl">
    <h2 className="text-xl font-bold text-white">{title}</h2>
    <ol className="list-decimal pl-5 my-3 text-slate-300 space-y-2">{steps.map(step => <li key={step}>{step}</li>)}</ol>
    <p className="text-sm text-emerald-400 mb-3">Accounts and operations are stored in MongoDB. Off-duty worker coordinates are not displayed.</p>
    <div className="flex gap-4"><button className="px-4 py-2 rounded-lg bg-sky-600 text-white" onClick={() => { close(); onNavigate(destination); }}>Get started</button><button onClick={close}>Dismiss guide</button></div>
  </section>;
}
