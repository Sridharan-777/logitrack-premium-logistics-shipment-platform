// Excel / CSV Export Utilities for LogiTrack 3D Logistics Platform
// Outputs UTF-8 formatted CSV with Byte-Order-Mark (BOM) for 100% native compatibility with Microsoft Excel, Apple Numbers, Google Sheets, and LibreOffice.

/**
 * Escapes fields for CSV format
 */
function formatCSVField(val) {
  if (val === null || val === undefined) return '""';
  let stringVal = String(val).replace(/"/g, '""');
  // If string contains comma, newline, or double quote, wrap in quotes
  if (stringVal.includes(",") || stringVal.includes("\n") || stringVal.includes('"')) {
    return `"${stringVal}"`;
  }
  return `"${stringVal}"`;
}

/**
 * Converts headers and rows array into a downloadable Excel-compatible CSV file
 */
export function downloadCSV(filename, headers, rows) {
  const headerRow = headers.map(formatCSVField).join(",");
  const dataRows = rows.map((row) => row.map(formatCSVField).join(","));
  
  // \uFEFF is the UTF-8 BOM for Microsoft Excel to recognize UTF-8 encoding properly
  const csvContent = "\uFEFF" + [headerRow, ...dataRows].join("\r\n");
  
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports all Transmission/Shipment data into an Excel spreadsheet
 */
export function exportShipmentsToExcel(shipments) {
  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = `LogiTrack_Transmissions_Manifest_${timestamp}.csv`;

  const headers = [
    "Waybill ID",
    "Status",
    "Booking Date",
    "Origin City",
    "Origin Address",
    "Destination City",
    "Destination Address",
    "Sender Name",
    "Sender Phone",
    "Receiver Name",
    "Receiver Phone",
    "Category",
    "Weight (kg)",
    "Dimensions (cm)",
    "Delivery Speed",
    "Revenue / Price (€)",
    "Operational Cost (€)",
    "Fuel Expense (€)",
    "Assigned Driver / Staff",
    "Current Location",
    "Estimated Delivery",
    "Fragile",
    "Insured",
    "Customer Needs & Notes",
  ];

  const rows = shipments.map((s) => [
    s.id,
    s.status,
    s.bookingDate || "N/A",
    s.senderCity,
    s.senderAddress,
    s.receiverCity,
    s.receiverAddress,
    s.senderName,
    s.senderPhone,
    s.receiverName,
    s.receiverPhone,
    s.category,
    s.weight,
    s.dimensions,
    s.speed,
    s.cost ? `€${Number(s.cost).toFixed(2)}` : "€0.00",
    s.operationalCost ? `€${Number(s.operationalCost).toFixed(2)}` : "€0.00",
    s.fuelExpense ? `€${Number(s.fuelExpense).toFixed(2)}` : "€0.00",
    s.assignedStaffName || "Unassigned",
    s.currentLocation || "In Transit",
    s.estimatedDelivery || "N/A",
    s.fragile ? "Yes" : "No",
    s.insurance ? "Yes" : "No",
    s.customerNeeds || "Standard shipping protocol",
  ]);

  downloadCSV(filename, headers, rows);
}

/**
 * Exports Profit & Loss statement to Excel
 */
export function exportProfitLossToExcel(summary, revenueItems, expenseItems) {
  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = `LogiTrack_Profit_and_Loss_Statement_${timestamp}.csv`;

  const headers = [
    "Financial Line Item",
    "Category",
    "Amount (€)",
    "Margin / Share (%)",
    "Notes & Audit Reference",
  ];

  const rows = [
    ["=== REVENUE SUMMARY ===", "", "", "", ""],
    ...revenueItems.map((item) => [
      item.title,
      "Revenue Stream",
      `€${item.amount.toFixed(2)}`,
      `${item.percentage.toFixed(1)}%`,
      item.notes,
    ]),
    ["TOTAL GROSS REVENUE", "Gross Inflow", `€${summary.totalRevenue.toFixed(2)}`, "100.0%", "Aggregated customer billings"],
    ["", "", "", "", ""],
    ["=== OPERATIONAL EXPENSES ===", "", "", "", ""],
    ...expenseItems.map((item) => [
      item.title,
      "Operating Expense",
      `€${item.amount.toFixed(2)}`,
      `${item.percentage.toFixed(1)}%`,
      item.notes,
    ]),
    ["TOTAL OPERATING EXPENSES", "Gross Outflow", `€${summary.totalExpenses.toFixed(2)}`, `${((summary.totalExpenses / summary.totalRevenue) * 100).toFixed(1)}%`, "Total Logistics OPEX"],
    ["", "", "", "", ""],
    ["=== NET PROFITABILITY ===", "", "", "", ""],
    ["NET OPERATING PROFIT", "Net Earning", `€${summary.netProfit.toFixed(2)}`, `${summary.profitMargin.toFixed(1)}%`, "Net before corporate tax"],
    ["PROFIT MARGIN RATE", "KPI", `${summary.profitMargin.toFixed(2)}%`, "-", "Net Margin %"],
    ["TOTAL TRANSMISSIONS HELD", "Volume", `${summary.transmissionCount} consignments`, "-", "Active manifest records"],
  ];

  downloadCSV(filename, headers, rows);
}

/**
 * Exports Fleet Fuel Consumption logs to Excel
 */
export function exportFuelLogsToExcel(fuelLogs, fleet) {
  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = `LogiTrack_Fleet_Fuel_and_Mileage_Ledger_${timestamp}.csv`;

  const headers = [
    "Log ID",
    "Date",
    "Vehicle Plate / Name",
    "Assigned Driver",
    "Route / Mission",
    "Distance Logged (km)",
    "Fuel Consumed",
    "Unit Type",
    "Cost Per Unit (€)",
    "Total Fuel Cost (€)",
    "Calculated Efficiency",
    "Log Notes",
  ];

  const rows = fuelLogs.map((log) => [
    log.id,
    log.date,
    log.vehicleName,
    log.driverName,
    log.route,
    log.distanceKm,
    log.fuelAmount,
    log.fuelUnit,
    `€${Number(log.costPerUnit).toFixed(2)}`,
    `€${Number(log.totalCost).toFixed(2)}`,
    log.efficiency,
    log.notes || "",
  ]);

  downloadCSV(filename, headers, rows);
}

/**
 * Exports Staff Payroll and Salary records to Excel
 */
export function exportPayrollToExcel(staffList) {
  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = `LogiTrack_Staff_Payroll_Statement_${timestamp}.csv`;

  const headers = [
    "Staff ID",
    "Full Name",
    "Role Designation",
    "Email",
    "Phone",
    "Assigned Vehicle / Station",
    "Base Monthly Salary (€)",
    "Hourly Rate (€/hr)",
    "Hours Logged",
    "Overtime Hours",
    "Deliveries Completed",
    "Trip Bonuses (€)",
    "Gross Monthly Pay (€)",
    "Tax & Deductions (€)",
    "Net Monthly Payout (€)",
    "Performance Rating",
    "Payout Status",
  ];

  const rows = staffList.map((st) => {
    const tripBonusTotal = (st.completedTripsThisMonth || 0) * (st.tripBonusRate || 0);
    const overtimePay = (st.overtimeHours || 0) * (st.hourlyRate * 1.5 || 0);
    const gross = (st.monthlyBaseSalary || 0) + tripBonusTotal + overtimePay;
    const deductions = st.deductions || 0;
    const net = gross - deductions;

    return [
      st.id,
      st.name,
      st.role,
      st.email,
      st.phone,
      st.assignedVehicle,
      `€${Number(st.monthlyBaseSalary).toFixed(2)}`,
      `€${Number(st.hourlyRate).toFixed(2)}`,
      st.hoursWorkedThisMonth,
      st.overtimeHours,
      st.completedTripsThisMonth,
      `€${tripBonusTotal.toFixed(2)}`,
      `€${gross.toFixed(2)}`,
      `€${deductions.toFixed(2)}`,
      `€${net.toFixed(2)}`,
      `${st.rating} / 5.0`,
      "Approved & Ready",
    ];
  });

  downloadCSV(filename, headers, rows);
}

/**
 * Exports Field Delivery Workers & Couriers to Excel
 */
export function exportWorkersToExcel(workersList) {
  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = `LogiTrack_Field_Workers_Directory_${timestamp}.csv`;

  const headers = [
    "Worker ID",
    "Full Name",
    "Role Designation",
    "Email",
    "Phone",
    "Transport Mode",
    "Vehicle Description",
    "Assigned Zone",
    "Current Status",
    "Completed Drops Today",
    "Daily Earnings (€)",
    "Performance Rating",
  ];

  const rows = workersList.map((w) => [
    w.id,
    w.name,
    w.role,
    w.email,
    w.phone,
    (w.transportMode || "two-wheeler").toUpperCase(),
    w.vehicleType || "Standard Vehicle",
    w.zone || "Urban Sector",
    w.status || "Active",
    w.completedToday || 0,
    `€${Number(w.dailyEarnings || 0).toFixed(2)}`,
    `${w.rating || 5.0} / 5.0`,
  ]);

  downloadCSV(filename, headers, rows);
}

