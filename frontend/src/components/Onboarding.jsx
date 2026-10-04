import React, { useState } from 'react';

const guides = {
  user: ['Welcome to LogiTrack', ['Add your pickup address in Profile & Addresses.', 'Book a courier, then review its waybill in the manifest.', 'Open tracking or submit a support ticket when you need help.'], 'book-step1'],
  staff: ['Your operations workspace', ['Review parcels and shipments requiring attention.', 'Assign an available courier and follow up on failed deliveries.', 'Open Phone GPS Tracking with your operator key to manage live vehicles.'], 'staff-workspace'],
  admin: ['Set up your logistics workspace', ['Add supervisors and couriers before assigning shipments.', 'Review the manifest, fuel ledger, and financial simulator.', 'Register vehicle plates in Phone GPS Tracking and share a driver link privately.'], 'staff-management'],
  worker: ['Start your delivery run', ['Review the parcels assigned to you.', 'Open your private driver tracking link and choose Start sharing.', 'Record delivery confirmation or report an issue. Stop location sharing when your run ends.'], 'worker-workspace'],
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
    <p className="text-sm text-emerald-400 mb-3">Accounts, bookings, and operational changes are stored in MongoDB. Phone GPS uses protected driver and operator access.</p>
    <div className="flex gap-4"><button className="px-4 py-2 rounded-lg bg-sky-600 text-white" onClick={() => { close(); onNavigate(destination); }}>Get started</button><button onClick={close}>Dismiss guide</button></div>
  </section>;
}
