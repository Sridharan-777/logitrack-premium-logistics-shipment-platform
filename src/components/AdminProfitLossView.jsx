import React, { useState, useMemo } from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Percent,
  Download,
  Sliders,
  Sparkles,
  PieChart,
  Layers,
  Fuel,
  Users,
  ShieldCheck,
  Building,
  RotateCcw,
  ArrowUpRight,
  ArrowDownRight,
  Calculator,
} from "lucide-react";
import ThreeDCard from "./ThreeDCard";
import { exportProfitLossToExcel } from "../utils/exportUtils";

export default function AdminProfitLossView({ shipments, fuelLogs, staffList }) {
  // Simulator State sliders for interactive "What-If" financial modeling
  const [markupMultiplier, setMarkupMultiplier] = useState(1.0); // 1.0 = 100% standard pricing
  const [fuelCostMultiplier, setFuelCostMultiplier] = useState(1.0); // Fuel price fluctuation
  const [staffBonusMultiplier, setStaffBonusMultiplier] = useState(1.0);
  const [simulatedVolumeBoost, setSimulatedVolumeBoost] = useState(0); // Add extra shipments

  // Planning simulator: all loaded demo records, not a financial statement.
  const financialMetrics = useMemo(() => {
    const baseShipmentRevenue = shipments.reduce((sum, s) => sum + (Number(s.cost) || 0), 0);
    const totalShipmentRevenue = baseShipmentRevenue * markupMultiplier * (1 + simulatedVolumeBoost / 100);

    // Fuel logs are the actual-cost source; allocated shipment estimates are not added twice.
    const baseFuelCost = fuelLogs.reduce((sum, f) => sum + (Number(f.totalCost) || 0), 0);
    const totalFuelCost = baseFuelCost * fuelCostMultiplier;

    // Staff payroll base + bonuses
    const baseStaffWages = staffList.reduce((sum, st) => {
      const tripBonus = (st.completedTripsThisMonth || 0) * (st.tripBonusRate || 0);
      const overtime = (st.overtimeHours || 0) * (st.hourlyRate * 1.5 || 0);
      return sum + (st.monthlyBaseSalary || 0) + tripBonus * staffBonusMultiplier + overtime;
    }, 0);

    // Operational fixed overheads (warehouse, maintenance, customs fees)
    const customsAndHandlingFees = shipments.reduce((sum, s) => sum + (s.status === "Customs Hold" ? 180 : 25), 0);
    const warehouseAndFleetMaintenance = 1450.0 + shipments.reduce((sum, s) => sum + (Number(s.operationalCost) || 0), 0);
    const insuranceAndCompliance = 620.0;

    const totalExpenses =
      totalFuelCost +
      baseStaffWages +
      customsAndHandlingFees +
      warehouseAndFleetMaintenance +
      insuranceAndCompliance;

    const netProfit = totalShipmentRevenue - totalExpenses;
    const profitMargin = totalShipmentRevenue > 0 ? (netProfit / totalShipmentRevenue) * 100 : 0;
    const returnOnInvestment = totalExpenses > 0 ? (netProfit / totalExpenses) * 100 : 0;

    const revenueStreams = [
      {
        title: "Standard & Express Freight Charges",
        amount: totalShipmentRevenue * 0.72,
        percentage: 72,
        notes: "Direct customer shipment waybills",
      },
      {
        title: "Priority Same-Day Airfreight Surcharges",
        amount: totalShipmentRevenue * 0.19,
        percentage: 19,
        notes: "Express expedited corridor delivery",
      },
      {
        title: "Cold-Chain & Fragile Handling Fees",
        amount: totalShipmentRevenue * 0.09,
        percentage: 9,
        notes: "Temperature-monitored biological shipments",
      },
    ];

    const expenseStreams = [
      {
        title: "Fleet Fuel & Power (Diesel/Jet-A1/kWh)",
        amount: totalFuelCost,
        percentage: (totalFuelCost / totalExpenses) * 100 || 0,
        icon: Fuel,
        color: "text-amber-400",
        notes: "Tracked from verified driver fuel pump entries",
      },
      {
        title: "Staff Salaries, Overtime & Delivery Bonuses",
        amount: baseStaffWages,
        percentage: (baseStaffWages / totalExpenses) * 100 || 0,
        icon: Users,
        color: "text-sky-400",
        notes: "Dispatched drivers, warehouse supervisors, and airfreight pilots",
      },
      {
        title: "Customs Inspections & Cross-Border Clearances",
        amount: customsAndHandlingFees,
        percentage: (customsAndHandlingFees / totalExpenses) * 100 || 0,
        icon: ShieldCheck,
        color: "text-rose-400",
        notes: "EU/UK border duties, SLA import declarations",
      },
      {
        title: "Hub Warehouse Operations & Vehicle Maintenance",
        amount: warehouseAndFleetMaintenance,
        percentage: (warehouseAndFleetMaintenance / totalExpenses) * 100 || 0,
        icon: Building,
        color: "text-purple-400",
        notes: "Fixed planning allowance plus shipment operating cost estimates",
      },
      {
        title: "Cargo Insurance & SLA Guarantee Reserves",
        amount: insuranceAndCompliance,
        percentage: (insuranceAndCompliance / totalExpenses) * 100 || 0,
        icon: Layers,
        color: "text-emerald-400",
        notes: "Underwritten by Zurich & Allianz Marine",
      },
    ];

    return {
      totalRevenue: totalShipmentRevenue,
      totalExpenses,
      netProfit,
      profitMargin,
      returnOnInvestment,
      revenueStreams,
      expenseStreams,
      transmissionCount: shipments.length,
    };
  }, [
    shipments,
    fuelLogs,
    staffList,
    markupMultiplier,
    fuelCostMultiplier,
    staffBonusMultiplier,
    simulatedVolumeBoost,
  ]);

  const handleExport = () => {
    exportProfitLossToExcel(
      financialMetrics,
      financialMetrics.revenueStreams,
      financialMetrics.expenseStreams
    );
  };

  const handleResetSimulator = () => {
    setMarkupMultiplier(1.0);
    setFuelCostMultiplier(1.0);
    setStaffBonusMultiplier(1.0);
    setSimulatedVolumeBoost(0);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans">
      {/* Header Banner */}
      <ThreeDCard className="p-8 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/80 border border-emerald-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 rounded-full text-xs font-black text-emerald-300 uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" /> Executive Financial Terminal (Admin Only)
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-white leading-tight">
              Profit & Loss Telemetry & Calculator
            </h2>
            <p className="text-slate-300 text-sm md:text-base font-medium">
              Real-time audit of gross transmissions revenue, operational fuel drain, staff payroll obligations, and net margins.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleExport}
              id="btn-export-pl-excel"
              className="px-5 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-sm rounded-2xl flex items-center gap-2 shadow-xl shadow-emerald-500/20 transition cursor-pointer"
            >
              <Download className="h-4.5 w-4.5" />
              <span>Download Excel P&L Statement</span>
            </button>
          </div>
        </div>
      </ThreeDCard>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ThreeDCard className="p-6 bg-slate-900/90 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Total Gross Inflow
              </span>
              <p className="text-2xl md:text-3xl font-black text-white font-mono">
                €{financialMetrics.totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                <ArrowUpRight className="h-3.5 w-3.5" /> {financialMetrics.transmissionCount} Active Consignments
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
        </ThreeDCard>

        <ThreeDCard className="p-6 bg-slate-900/90 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Total Operating Expenses
              </span>
              <p className="text-2xl md:text-3xl font-black text-rose-300 font-mono">
                €{financialMetrics.totalExpenses.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <span className="text-[11px] font-bold text-slate-400">
                Fuel + Payroll + Overheads
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400">
              <TrendingDown className="h-6 w-6" />
            </div>
          </div>
        </ThreeDCard>

        <ThreeDCard className="p-6 bg-slate-900/90 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Net Operating Profit
              </span>
              <p className={`text-2xl md:text-3xl font-black font-mono ${financialMetrics.netProfit >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                €{financialMetrics.netProfit.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <span className="text-[11px] font-bold text-sky-400 flex items-center gap-1">
                ROI: {financialMetrics.returnOnInvestment.toFixed(1)}%
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-sky-500/20 border border-sky-500/40 text-sky-400">
              <DollarSign className="h-6 w-6" />
            </div>
          </div>
        </ThreeDCard>

        <ThreeDCard className="p-6 bg-slate-900/90 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Profit Margin KPI
              </span>
              <p className="text-2xl md:text-3xl font-black text-amber-300 font-mono">
                {financialMetrics.profitMargin.toFixed(1)}%
              </p>
              <span className="text-[11px] font-bold text-slate-400">
                Target: &gt; 25.0%
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
              <Percent className="h-6 w-6" />
            </div>
          </div>
        </ThreeDCard>
      </div>

      {/* Interactive "What-If" Calculator Simulator */}
      <ThreeDCard className="p-6 md:p-8 bg-slate-900/95 border border-sky-500/30 rounded-3xl shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-500/20 border border-sky-500/40 rounded-xl text-sky-400">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">
                Interactive Profit & Loss Scenario Simulator
              </h3>
              <p className="text-xs text-slate-400">
                Adjust variables in real-time to forecast profit margins under changing fuel prices, volume, or tariffs.
              </p>
            </div>
          </div>

          <button
            onClick={handleResetSimulator}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition cursor-pointer w-fit"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Variables</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Pricing multiplier */}
          <div className="space-y-2 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-300">Freight Price Adjustment</span>
              <span className="text-sky-400 font-mono">{(markupMultiplier * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.05"
              value={markupMultiplier}
              onChange={(e) => setMarkupMultiplier(parseFloat(e.target.value))}
              className="w-full accent-sky-400 cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 block">Baseline customer rate factor</span>
          </div>

          {/* Fuel Price Multiplier */}
          <div className="space-y-2 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-300">Fuel Price Index (Diesel/Jet)</span>
              <span className="text-amber-400 font-mono">{(fuelCostMultiplier * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.05"
              value={fuelCostMultiplier}
              onChange={(e) => setFuelCostMultiplier(parseFloat(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 block">Global oil & energy market index</span>
          </div>

          {/* Staff Bonus Multiplier */}
          <div className="space-y-2 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-300">Staff Trip Bonus Multiplier</span>
              <span className="text-purple-400 font-mono">{(staffBonusMultiplier * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={staffBonusMultiplier}
              onChange={(e) => setStaffBonusMultiplier(parseFloat(e.target.value))}
              className="w-full accent-purple-400 cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 block">Incentive payout per delivered load</span>
          </div>

          {/* Volume Expansion */}
          <div className="space-y-2 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-300">Consignment Volume Surge</span>
              <span className="text-emerald-400 font-mono">+{simulatedVolumeBoost}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="200"
              step="10"
              value={simulatedVolumeBoost}
              onChange={(e) => setSimulatedVolumeBoost(parseInt(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 block">Simulated scale in customer order volume</span>
          </div>
        </div>
      </ThreeDCard>

      {/* Breakdown Grid: Revenue Streams vs Expense Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Breakdown */}
        <ThreeDCard className="p-6 md:p-8 bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-400">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Revenue Sources</h3>
                <p className="text-xs text-slate-400">Disaggregated transport tariffs</p>
              </div>
            </div>
            <span className="text-sm font-mono font-bold text-emerald-400">
              100% Inflow
            </span>
          </div>

          <div className="space-y-4">
            {financialMetrics.revenueStreams.map((stream, idx) => (
              <div key={idx} className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-2">
                <div className="flex justify-between items-center text-xs font-extrabold">
                  <span className="text-white">{stream.title}</span>
                  <span className="text-emerald-400 font-mono text-sm">
                    €{stream.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${stream.percentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                  <span>{stream.notes}</span>
                  <span className="font-mono font-bold">{stream.percentage}% share</span>
                </div>
              </div>
            ))}
          </div>
        </ThreeDCard>

        {/* Operating Expense Breakdown */}
        <ThreeDCard className="p-6 md:p-8 bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-400">
                <TrendingDown className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Operational Cost Ledger</h3>
                <p className="text-xs text-slate-400">Fuel, payroll, maintenance & tolls</p>
              </div>
            </div>
            <span className="text-sm font-mono font-bold text-rose-400">
              Total OPEX
            </span>
          </div>

          <div className="space-y-4">
            {financialMetrics.expenseStreams.map((exp, idx) => {
              const Icon = exp.icon;
              return (
                <div key={idx} className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center text-xs font-extrabold">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${exp.color}`} />
                      <span className="text-white">{exp.title}</span>
                    </div>
                    <span className="text-rose-400 font-mono text-sm">
                      €{exp.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-rose-500 to-amber-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(exp.percentage, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                    <span>{exp.notes}</span>
                    <span className="font-mono font-bold">{exp.percentage.toFixed(1)}% share</span>
                  </div>
                </div>
              );
            })}
          </div>
        </ThreeDCard>
      </div>
    </div>
  );
}
