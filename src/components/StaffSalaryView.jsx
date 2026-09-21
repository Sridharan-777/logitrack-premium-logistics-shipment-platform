import React, { useState } from "react";
import {
  DollarSign,
  TrendingUp,
  Download,
  Calendar,
  Clock,
  Award,
  CheckCircle,
  FileText,
  ShieldCheck,
  Building,
  CreditCard,
  Lock,
} from "lucide-react";
import ThreeDCard from "./ThreeDCard";
import { downloadCSV } from "../utils/exportUtils";

export default function StaffSalaryView({ staffUser }) {
  const [selectedMonth, setSelectedMonth] = useState("August 2026");

  // Calculate staff compensation figures
  const baseSalary = staffUser?.monthlyBaseSalary ?? 4200;
  const tripBonusRate = staffUser?.tripBonusRate ?? 45;
  const completedTrips = staffUser?.completedTripsThisMonth ?? 34;
  const tripBonusTotal = completedTrips * tripBonusRate;
  const hourlyRate = staffUser?.hourlyRate ?? 28.5;
  const hoursWorked = staffUser?.hoursWorkedThisMonth ?? 160;
  const overtimeHours = staffUser?.overtimeHours ?? 14;
  const overtimePay = overtimeHours * (hourlyRate * 1.5);
  const deductions = staffUser?.deductions ?? 620;

  const grossPay = baseSalary + tripBonusTotal + overtimePay;
  const netPay = grossPay - deductions;

  // Pay slip history
  const paySlips = [
    {
      id: "SLIP-2026-08",
      period: "August 2026",
      gross: grossPay,
      deductions: deductions,
      net: netPay,
      status: "Processing (Payable Aug 31)",
      trips: completedTrips,
    },
    {
      id: "SLIP-2026-07",
      period: "July 2026",
      gross: 5480.0,
      deductions: 590.0,
      net: 4890.0,
      status: "Paid & Deposited",
      trips: 31,
    },
    {
      id: "SLIP-2026-06",
      period: "June 2026",
      gross: 5210.0,
      deductions: 570.0,
      net: 4640.0,
      status: "Paid & Deposited",
      trips: 29,
    },
  ];

  const handleDownloadPaySlip = (slip) => {
    const filename = `LogiTrack_PaySlip_${staffUser.name.replace(/\s+/g, "_")}_${slip.period.replace(/\s+/g, "_")}.csv`;
    const headers = ["Pay Slip Parameter", "Details / Value"];
    const rows = [
      ["Employee Name", staffUser.name],
      ["Employee ID", staffUser.id ?? "STAFF-01"],
      ["Role", staffUser.role],
      ["Pay Period", slip.period],
      ["Base Monthly Salary", `€${baseSalary.toFixed(2)}`],
      ["Completed Delivery Trips", `${slip.trips} consignments`],
      ["Trip Performance Bonuses", `€${tripBonusTotal.toFixed(2)}`],
      ["Overtime Hours Logged", `${overtimeHours} hrs (€${overtimePay.toFixed(2)})`],
      ["Gross Compensation", `€${slip.gross.toFixed(2)}`],
      ["Tax & Social Security Deductions", `-€${slip.deductions.toFixed(2)}`],
      ["Net Bank Payout", `€${slip.net.toFixed(2)}`],
      ["Payout Method", staffUser.paymentMethod ?? "Direct SEPA Bank Wire"],
      ["Authorization", "Verified by LogiTrack Executive Board"],
    ];

    downloadCSV(filename, headers, rows);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans">
      {/* Header Banner */}
      <ThreeDCard className="p-8 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/80 border border-emerald-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 rounded-full text-xs font-black text-emerald-300 uppercase tracking-wider">
              <Lock className="h-3.5 w-3.5 text-emerald-400" /> Private Compensation Portal (Staff Exclusive)
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-white leading-tight">
              Personal Earnings &amp; Salary Statement
            </h2>
            <p className="text-slate-300 text-sm md:text-base font-medium">
              Confidential payroll statement for <strong className="text-white">{staffUser?.name}</strong>. Access itemized trip bonuses, hourly overtime, and official pay slips.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleDownloadPaySlip(paySlips[0])}
              className="px-5 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs md:text-sm rounded-2xl flex items-center gap-2 shadow-xl shadow-emerald-500/20 transition cursor-pointer"
            >
              <Download className="h-4.5 w-4.5 stroke-[2.5]" />
              <span>Download Pay Slip CSV</span>
            </button>
          </div>
        </div>
      </ThreeDCard>

      {/* Salary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ThreeDCard className="p-6 bg-slate-900/90 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Net Monthly Take-Home
              </span>
              <p className="text-2xl md:text-3xl font-black text-emerald-400 font-mono">
                €{netPay.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <span className="text-[11px] font-bold text-emerald-300">
                Direct Bank Wire Payout
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
              <DollarSign className="h-6 w-6" />
            </div>
          </div>
        </ThreeDCard>

        <ThreeDCard className="p-6 bg-slate-900/90 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Trip Delivery Bonus
              </span>
              <p className="text-2xl md:text-3xl font-black text-amber-400 font-mono">
                €{tripBonusTotal.toFixed(2)}
              </p>
              <span className="text-[11px] font-bold text-slate-400">
                {completedTrips} deliveries @ €{tripBonusRate}/trip
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
              <Award className="h-6 w-6" />
            </div>
          </div>
        </ThreeDCard>

        <ThreeDCard className="p-6 bg-slate-900/90 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Base Monthly Salary
              </span>
              <p className="text-2xl md:text-3xl font-black text-white font-mono">
                €{baseSalary.toFixed(2)}
              </p>
              <span className="text-[11px] font-bold text-sky-400">
                Guaranteed Contract Base
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-sky-500/20 border border-sky-500/40 text-sky-400">
              <Building className="h-6 w-6" />
            </div>
          </div>
        </ThreeDCard>

        <ThreeDCard className="p-6 bg-slate-900/90 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Overtime Logged
              </span>
              <p className="text-2xl md:text-3xl font-black text-purple-400 font-mono">
                €{overtimePay.toFixed(2)}
              </p>
              <span className="text-[11px] font-bold text-purple-300">
                {overtimeHours} hrs @ 1.5x rate
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-purple-500/20 border border-purple-500/40 text-purple-400">
              <Clock className="h-6 w-6" />
            </div>
          </div>
        </ThreeDCard>
      </div>

      {/* Itemized Compensation Breakdown */}
      <ThreeDCard className="p-6 md:p-8 bg-slate-900/95 border border-slate-800 rounded-3xl shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-black text-white">Itemized Pay Statement for {selectedMonth}</h3>
            <p className="text-xs text-slate-400">Audited salary components and incentive bonus ledger</p>
          </div>
          <span className="px-3 py-1 bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-xs font-mono font-bold">
            Account: {staffUser?.paymentMethod ?? "DE89 •••• 4021"}
          </span>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-sm font-bold text-white block">Standard Monthly Base Compensation</span>
              <span className="text-xs text-slate-400">160 Standard contracted logistics hours</span>
            </div>
            <span className="text-base font-black font-mono text-white">€{baseSalary.toFixed(2)}</span>
          </div>

          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-sm font-bold text-amber-400 block">Completed Delivery Missions Bonus</span>
              <span className="text-xs text-slate-400">
                {completedTrips} successfully delivered consignments × €{tripBonusRate} / delivery
              </span>
            </div>
            <span className="text-base font-black font-mono text-amber-400">+€{tripBonusTotal.toFixed(2)}</span>
          </div>

          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-sm font-bold text-purple-400 block">Overtime Hours Surcharge</span>
              <span className="text-xs text-slate-400">
                {overtimeHours} approved overtime hours × €{(hourlyRate * 1.5).toFixed(2)}/hr (150% rate)
              </span>
            </div>
            <span className="text-base font-black font-mono text-purple-400">+€{overtimePay.toFixed(2)}</span>
          </div>

          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-sm font-bold text-rose-400 block">Statutory Deductions &amp; Social Taxes</span>
              <span className="text-xs text-slate-400">Health insurance, pension &amp; income tax withholding</span>
            </div>
            <span className="text-base font-black font-mono text-rose-400">-€{deductions.toFixed(2)}</span>
          </div>

          <div className="p-5 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-400 block">
                Total Net Disbursement
              </span>
              <span className="text-xs text-slate-300">Ready for automated deposit on August 31, 2026</span>
            </div>
            <span className="text-2xl font-black font-mono text-emerald-400">€{netPay.toFixed(2)}</span>
          </div>
        </div>
      </ThreeDCard>

      {/* Historical Pay Slips Table */}
      <ThreeDCard className="p-6 md:p-8 bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-black text-white">Historical Pay Slips &amp; Tax Records</h3>
            <p className="text-xs text-slate-400">Download verified payroll certificates</p>
          </div>
        </div>

        <div className="space-y-3">
          {paySlips.map((slip) => (
            <div
              key={slip.id}
              className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-700 transition"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-400">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">{slip.period}</h4>
                  <span className="text-xs text-slate-400 font-mono">
                    ID: {slip.id} • {slip.trips} Deliveries Logged
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-sm font-black text-emerald-400 font-mono block">
                    €{slip.net.toFixed(2)} Net
                  </span>
                  <span className="text-[10px] text-slate-400">{slip.status}</span>
                </div>

                <button
                  onClick={() => handleDownloadPaySlip(slip)}
                  className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl transition cursor-pointer border border-slate-700 flex items-center gap-1.5 text-xs font-bold"
                >
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </ThreeDCard>
    </div>
  );
}
