import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import LandingPage from "./components/LandingPage";
import { LoginView, RegisterView } from "./components/AuthViews";
import DashboardView from "./components/DashboardView";
import BookingFlow from "./components/BookingFlow";
import TrackingView from "./components/TrackingView";
import ShipmentsListView from "./components/ShipmentsListView";
import SupportView from "./components/SupportView";
import NotificationsView from "./components/NotificationsView";
import ProfileView from "./components/ProfileView";
import ShipmentDetailsView from "./components/ShipmentDetailsView";
import ThreeDBackground from "./components/ThreeDBackground";
import AdminProfitLossView from "./components/AdminProfitLossView";
import AdminFuelTrackerView from "./components/AdminFuelTrackerView";
import AdminStaffManagementView from "./components/AdminStaffManagementView";
import AdminShipmentManagerModal from "./components/AdminShipmentManagerModal";
import StaffWorkspaceView from "./components/StaffWorkspaceView";
import StaffSalaryView from "./components/StaffSalaryView";
import WorkerWorkspaceView from "./components/WorkerWorkspaceView";
import {
  ROLES,
  INITIAL_USERS,
  INITIAL_SHIPMENTS,
  INITIAL_STAFF_MEMBERS,
  INITIAL_WORKERS,
  INITIAL_CUSTOMERS,
  INITIAL_FLEET,
  INITIAL_FUEL_LOGS,
} from "./data/mockData";
import { AlertCircle, CheckCircle, Upload, X } from "lucide-react";

