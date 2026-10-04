import React, { useEffect, useRef, useState } from "react";
import { Check, Moon, Palette, Sun, Zap } from "lucide-react";

const THEMES = [
  { id: "dark", label: "Midnight", description: "Deep navy glass", icon: Moon },
  { id: "light", label: "Crystal", description: "Bright frosted glass", icon: Sun },
  { id: "cyber", label: "Cyber", description: "Violet neon glass", icon: Zap },
];

export default function ThemeSwitcher({ theme, onChange, compact = false }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const current = THEMES.find((item) => item.id === theme) || THEMES[0];
  const CurrentIcon = current.icon;

  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={`glass-control inline-flex items-center justify-center gap-2 rounded-2xl text-slate-200 hover:text-white ${compact ? "h-10 w-10" : "h-11 px-4"}`}
        aria-label="Choose color theme"
        aria-haspopup="menu"
        aria-expanded={open}
        title={`Theme: ${current.label}`}
      >
        <CurrentIcon className="h-4.5 w-4.5 text-sky-400" />
        {!compact && <span className="text-xs font-extrabold">{current.label}</span>}
      </button>

      {open && (
        <div role="menu" aria-label="Color theme" className="glass-popover absolute right-0 top-full z-[100] mt-3 w-64 rounded-2xl p-2 animate-fade-in">
          <div className="flex items-center gap-2 border-b border-slate-700/60 px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
            <Palette className="h-3.5 w-3.5 text-sky-400" /> Appearance
          </div>
          <div className="mt-1 space-y-1">
            {THEMES.map((item) => {
              const Icon = item.icon;
              const active = item.id === theme;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="menuitemradio"
                  aria-checked={active}
                  onClick={() => {
                    onChange(item.id);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition ${active ? "border-sky-400/40 bg-sky-400/15" : "border-transparent hover:border-slate-600/60 hover:bg-slate-700/30"}`}
                >
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-slate-800/70 text-sky-400"><Icon className="h-4 w-4" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-extrabold text-slate-100">{item.label}</span>
                    <span className="block text-[10px] text-slate-400">{item.description}</span>
                  </span>
                  {active && <Check className="h-4 w-4 text-emerald-400" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
