import { useEffect, useState } from 'react';

// Demo workspace storage only. Live GPS is stored by the protected server.
export function useDemoLedger(key, initialValue) {
  const storageKey = `logitrack-demo-v1-${key}`;
  const [value, setValue] = useState(() => {
    try { const saved = JSON.parse(localStorage.getItem(storageKey)); return Array.isArray(saved) ? saved : initialValue; } catch { return initialValue; }
  });
  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(value)); }
    catch { window.dispatchEvent(new CustomEvent('logitrack-storage-error')); }
  }, [storageKey, value]);
  return [value, setValue];
}