export default function App() {
  // Current view routing state
  const [view, setView] = useState("landing");

  // Theme switching state
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("logitrack-theme") || "dark";
    } catch {
      return "dark";
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("logitrack-theme", theme);
    } catch {}
  }, [theme]);

  // Customs hold modal simulator
  const [resolvingHoldId, setResolvingHoldId] = useState(null);
  const [customsDocumentAttached, setCustomsDocumentAttached] = useState(false);
  const [customsSuccess, setCustomsSuccess] = useState(false);
  const [customsError, setCustomsError] = useState(null);
  const [searchFeedback, setSearchFeedback] = useState(null);
  const [guestSearchFeedback, setGuestSearchFeedback] = useState(null);

  // Active Admin Edit Shipment modal
  const [editingShipment, setEditingShipment] = useState(null);

  // Authenticated user profile state
  const [user, setUser] = useState({
    ...INITIAL_USERS.customer,
  });

  // State Ledgers
  const [shipments, setShipments] = useState(INITIAL_SHIPMENTS);
  const [staffList, setStaffList] = useState(INITIAL_STAFF_MEMBERS);
  const [workersList, setWorkersList] = useState(INITIAL_WORKERS);
  const [customersList, setCustomersList] = useState(INITIAL_CUSTOMERS);
  const [fleet, setFleet] = useState(INITIAL_FLEET);
  const [fuelLogs, setFuelLogs] = useState(INITIAL_FUEL_LOGS);

  // Support Tickets Ledger
  const [tickets, setTickets] = useState([
    {
      id: "TCK-3021",
      subject: "Address correction request for TRK-8924-M",
      category: "Address Correction",
      status: "Open",
      date: "08/29/2026",
      description:
        "Recipient noted Canary Wharf Blvd suite should be Level 14 instead of Level 12. Please amend before customs clearance completes.",
      priority: "Medium",
    },
    {
      id: "TCK-2940",
      subject: "Customs hold clarification on TRK-900112-E",
      category: "Delivery Delay",
      status: "Resolved",
      date: "08/28/2026",
      description:
        "Inquired what exact commercial values are missing. Representative confirmed invoice file needs to state clear country of origin declarations.",
      priority: "High",
    },
  ]);

  // Notifications Ledger
  const [notifications, setNotifications] = useState([
    {
      id: "n-1",
      type: "alert",
      title: "Action Required: Customs Delay",
      message:
        "Border officials held shipment TRK-900112-E in UK Customs due to missing tax/valuation invoices.",
      time: "2 hours ago",
      read: false,
    },
    {
      id: "n-2",
      type: "update",
      title: "Doorstep Run Active (Two-Wheeler)",
      message:
        "Rahul Sharma on Ather 450X EV Scooter dispatched for final doorstep handoff of TRK-774109-C.",
      time: "3 hours ago",
      read: false,
    },
    {
      id: "n-3",
      type: "billing",
      title: "P&L Financial Audit Statement Ready",
      message:
        "Compiled operating gross revenue and fuel logs are available in Executive Controls.",
      time: "1 day ago",
      read: false,
    },
  ]);

  // Currently selected shipment for drill-down details or live map tracking
  const [selectedShipmentId, setSelectedShipmentId] = useState(null);

  // Authentication State triggers
  const handleLoginSuccess = (name, email, role = ROLES.USER) => {
    let profileData = {};
    if (role === ROLES.ADMIN) {
      profileData = { ...INITIAL_USERS.admin };
      setView("dashboard");
    } else if (role === ROLES.STAFF) {
      const matchingStaff = staffList.find((s) => s.email.toLowerCase() === email.toLowerCase()) || staffList[0];
      profileData = {
        ...INITIAL_USERS.staff,
        ...matchingStaff,
        systemRole: ROLES.STAFF,
      };
      setView("staff-workspace");
    } else if (role === ROLES.WORKER) {
      const matchingWorker = workersList.find((w) => w.email.toLowerCase() === email.toLowerCase()) || workersList[0];
      profileData = {
        ...INITIAL_USERS.worker,
        ...matchingWorker,
        systemRole: ROLES.WORKER,
      };
      setView("worker-workspace");
    } else {
      const isSridharan =
        email.toLowerCase() === "24104029@nec.edu.in" ||
        name.toLowerCase().includes("sridharan");
      profileData = isSridharan ? { ...INITIAL_USERS.customer } : {
        id: `usr-${Date.now()}`,
        name: name,
        email: email,
        phone: "+1 (555) 012-3456",
        company: "Enterprise Partner",
        avatar: name.slice(0, 2).toUpperCase(),
        memberSince: "Aug 2026",
        displayName: name.split(" ")[0],
        role: "Client Logistics Manager",
        systemRole: ROLES.USER,
        accountType: "Individual Customer",
        location: "Tamil Nadu, India",
        addresses: [],
      };
      setView("dashboard");
    }

    setUser(profileData);
  };

  const handleSwitchRole = (newRole) => {
    if (newRole === ROLES.ADMIN) {
      setUser({ ...INITIAL_USERS.admin });
      setView("dashboard");
    } else if (newRole === ROLES.STAFF) {
      setUser({ ...INITIAL_USERS.staff, ...staffList[0], systemRole: ROLES.STAFF });
      setView("staff-workspace");
    } else if (newRole === ROLES.WORKER) {
      setUser({ ...INITIAL_USERS.worker, ...workersList[0], systemRole: ROLES.WORKER });
      setView("worker-workspace");
    } else {
      setUser({ ...INITIAL_USERS.customer });
      setView("dashboard");
    }
  };

  const handleLogout = () => {
    setUser(null);
    setView("landing");
  };

  // Callback when a user books a courier
  const handleBookingComplete = (newShipment) => {
    // Automatically assign to available worker (prefer two-wheeler for speed)
    const assignedWorker = workersList.find((w) => w.transportMode === "two-wheeler") || workersList[0];
    const assignedStaff = staffList[0];

    const enrichedShipment = {
      ...newShipment,
      assignedStaffId: assignedStaff.id,
      assignedStaffName: `${assignedStaff.name} (Supervisor)`,
      assignedWorkerId: assignedWorker.id,
      assignedWorkerName: assignedWorker.name,
      transportModeUsed: assignedWorker.transportMode || "two-wheeler",
      workerVehicleName: assignedWorker.vehicleType,
      receivedByCustomer: false,
      deliveryAttemptCount: 1,
      escalationStatus: "Normal",
      operationalCost: parseFloat(((newShipment.cost || 50) * 0.55).toFixed(2)),
      fuelExpense: parseFloat(((newShipment.cost || 50) * 0.18).toFixed(2)),
    };

    setShipments([enrichedShipment, ...shipments]);
    setSelectedShipmentId(enrichedShipment.id);

    const newNotif = {
      id: `n-${Date.now()}`,
      type: "update",
      title: "Consignment Booked & Assigned",
      message: `Waybill ${enrichedShipment.id} assigned to Two-Wheeler Courier ${assignedWorker.name} under supervision of ${assignedStaff.name}.`,
      time: "Just now",
      read: false,
    };
    setNotifications([newNotif, ...notifications]);
  };

  // Staff workflow status update
  const handleUpdateShipmentStatus = (shipmentId, newStatus, note = "") => {
    setShipments(
      shipments.map((s) => {
        if (s.id === shipmentId) {
          const newTimelineEvent = {
            id: `t-staff-${Date.now()}`,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            status: newStatus,
            location: s.currentLocation || "En Route",
            description: note || `Dispatched staff ${user.name} advanced consignment to '${newStatus}'.`,
          };

          return {
            ...s,
            status: newStatus,
            receivedByCustomer: newStatus === "Delivered" ? true : s.receivedByCustomer,
            timeline: [newTimelineEvent, ...s.timeline],
          };
        }
        return s;
      })
    );

    const notif = {
      id: `n-${Date.now()}`,
      type: "update",
      title: `Status Updated: ${newStatus}`,
      message: `Waybill ${shipmentId} milestone was marked '${newStatus}' by ${user.name}.`,
      time: "Just now",
      read: false,
    };
    setNotifications([notif, ...notifications]);
  };

  // Worker completes doorstep delivery
  const handleWorkerCompleteDelivery = (shipmentId, proofData) => {
    setShipments(
      shipments.map((s) => {
        if (s.id === shipmentId) {
          const deliveryEvent = {
            id: `t-wk-del-${Date.now()}`,
            time: proofData.timestamp || "Just now",
            status: "Delivered",
            location: `${s.receiverAddress}, ${s.receiverCity}`,
            description: `Doorstep handoff verified. Signed by ${proofData.signedBy}. (${proofData.transportMode?.toUpperCase() || "TWO-WHEELER"})`,
          };

          return {
            ...s,
            status: "Delivered",
            receivedByCustomer: true,
            escalationStatus: "Resolved",
            currentLocation: `Delivered at Doorstep (${s.receiverCity})`,
            proofOfDelivery: {
              signedBy: proofData.signedBy,
              timestamp: proofData.timestamp,
              signatureCode: `SIG-${Date.now().toString().slice(-6)}`,
            },
            timeline: [deliveryEvent, ...s.timeline],
          };
        }
        return s;
      })
    );

    // Increment worker completed count & earnings
    setWorkersList(
      workersList.map((w) => {
        if (w.id === user.id || w.name === user.name) {
          return {
            ...w,
            completedToday: (w.completedToday || 0) + 1,
            dailyEarnings: (w.dailyEarnings || 95) + 6.5,
          };
        }
        return w;
      })
    );

    const notif = {
      id: `n-${Date.now()}`,
      type: "update",
      title: "Doorstep Delivery Verified ✓",
      message: `Consignment ${shipmentId} was handed over and signed by ${proofData.signedBy}.`,
      time: "Just now",
      read: false,
    };
    setNotifications([notif, ...notifications]);
  };

  // Worker reports doorstep issue
  const handleWorkerReportIssue = (shipmentId, issueData) => {
    setShipments(
      shipments.map((s) => {
        if (s.id === shipmentId) {
          const issueEvent = {
            id: `t-wk-issue-${Date.now()}`,
            time: issueData.timestamp || "Just now",
            status: "Doorstep Attempt Failed",
            location: `${s.receiverCity}`,
            description: `Courier ${issueData.reportedBy} reported: ${issueData.reason}`,
          };

          return {
            ...s,
            escalationStatus: "Action Required",
            timeline: [issueEvent, ...s.timeline],
          };
        }
        return s;
      })
    );

    const notif = {
      id: `n-${Date.now()}`,
      type: "alert",
      title: "Doorstep Delivery Issue Reported ⚠️",
      message: `Waybill ${shipmentId}: ${issueData.reason}. Staff supervisor review requested.`,
      time: "Just now",
      read: false,
    };
    setNotifications([notif, ...notifications]);
  };

  // Worker updates transport mode
  const handleWorkerUpdateTransportMode = (workerId, transportMode) => {
    setWorkersList(
      workersList.map((w) => (w.id === workerId ? { ...w, transportMode } : w))
    );
    setUser((prev) => ({ ...prev, transportMode }));
  };

  // Staff reassigns courier to consignment
  const handleReassignWorker = (shipmentId, workerId, workerName, transportMode) => {
    setShipments(
      shipments.map((s) => {
        if (s.id === shipmentId) {
          const reassignedEvent = {
            id: `t-reassign-${Date.now()}`,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            status: "Courier Reassigned",
            location: s.currentLocation || "Local Hub",
            description: `Staff supervisor reassigned parcel to ${workerName} (${transportMode.toUpperCase()}).`,
          };

          return {
            ...s,
            assignedWorkerId: workerId,
            assignedWorkerName: workerName,
            transportModeUsed: transportMode,
            timeline: [reassignedEvent, ...s.timeline],
          };
        }
        return s;
      })
    );
  };

  // Staff triggers rapid redelivery
  const handleTriggerRedelivery = (shipmentId) => {
    setShipments(
      shipments.map((s) => {
        if (s.id === shipmentId) {
          const redeliverEvent = {
            id: `t-redeliv-${Date.now()}`,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            status: "Redelivery Scheduled",
            location: s.currentLocation || "Local Transit Berth",
            description: `Expedited redelivery run approved by supervisor ${user.name}.`,
          };

          return {
            ...s,
            status: "Out for Delivery",
            escalationStatus: "Normal",
            deliveryAttemptCount: (s.deliveryAttemptCount || 1) + 1,
            timeline: [redeliverEvent, ...s.timeline],
          };
        }
        return s;
      })
    );
  };

  // CRUD for Workers (Shared by Admin & Staff)
  const handleAddWorker = (newWorker) => {
    setWorkersList([newWorker, ...workersList]);
  };

  const handleUpdateWorker = (updated) => {
    setWorkersList(workersList.map((w) => (w.id === updated.id ? updated : w)));
  };

  const handleDeleteWorker = (workerId) => {
    setWorkersList(workersList.filter((w) => w.id !== workerId));
  };

  // CRUD for Customers (Shared by Admin & Staff)
  const handleAddCustomer = (newCustomer) => {
    setCustomersList([newCustomer, ...customersList]);
  };

  const handleUpdateCustomer = (updated) => {
    setCustomersList(customersList.map((c) => (c.id === updated.id ? updated : c)));
  };

  const handleDeleteCustomer = (custId) => {
    setCustomersList(customersList.filter((c) => c.id !== custId));
  };

  // CRUD for Staff (Admin Only)
  const handleAddStaff = (newStaff) => {
    setStaffList([newStaff, ...staffList]);
  };

  const handleUpdateStaff = (updated) => {
    setStaffList(staffList.map((st) => (st.id === updated.id ? updated : st)));
  };

  const handleDeleteStaff = (staffId) => {
    setStaffList(staffList.filter((st) => st.id !== staffId));
  };

  // Admin save modified shipment
  const handleSaveEditedShipment = (updated) => {
    setShipments(shipments.map((s) => (s.id === updated.id ? updated : s)));
    setEditingShipment(null);

    const notif = {
      id: `n-${Date.now()}`,
      type: "update",
      title: "Manifest Record Modified",
      message: `Administrator modified parameters for waybill ${updated.id}.`,
      time: "Just now",
      read: false,
    };
    setNotifications([notif, ...notifications]);
  };

  // Add fuel log entry
  const handleAddFuelLog = (newEntry) => {
    setFuelLogs([newEntry, ...fuelLogs]);

    if (newEntry.vehicleId) {
      setFleet(
        fleet.map((v) => {
          if (v.id === newEntry.vehicleId) {
            return {
              ...v,
              currentOdometerKm: (v.currentOdometerKm || 10000) + (newEntry.distanceKm || 0),
              currentFuelLevel: Math.min(100, (v.currentFuelLevel || 50) + 30),
            };
          }
          return v;
        })
      );
    }

    const notif = {
      id: `n-${Date.now()}`,
      type: "billing",
      title: "Fuel / Charging Ledger Recorded",
      message: `Logged ${newEntry.fuelAmount} ${newEntry.fuelUnit} (€${newEntry.totalCost.toFixed(2)}) for vehicle ${newEntry.vehicleName}.`,
      time: "Just now",
      read: false,
    };
    setNotifications([notif, ...notifications]);
  };

  // Global shipment search helper
  const handleSearchShipmentGlobal = (query) => {
    setSearchFeedback(null);
    const cleanQuery = query.trim().toUpperCase();
    const found = shipments.find(
      (s) =>
        s.id.toUpperCase() === cleanQuery ||
        s.id.toUpperCase().includes(cleanQuery) ||
        s.receiverName.toUpperCase().includes(cleanQuery)
    );

    if (found) {
      setSelectedShipmentId(found.id);
      setView("shipment-details");
    } else {
      setSearchFeedback(`No consignment matching waybill ID or recipient "${query}" was found.`);
    }
  };

  // Search handler specifically on Landing Page for guest users
  const handleGuestSearchShipment = (query) => {
    setGuestSearchFeedback(null);
    const cleanQuery = query.trim().toUpperCase();
    const found = shipments.find(
      (s) =>
        s.id.toUpperCase() === cleanQuery ||
        s.id.toUpperCase().includes(cleanQuery) ||
        s.receiverName.toUpperCase().includes(cleanQuery)
    );

    if (found) {
      setSelectedShipmentId(found.id);
      setUser({ ...INITIAL_USERS.customer });
      setView("track-live");
    } else {
      setGuestSearchFeedback(
        `Unable to find waybill "${query}". Please check the tracking number or try demo tracking code TRK-8924-M.`
      );
    }
  };

  // Drilldown to details view for a selected shipment
  const navigateToShipment = (id) => {
    setSelectedShipmentId(id);
    setView("shipment-details");
  };

  // Quick Action: Resolve customs hold trigger
  const handleQuickActionResolveHold = (shipmentId) => {
    setResolvingHoldId(shipmentId);
    setCustomsDocumentAttached(false);
    setCustomsSuccess(false);
    setCustomsError(null);
  };

  const handleSimulateCustomsClearance = (e) => {
    e.preventDefault();
    if (!customsDocumentAttached) {
      setCustomsError("Please select or attach a valid waybill commercial invoice PDF.");
      return;
    }

    setCustomsSuccess(true);
    setTimeout(() => {
      setShipments(
        shipments.map((s) => {
          if (s.id === resolvingHoldId) {
            return {
              ...s,
              status: "In Transit",
              estimatedDelivery: "Tomorrow by 6:00 PM",
              currentLocation: "Frankfurt Hub Departure",
              timeline: [
                {
                  id: `evt-${Date.now()}`,
                  time: new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                  status: "Customs Cleared",
                  location: "UK Border Control",
                  description:
                    "Commercial invoice audited successfully. Cargo pre-vetted for direct road freight transit.",
                },
                ...s.timeline,
              ],
            };
          }
          return s;
        })
      );

      const resolveNotif = {
        id: `n-${Date.now()}`,
        type: "update",
        title: "Customs Clearance Approved",
        message: `Consignment waybill ${resolvingHoldId} has cleared UK border security and is now back In Transit.`,
        time: "Just now",
        read: false,
      };
      setNotifications([resolveNotif, ...notifications]);

      setTickets(
        tickets.map((t) => {
          if (t.subject.includes(resolvingHoldId || "")) {
            return { ...t, status: "Resolved" };
          }
          return t;
        })
      );

      setResolvingHoldId(null);
    }, 1200);
  };

  const isAuthView = view !== "landing" && view !== "login" && view !== "register";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-sky-500/30 relative font-sans">
      <ThreeDBackground />

      {/* AUTHENTICATED SYSTEM LAYOUT */}
      {isAuthView && user ? (
        <div className="min-h-screen pl-0 md:pl-64 flex flex-col relative z-10">
          {/* Side navigation bar */}
          <Sidebar
            currentView={view}
            onNavigate={(v) => {
              setView(v);
              if (!v.startsWith("book-") && v !== "track-live" && v !== "shipment-details") {
                setSelectedShipmentId(null);
              }
            }}
            unreadNotifications={notifications.filter((n) => !n.read).length}
            onLogout={handleLogout}
            user={user}
          />

          {/* Top header search & dates bar */}
          <Header
            title={
              view === "dashboard"
                ? user.systemRole === ROLES.ADMIN
                  ? "Executive Operations Control"
                  : "Operations Control Terminal"
                : view === "profit-loss"
                ? "Profit & Loss Calculator (Admin Only)"
                : view === "fuel-tracker"
                ? "Fleet Fuel & Distance Ledger"
                : view === "staff-management"
                ? "Staff & Workers Master CRUD"
                : view === "staff-workspace"
                ? "Parcel Receipt & Dispatch Console"
                : view === "worker-workspace"
                ? "Doorstep Delivery Runs & Vehicle Mode"
                : view === "staff-salary"
                ? "My Salary & Personal Compensation"
                : view.startsWith("book-")
                ? "Courier Booking Wizard"
                : view === "track-live"
                ? "Live GPS Satellite Tracking Map"
                : view === "my-shipments"
                ? "Waybill Manifest Ledger"
                : view === "shipment-details"
                ? "Waybill Registry Detail"
                : view === "support"
                ? "Operations Advisory Desk"
                : view === "notifications"
                ? "Enterprise Alert Board"
                : "Profile & Settings Workspace"
            }
            onSearchShipment={handleSearchShipmentGlobal}
            onNavigate={setView}
            unreadNotifications={notifications.filter((n) => !n.read).length}
            user={user}
            theme={theme}
            onToggleTheme={setTheme}
            onSwitchRole={handleSwitchRole}
          />

          {searchFeedback && (
            <div className="mx-4 md:mx-8 mt-4 p-4 bg-rose-950/80 border border-rose-500/50 rounded-xl flex items-center justify-between text-rose-200 text-sm font-semibold animate-fade-in">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="h-5 w-5 text-rose-400" />
                <span>{searchFeedback}</span>
              </div>
              <button
                onClick={() => setSearchFeedback(null)}
                className="text-slate-400 hover:text-white font-bold p-1 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Main Workspace Frame container */}
          <main className="flex-1 p-4 md:p-8 overflow-y-auto">
            {view === "dashboard" && (
              <DashboardView
                shipments={shipments}
                notifications={notifications}
                onNavigate={setView}
                onSelectShipment={navigateToShipment}
                onQuickActionResolveHold={handleQuickActionResolveHold}
                user={user}
              />
            )}

            {view === "profit-loss" && (
              <AdminProfitLossView
                shipments={shipments}
                fuelLogs={fuelLogs}
                staffList={staffList}
              />
            )}

            {view === "fuel-tracker" && (
              <AdminFuelTrackerView
                fleet={fleet}
                fuelLogs={fuelLogs}
                staffList={staffList}
                onAddFuelLog={handleAddFuelLog}
              />
            )}

            {view === "staff-management" && (
              <AdminStaffManagementView
                staffList={staffList}
                workersList={workersList}
                customersList={customersList}
                onUpdateStaff={handleUpdateStaff}
                onAddStaff={handleAddStaff}
                onDeleteStaff={handleDeleteStaff}
                onUpdateWorker={handleUpdateWorker}
                onAddWorker={handleAddWorker}
                onDeleteWorker={handleDeleteWorker}
                onUpdateCustomer={handleUpdateCustomer}
                onAddCustomer={handleAddCustomer}
                onDeleteCustomer={handleDeleteCustomer}
              />
            )}

            {view === "staff-workspace" && (
              <StaffWorkspaceView
                staffUser={user}
                shipments={shipments}
                workersList={workersList}
                customersList={customersList}
                onUpdateShipmentStatus={handleUpdateShipmentStatus}
                onReassignWorker={handleReassignWorker}
                onTriggerRedelivery={handleTriggerRedelivery}
                onAddWorker={handleAddWorker}
                onAddCustomer={handleAddCustomer}
                onAddFuelLog={handleAddFuelLog}
                onNavigate={setView}
              />
            )}

            {view === "worker-workspace" && (
              <WorkerWorkspaceView
                workerUser={user}
                shipments={shipments}
                onCompleteDelivery={handleWorkerCompleteDelivery}
                onReportDeliveryIssue={handleWorkerReportIssue}
                onUpdateTransportMode={handleWorkerUpdateTransportMode}
                onAddFuelLog={handleAddFuelLog}
                onNavigate={setView}
              />
            )}

            {view === "staff-salary" && (
              <StaffSalaryView staffUser={user} />
            )}

            {view.startsWith("book-") && (
              <BookingFlow
                savedAddresses={user.addresses || []}
                onBookingComplete={handleBookingComplete}
                onNavigate={setView}
              />
            )}

            {view === "track-live" && (
              <TrackingView
                shipments={shipments}
                selectedShipmentId={selectedShipmentId}
                onSelectShipment={setSelectedShipmentId}
                onNavigate={setView}
              />
            )}

            {view === "my-shipments" && (
              <ShipmentsListView
                shipments={shipments}
                onSelectShipment={navigateToShipment}
                onNavigate={setView}
                userRole={user.systemRole}
                onAdminEditShipment={(shipment) => setEditingShipment(shipment)}
              />
            )}

            {view === "shipment-details" && (
              <ShipmentDetailsView
                shipmentId={selectedShipmentId || (shipments[0] && shipments[0].id)}
                shipments={shipments}
                onNavigate={setView}
                onOpenLiveMap={(id) => {
                  setSelectedShipmentId(id);
                  setView("track-live");
                }}
                onResolveCustomsHold={handleQuickActionResolveHold}
              />
            )}

            {view === "support" && (
              <SupportView
                tickets={tickets}
                onCreateTicket={(newT) => setTickets([newT, ...tickets])}
                onNavigate={setView}
              />
            )}

            {view === "notifications" && (
              <NotificationsView
                notifications={notifications}
                onMarkAsRead={(id) =>
                  setNotifications(
                    notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
                  )
                }
                onClearAll={() => setNotifications([])}
                onSelectNotification={(n) => {
                  if (n.title.includes("Customs")) {
                    handleQuickActionResolveHold("TRK-900112-E");
                  } else if (n.title.includes("Cargo Out")) {
                    setSelectedShipmentId("TRK-891992-B");
                    setView("track-live");
                  } else if (n.title.includes("P&L")) {
                    setView("profit-loss");
                  }
                }}
              />
            )}

            {view === "profile" && (
              <ProfileView
                user={user}
                onUpdateUser={(updated) => setUser({ ...user, ...updated })}
                onNavigate={setView}
              />
            )}
          </main>
        </div>
      ) : view === "login" ? (
        <LoginView onNavigate={setView} onLoginSuccess={handleLoginSuccess} />
      ) : view === "register" ? (
        <RegisterView onNavigate={setView} onLoginSuccess={handleLoginSuccess} />
      ) : (
        <LandingPage
          onNavigate={setView}
          onSearchShipment={handleGuestSearchShipment}
          guestSearchFeedback={guestSearchFeedback}
        />
      )}

      {/* Admin Edit Shipment Master Modal */}
      {editingShipment && (
        <AdminShipmentManagerModal
          shipment={editingShipment}
          staffList={staffList}
          onSave={handleSaveEditedShipment}
          onClose={() => setEditingShipment(null)}
        />
      )}

      {/* Customs Hold Resolution Simulator Modal */}
      {resolvingHoldId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-6 relative text-slate-100 font-sans">
            <button
              onClick={() => setResolvingHoldId(null)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-2">
              <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-xs font-mono font-bold uppercase tracking-wider">
                Border Security Remediation
              </span>
              <h3 className="text-xl md:text-2xl font-black text-white">
                Resolve Customs Clearance Hold
              </h3>
              <p className="text-slate-400 text-xs md:text-sm">
                Consignment Waybill: <strong className="text-sky-400 font-mono">{resolvingHoldId}</strong>
              </p>
            </div>

            {customsSuccess ? (
              <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center space-y-3">
                <CheckCircle className="h-12 w-12 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="text-base font-bold text-white">
                  Commercial Clearance Approved!
                </h4>
                <p className="text-xs text-slate-300">
                  Customs declaration has been validated. Waybill {resolvingHoldId} status is restored to In Transit.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSimulateCustomsClearance} className="space-y-5">
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Declaration Reason:</span>
                    <strong className="text-amber-400">Missing Commercial Invoice</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Authority:</span>
                    <span className="text-white">UK Border Inspection Hub</span>
                  </div>
                </div>

                {customsError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl text-xs font-bold">
                    {customsError}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300">
                    Attach Country-of-Origin &amp; Valuation Document
                  </label>
                  <div
                    onClick={() => {
                      setCustomsDocumentAttached(true);
                      setCustomsError(null);
                    }}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition ${
                      customsDocumentAttached
                        ? "border-emerald-500/80 bg-emerald-500/10"
                        : "border-slate-700 hover:border-sky-500 bg-slate-950"
                    }`}
                  >
                    <Upload
                      className={`h-8 w-8 mx-auto mb-2 ${
                        customsDocumentAttached ? "text-emerald-400" : "text-slate-400"
                      }`}
                    />
                    <p className="text-xs font-bold text-white">
                      {customsDocumentAttached
                        ? "Commercial_Invoice_Validated_TRK900112E.pdf"
                        : "Click to upload Commercial Invoice (PDF)"}
                    </p>
                    <span className="text-[11px] text-slate-400 block mt-1">
                      {customsDocumentAttached
                        ? "✓ Verified electronic seal attached"
                        : "Required by customs authority"}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setResolvingHoldId(null)}
                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs rounded-xl transition shadow-lg shadow-emerald-500/20 cursor-pointer"
                  >
                    Transmit to Customs
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
