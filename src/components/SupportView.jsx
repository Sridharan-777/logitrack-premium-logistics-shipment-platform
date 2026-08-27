import React, { useState } from "react";
import {
  Search,
  HelpCircle,
  Plus,
  ChevronDown,
  Phone,
  Mail,
  Clock,
  LifeBuoy,
  CheckCircle,
  AlertCircle,
  Send,
  Zap,
  ShieldCheck,
  Headphones,
  BookOpen,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import ThreeDCard from "./ThreeDCard";

export default function SupportView({ tickets, onSubmitTicket }) {
  const [searchVal, setSearchVal] = useState("");
  const [activeFaq, setActiveFaq] = useState(null);

  // Submit form states
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("Delivery Delay");
  const [priority, setPriority] = useState("Medium");
  const [description, setDescription] = useState("");
  const [successMsg, setSuccessMsg] = useState(false);

  const handleTicketSubmit = (e) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;

    const randId = Math.floor(1000 + Math.random() * 9000);
    const newTicket = {
      id: `TCK-${randId}`,
      subject: subject.trim(),
      category,
      status: "Open",
      date: new Date().toLocaleDateString(),
      description: description.trim(),
      priority,
    };

    onSubmitTicket(newTicket);
    setSubject("");
    setDescription("");
    setSuccessMsg(true);

    setTimeout(() => {
      setSuccessMsg(false);
    }, 4000);
  };

  const faqList = [
    {
      q: "How does transit protection insurance work?",
      a: "Transit protection covers up to $50,000 USD of declared package value in case of accidental damage, loss, or customs issues. Full claim approval takes under 7 business days.",
      icon: ShieldCheck,
    },
    {
      q: "What documents are required for international custom clearance?",
      a: "All commercial freight and parcel courier lines require a Commercial Invoice, a Packing List, and a signed Airway Bill/Waybill declaration attached.",
      icon: BookOpen,
    },
    {
      q: "How do I resolve a UK Border customs hold?",
      a: 'If a package status shows Customs Hold (e.g. TRK-900112-E), select the Resolve Issue button in your shipment ledger to upload missing commercial invoices or commercial valuation papers.',
      icon: AlertCircle,
    },
    {
      q: "How do I schedule a recurring daily courier pickup?",
      a: "Enterprise accounts can establish recurring schedules under Profile Settings. A courier driver is pre-assigned to your facility every business day at your chosen hour.",
      icon: Clock,
    },
  ];

  const filteredFaqs = faqList.filter(
    (f) =>
      f.q.toLowerCase().includes(searchVal.toLowerCase()) ||
      f.a.toLowerCase().includes(searchVal.toLowerCase()),
  );

  const priorityColors = {
    Low: "bg-slate-500/20 text-slate-300 border-slate-500/40",
    Medium: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    High: "bg-rose-500/20 text-rose-300 border-rose-500/40",
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans">
      {/* Hero Support Banner with Glassmorphic Gradient */}
      <ThreeDCard className="relative overflow-hidden rounded-3xl">
        <div className="relative p-8 md:p-12 bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 border border-sky-500/20 rounded-3xl">
          {/* Animated background effects */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(56,189,248,0.12),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(139,92,246,0.1),transparent_50%)]"></div>
          <div className="absolute top-4 right-8 w-24 h-24 rounded-full bg-sky-500/10 blur-2xl animate-pulse"></div>
          <div className="absolute bottom-4 left-12 w-32 h-32 rounded-full bg-purple-500/10 blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>

          <div className="relative z-10 max-w-2xl mx-auto text-center space-y-5">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-sky-500/15 border border-sky-500/30 rounded-full">
              <Headphones className="h-4 w-4 text-sky-400" />
              <span className="text-sky-400 font-mono text-xs font-black tracking-wider uppercase">
                24/7 Operations Command Center
              </span>
            </div>

            <h2 className="text-2xl md:text-4xl font-black text-white tracking-tight leading-tight">
              How can our{" "}
              <span className="bg-gradient-to-r from-sky-400 to-blue-400 bg-clip-text text-transparent">
                dispatch advisory desk
              </span>{" "}
              help you?
            </h2>

            <div className="relative w-full max-w-xl mx-auto">
              <span className="absolute left-4 top-3.5 text-sky-400 pointer-events-none">
                <Search className="h-5 w-5" />
              </span>
              <input
                id="faq-search-input"
                type="text"
                placeholder="Search logistics FAQ, customs guides, or waybill issues..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-950/80 backdrop-blur-md border border-slate-700/80 rounded-2xl text-sm font-mono font-bold text-slate-100 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all placeholder-slate-500"
              />
            </div>
          </div>
        </div>
      </ThreeDCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Ticket Form & Active Tickets */}
        <div className="lg:col-span-2 space-y-6">
          {/* Submit Ticket Card */}
          <ThreeDCard className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-tr from-sky-600 to-blue-500 rounded-xl shadow-lg shadow-sky-500/20">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white tracking-tight">
                  Submit Advisory Ticket
                </h3>
                <p className="text-xs text-slate-400 font-bold mt-0.5">
                  Contact operations managers for delays or address issues
                </p>
              </div>
            </div>

            {successMsg && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/40 rounded-2xl flex items-start gap-3 text-emerald-300 text-sm font-bold animate-fade-in">
                <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-black text-emerald-300 block">
                    Ticket Registered Successfully
                  </span>
                  <span className="text-emerald-400/80 text-xs">
                    A dispatch coordinator has been assigned to investigate your request.
                  </span>
                </div>
              </div>
            )}

            <form onSubmit={handleTicketSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-300 uppercase tracking-wider" htmlFor="ticket-cat">
                    Issue Category
                  </label>
                  <select
                    id="ticket-cat"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3.5 bg-slate-950/80 border border-slate-700 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 rounded-xl text-sm font-bold text-slate-200 outline-none transition cursor-pointer"
                  >
                    <option value="Delivery Delay">Delivery Delay / Transit Stoppage</option>
                    <option value="Address Correction">Recipient Address Correction</option>
                    <option value="Billing Dispute">Billing & Invoicing Issue</option>
                    <option value="Damage Claim">Package Damage Insurance Claim</option>
                    <option value="Technical Support">API & Developer Keys Support</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-300 uppercase tracking-wider" htmlFor="ticket-priority">
                    Priority Level
                  </label>
                  <select
                    id="ticket-priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-4 py-3.5 bg-slate-950/80 border border-slate-700 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 rounded-xl text-sm font-bold text-slate-200 outline-none transition cursor-pointer"
                  >
                    <option value="Low">Low (General Query)</option>
                    <option value="Medium">Medium (Delivery Delay)</option>
                    <option value="High">High (High-Value Customs Hold)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-300 uppercase tracking-wider" htmlFor="ticket-subject">
                  Subject Headline
                </label>
                <input
                  id="ticket-subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Address revision on waybill TRK-8924-M"
                  required
                  className="w-full px-4 py-3.5 bg-slate-950/80 border border-slate-700 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 rounded-xl text-sm font-bold text-slate-200 outline-none transition placeholder-slate-600"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-300 uppercase tracking-wider" htmlFor="ticket-desc">
                  Detailed Description
                </label>
                <textarea
                  id="ticket-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Please state details clearly, including waybill IDs..."
                  required
                  className="w-full px-4 py-3.5 bg-slate-950/80 border border-slate-700 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 rounded-xl text-sm font-bold text-slate-200 outline-none transition placeholder-slate-600 resize-none"
                />
              </div>

              <button
                id="btn-ticket-submit"
                type="submit"
                className="px-6 py-3.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-black text-sm rounded-xl flex items-center gap-2 transition cursor-pointer shadow-lg shadow-sky-500/20"
              >
                <Send className="h-4 w-4" />
                <span>Submit Ticket</span>
              </button>
            </form>
          </ThreeDCard>

          {/* Active Advisory Status Board */}
          <ThreeDCard className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-400" />
              <h3 className="text-lg font-black text-white">
                Active Advisory Status Board
              </h3>
            </div>

            {tickets.length > 0 ? (
              <div className="space-y-3">
                {tickets.map((t) => (
                  <div
                    key={t.id}
                    className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-2.5 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-black font-mono text-sky-400">
                            {t.id}
                          </span>
                          <span className="text-slate-600">•</span>
                          <span className="text-xs text-slate-400 font-bold">
                            {t.category}
                          </span>
                          {t.priority && (
                            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full border ${priorityColors[t.priority] || priorityColors.Medium}`}>
                              {t.priority}
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-black text-white mt-1.5">
                          {t.subject}
                        </h4>
                      </div>

                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase font-mono border ${
                            t.status === "Open"
                              ? "bg-sky-500/15 text-sky-300 border-sky-500/40"
                              : "bg-emerald-500/15 text-emerald-300 border-emerald-500/40"
                          }`}
                        >
                          {t.status}
                        </span>
                        <span className="text-[10px] text-slate-500 font-bold font-mono">
                          {t.date}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs font-medium text-slate-400 leading-relaxed max-w-2xl">
                      {t.description}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center space-y-3">
                <div className="h-16 w-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto">
                  <LifeBuoy className="h-8 w-8 text-slate-600" />
                </div>
                <span className="block text-sm font-bold text-slate-500">
                  No active advisory support tickets currently open.
                </span>
              </div>
            )}
          </ThreeDCard>
        </div>

        {/* Right Column: FAQ & Hotline */}
        <div className="space-y-6">
          {/* FAQ Knowledge Base */}
          <ThreeDCard className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-400" />
              <h3 className="text-lg font-black text-white">Knowledge Base</h3>
            </div>

            <div className="space-y-2.5">
              {filteredFaqs.map((f, idx) => {
                const isOpen = activeFaq === idx;
                const FaqIcon = f.icon;
                return (
                  <div
                    key={idx}
                    className={`border rounded-2xl overflow-hidden transition-all ${
                      isOpen
                        ? "border-sky-500/40 bg-sky-500/5"
                        : "border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveFaq(isOpen ? null : idx)}
                      className="w-full p-4 text-left text-sm font-bold text-slate-200 flex items-start gap-3 transition cursor-pointer"
                    >
                      <FaqIcon className={`h-4.5 w-4.5 mt-0.5 shrink-0 ${isOpen ? "text-sky-400" : "text-slate-500"}`} />
                      <span className="flex-1">{f.q}</span>
                      <ChevronDown
                        className={`h-4 w-4 text-slate-500 transition-transform shrink-0 mt-0.5 ${isOpen ? "rotate-180 text-sky-400" : ""}`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 pl-11 text-sm font-medium text-slate-400 leading-relaxed animate-fade-in">
                        {f.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ThreeDCard>

          {/* Enterprise Dispatch Desk Hotline */}
          <ThreeDCard className="relative overflow-hidden rounded-3xl">
            <div className="p-6 bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 border border-sky-500/20 rounded-3xl space-y-5 relative">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(56,189,248,0.08),transparent_50%)]"></div>

              <div className="relative z-10 space-y-5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-amber-500/20 rounded-lg border border-amber-500/30">
                    <Headphones className="h-4 w-4 text-amber-400" />
                  </div>
                  <h4 className="text-xs font-black text-amber-400 uppercase font-mono tracking-wider">
                    Enterprise Dispatch Desk
                  </h4>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-3 items-start">
                    <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20 shrink-0">
                      <Phone className="h-4 w-4 text-amber-400" />
                    </div>
                    <div>
                      <span className="block text-[10px] font-black text-slate-400 font-mono uppercase tracking-wider">
                        Direct Hotline
                      </span>
                      <span className="block text-sm font-mono font-bold text-white mt-0.5">
                        +49 (0) 40 8924 100
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3 items-start border-t border-slate-800 pt-4">
                    <div className="p-2 bg-sky-500/10 rounded-xl border border-sky-500/20 shrink-0">
                      <Mail className="h-4 w-4 text-sky-400" />
                    </div>
                    <div>
                      <span className="block text-[10px] font-black text-slate-400 font-mono uppercase tracking-wider">
                        Operations Email
                      </span>
                      <span className="block text-sm font-mono font-bold text-white mt-0.5">
                        dispatch.eu@logitrack.com
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3 items-start border-t border-slate-800 pt-4">
                    <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20 shrink-0">
                      <Clock className="h-4 w-4 text-emerald-400" />
                    </div>
                    <div>
                      <span className="block text-[10px] font-black text-slate-400 font-mono uppercase tracking-wider">
                        Advisory Hours
                      </span>
                      <span className="block text-sm font-bold text-emerald-300 mt-0.5">
                        24/7/365 Non-stop Active
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ThreeDCard>
        </div>
      </div>
    </div>
  );
}
