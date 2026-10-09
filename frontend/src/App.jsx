import { useDemoLedger } from "./hooks/useDemoLedger";
import React, { useState, useEffect } from "react";
import Onboarding from "./components/Onboarding";
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
import WorkerLocationTracking, {
  getNativeWorkerTrackingStatus,
  stopWorkerTrackingDevice,
} from "./components/WorkerLocationTracking";
import AIChatbot from "./components/AIChatbot";
import ThemeSwitcher from "./components/ThemeSwitcher";
import apiClient from "./api/client.js";
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
      const saved = localStorage.getItem("logitrack-theme");
      return ["dark", "light", "cyber"].includes(saved) ? saved : "dark";
    } catch {
      return "dark";
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    const themeColors = { dark: "#020617", light: "#eef5fb", cyber: "#0a0015" };
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", themeColors[theme]);
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
  const [guestResult, setGuestResult] = useState(null);

  useEffect(() => {
    const warn = () => setSearchFeedback("Browser storage is full or unavailable. Changes may be lost after refreshing.");
    window.addEventListener("logitrack-storage-error", warn);
    return () => window.removeEventListener("logitrack-storage-error", warn);
  }, []);

  // Active Admin Edit Shipment modal
  const [editingShipment, setEditingShipment] = useState(null);

  // Authenticated user profile state
  const [user, setUser] = useState(null);
  const [authRestoring, setAuthRestoring] = useState(() => Boolean(apiClient.getToken()));
  const [logoutPrompt, setLogoutPrompt] = useState(null);
  const [logoutBusy, setLogoutBusy] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  // State Ledgers
  const [shipments, setShipments] = useDemoLedger("shipments", INITIAL_SHIPMENTS);
  const [staffList, setStaffList] = useDemoLedger("staffList", INITIAL_STAFF_MEMBERS);
  const [workersList, setWorkersList] = useDemoLedger("workersList", INITIAL_WORKERS);
  const [customersList, setCustomersList] = useDemoLedger("customersList", INITIAL_CUSTOMERS);
  const [fleet, setFleet] = useDemoLedger("fleet", INITIAL_FLEET);
  const [fuelLogs, setFuelLogs] = useDemoLedger("fuelLogs", INITIAL_FUEL_LOGS);

  const normalizeApiUser = (apiUser) => ({
    ...apiUser,
    id: apiUser._id || apiUser.id,
    systemRole: apiUser.role,
    role: apiUser.jobTitle || apiUser.role,
    status: apiUser.active === false ? "Inactive" : (apiUser.staffStatus || apiUser.workerStatus || "Active"),
  });

  useEffect(() => {
    if (!user || !apiClient.getToken() || ![ROLES.ADMIN, ROLES.STAFF].includes(user.systemRole)) return;
    let active = true;
    const requests = user.systemRole === ROLES.ADMIN
      ? [apiClient.getUsers({ active: true })]
      : [apiClient.getUsers({ active: true }), apiClient.getUsersByRole("WORKER")];
    Promise.all(requests).then((results) => {
      if (!active) return;
      const users = results.flatMap((result) => result.users || []);
      const normalized = users.map(normalizeApiUser);
      if (user.systemRole === ROLES.ADMIN) {
        setStaffList(normalized.filter((item) => item.systemRole === "STAFF"));
      }
      setWorkersList(normalized.filter((item) => item.systemRole === "WORKER"));
      setCustomersList(normalized.filter((item) => item.systemRole === "CUSTOMER"));
    }).catch((error) => setSearchFeedback(`Could not load MongoDB users: ${error.message}`));
    return () => { active = false; };
  }, [user?.id, user?.systemRole]);

  useEffect(() => {
    if (!user || !apiClient.getToken()) return;
    let active = true;
    apiClient.getShipments().then(({ shipments: records = [] }) => {
      if (!active) return;
      setShipments(records.map((record) => ({ ...record, id: record.trackingNumber || record.id })));
    }).catch((error) => setSearchFeedback(`Could not load MongoDB shipments: ${error.message}`));
    return () => { active = false; };
  }, [user?.id, user?.systemRole]);

  // Support Tickets Ledger
  const [tickets, setTickets] = useDemoLedger("tickets", [
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
  const [notifications, setNotifications] = useDemoLedger("notifications", [
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

  useEffect(() => {
    if (!user || !apiClient.getToken()) return;
    let active = true;
    const jobs = [
      apiClient.getNotifications().then(({ notifications: rows = [] }) => {
        if (active) setNotifications(rows.map(row => ({ ...row, id: row._id || row.id })));
      }),
      apiClient.getTickets().then(({ tickets: rows = [] }) => {
        if (active) setTickets(rows.map(row => ({ ...row, id: row._id || row.ticketId || row.id })));
      }),
    ];
    if ([ROLES.ADMIN, ROLES.STAFF].includes(user.systemRole)) {
      jobs.push(apiClient.getFuelLogs().then(({ fuelLogs: rows = [] }) => {
        if (active) setFuelLogs(rows.map(row => ({ ...row, id: row._id || row.logId || row.id })));
      }));
      jobs.push(apiClient.getVehicles().then(({ vehicles: rows = [] }) => {
        if (active) setFleet(rows.map(row => ({ ...row, id: row.vehicleId || row._id || row.id })));
      }));
    }
    Promise.allSettled(jobs).then(results => {
      const rejected = results.find(result => result.status === 'rejected');
      if (active && rejected) setSearchFeedback(`Some workspace data could not load: ${rejected.reason?.message || 'server error'}`);
    });
    return () => { active = false; };
  }, [user?.id, user?.systemRole]);

  // Currently selected shipment for drill-down details or live map tracking
  const [selectedShipmentId, setSelectedShipmentId] = useState(null);

  // Authentication State triggers
  const handleLoginSuccess = (nameOrUser, email, role = ROLES.USER) => {
    const authenticatedUser = typeof nameOrUser === "object" ? nameOrUser : null;
    if (authenticatedUser) {
      const mappedRole = authenticatedUser.role === "CUSTOMER" ? ROLES.USER : authenticatedUser.role?.toLowerCase();
      nameOrUser = authenticatedUser.name;
      email = authenticatedUser.email;
      role = mappedRole || ROLES.USER;
    }
    const name = nameOrUser;
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
      const isSridharan = email.toLowerCase() === "24104029@nec.edu.in";
      profileData = isSridharan ? { ...INITIAL_USERS.customer } : {
        id: `usr-${email.toLowerCase()}`,
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

    setUser(authenticatedUser ? { ...profileData, ...authenticatedUser, systemRole: role, id: authenticatedUser._id || authenticatedUser.id } : profileData);
  };

  useEffect(() => {
    if (!apiClient.getToken()) { setAuthRestoring(false); return; }
    apiClient.getMe()
      .then(({ user: restored }) => handleLoginSuccess(restored))
      .catch(() => apiClient.setToken(null))
      .finally(() => setAuthRestoring(false));
  }, []);

  const completeLogout = async ({ stopDevice = false, stopCurrentShift = false } = {}) => {
    if (logoutBusy) return;
    setLogoutBusy(true);
    setLogoutError("");

    try {
      const stopTasks = [];
      if (stopCurrentShift) {
        window.dispatchEvent(new Event("logitrack-stop-worker-location"));
        stopTasks.push(apiClient.stopWorkerLocationShift());
      }
      if (stopDevice) stopTasks.push(stopWorkerTrackingDevice());
      if (stopTasks.length > 0) await Promise.allSettled(stopTasks);

      await apiClient.logout().catch(() => apiClient.setToken(null));
      setUser(null);
      setSelectedShipmentId(null);
      setEditingShipment(null);
      setResolvingHoldId(null);
      setLogoutPrompt(null);
      setView("landing");
    } catch (error) {
      setLogoutError(error.message || "Sign out could not be completed. Please try again.");
    } finally {
      setLogoutBusy(false);
    }
  };

  const handleLogout = async () => {
    if (logoutBusy) return;
    setLogoutError("");

    const nativeStatus = await getNativeWorkerTrackingStatus();
    if (nativeStatus.tracking) {
      const currentWorkerId = String(user?.id || user?._id || "");
      const belongsToCurrentWorker = user?.systemRole === ROLES.WORKER
        && Boolean(currentWorkerId)
        && Boolean(nativeStatus.workerId)
        && currentWorkerId === nativeStatus.workerId;
      setLogoutPrompt({
        nativeStatus,
        belongsToCurrentWorker,
      });
      return;
    }

    if (user?.systemRole === ROLES.WORKER) {
      await completeLogout({ stopDevice: true, stopCurrentShift: true });
      return;
    }

    await completeLogout();
  };

  // Callback when a user books a courier
  const handleBookingComplete = async (newShipment) => {
    // Automatically assign to available worker (prefer two-wheeler for speed)
    const assignedWorker = workersList.find((w) => w.transportMode === "two-wheeler") || workersList[0];
    const assignedStaff = staffList[0];
    if (!assignedWorker || !assignedStaff) {
      throw new Error("Add at least one courier and supervisor before booking a shipment.");
    }

    const enrichedShipment = {
      ...newShipment,
      customerId: user.id,
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

    const payload = { ...enrichedShipment };
    delete payload.id;
    const { shipment: saved } = await apiClient.createShipment(payload);
    const persistedShipment = { ...saved, id: saved.trackingNumber || saved.id };
    setShipments(current => [persistedShipment, ...current]);
    setSelectedShipmentId(persistedShipment.id);

    const newNotif = {
      id: `n-${Date.now()}`,
      type: "update",
      title: "Consignment Booked & Assigned",
      message: `Waybill ${persistedShipment.id} assigned to ${assignedWorker.name} under supervision of ${assignedStaff.name}.`,
      time: "Just now",
      read: false,
    };
    setNotifications([newNotif, ...notifications]);
    return persistedShipment;
  };

  // Staff workflow status update
  const handleUpdateShipmentStatus = async (shipmentId, newStatus, note = "") => {
    try {
      const { shipment: saved } = await apiClient.updateShipmentStatus(shipmentId, newStatus, note);
      const normalized = { ...saved, id: saved.trackingNumber || saved.id };
      setShipments(current => current.map((item) => item.id === shipmentId ? normalized : item));
    } catch (error) {
      setSearchFeedback(`Status update failed: ${error.message}`);
      return;
    }

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
  const handleWorkerCompleteDelivery = async (shipmentId, proofData) => {
    const target = shipments.find(s => s.id === shipmentId);
    if (!target || target.assignedWorkerId !== user.id || target.status !== "Out for Delivery" || !proofData.signedBy?.trim()) {
      setSearchFeedback("Only an assigned, dispatched parcel with recipient confirmation can be completed.");
      return;
    }
    const deliveryEvent = {
            id: `t-wk-del-${Date.now()}`,
            time: proofData.timestamp || "Just now",
            status: "Delivered",
            location: `${target.receiverAddress || ''}, ${target.receiverCity}`,
            description: `Doorstep handoff verified. Signed by ${proofData.signedBy}. (${proofData.transportMode?.toUpperCase() || "TWO-WHEELER"})`,
          };

    const updates = {
            status: "Delivered",
            receivedByCustomer: true,
            escalationStatus: "Resolved",
            currentLocation: `Delivered at Doorstep (${target.receiverCity})`,
            proofOfDelivery: {
              signedBy: proofData.signedBy,
              timestamp: proofData.timestamp,
              signatureCode: `SIG-${Date.now().toString().slice(-6)}`,
            },
            timeline: [deliveryEvent, ...(target.timeline || [])],
          };
    try {
      const { shipment: saved } = await apiClient.updateShipment(shipmentId, updates);
      const normalized = { ...saved, id: saved.trackingNumber || saved.id };
      setShipments(current => current.map(s => s.id === shipmentId ? normalized : s));
    } catch (error) {
      setSearchFeedback(`Delivery confirmation failed: ${error.message}`);
      return;
    }

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
  const handleWorkerReportIssue = async (shipmentId, issueData) => {
    const target = shipments.find(s => s.id === shipmentId);
    if (!target) return;
    const issueEvent = {
            id: `t-wk-issue-${Date.now()}`,
            time: issueData.timestamp || "Just now",
            status: "Doorstep Attempt Failed",
            location: `${target.receiverCity}`,
            description: `Courier ${issueData.reportedBy} reported: ${issueData.reason}`,
          };

    try {
      const { shipment: saved } = await apiClient.updateShipment(shipmentId, {
        status: "Doorstep Attempt Failed",
        escalationStatus: "Action Required",
        deliveryAttemptCount: (target.deliveryAttemptCount || 0) + 1,
        timeline: [issueEvent, ...(target.timeline || [])],
      });
      const normalized = { ...saved, id: saved.trackingNumber || saved.id };
      setShipments(current => current.map(s => s.id === shipmentId ? normalized : s));
    } catch (error) {
      setSearchFeedback(`Issue report failed: ${error.message}`);
      return;
    }

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
  const handleWorkerUpdateTransportMode = async (workerId, transportMode) => {
    try {
      const { user: saved } = await apiClient.updateProfile(workerId, { transportMode });
      setWorkersList(current => current.map(w => w.id === workerId ? normalizeApiUser(saved) : w));
      setUser(prev => ({ ...prev, transportMode }));
    } catch (error) { setSearchFeedback(`Vehicle mode update failed: ${error.message}`); }
  };

  // Staff reassigns courier to consignment
  const handleReassignWorker = async (shipmentId, workerId, workerName, transportMode) => {
    const target = shipments.find(s => s.id === shipmentId);
    if (!target) return;
          const reassignedEvent = {
            id: `t-reassign-${Date.now()}`,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            status: "Courier Reassigned",
            location: target.currentLocation || "Local Hub",
            description: `Staff supervisor reassigned parcel to ${workerName} (${transportMode.toUpperCase()}).`,
          };

    try {
      const { shipment: saved } = await apiClient.updateShipment(shipmentId, {
            assignedWorker: workerId,
            assignedWorkerId: workerId,
            assignedWorkerName: workerName,
            transportModeUsed: transportMode,
            timeline: [reassignedEvent, ...(target.timeline || [])],
      });
      const normalized = { ...saved, id: saved.trackingNumber || saved.id };
      setShipments(current => current.map(s => s.id === shipmentId ? normalized : s));
    } catch (error) { setSearchFeedback(`Courier reassignment failed: ${error.message}`); }
  };

  // Staff triggers rapid redelivery
  const handleTriggerRedelivery = async (shipmentId) => {
    const target = shipments.find(s => s.id === shipmentId);
    if (!target) return;
          const redeliverEvent = {
            id: `t-redeliv-${Date.now()}`,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            status: "Redelivery Scheduled",
            location: target.currentLocation || "Local Transit Berth",
            description: `Expedited redelivery run approved by supervisor ${user.name}.`,
          };

    try {
      const { shipment: saved } = await apiClient.updateShipment(shipmentId, {
            status: "Out for Delivery",
            receivedByCustomer: false,
            proofOfDelivery: null,
            escalationStatus: "Normal",
            deliveryAttemptCount: (target.deliveryAttemptCount || 0) + 1,
            timeline: [redeliverEvent, ...(target.timeline || [])],
      });
      const normalized = { ...saved, id: saved.trackingNumber || saved.id };
      setShipments(current => current.map(s => s.id === shipmentId ? normalized : s));
    } catch (error) { setSearchFeedback(`Redelivery update failed: ${error.message}`); }
  };

  // CRUD for Workers (Shared by Admin & Staff)
  const handleAddWorker = async (newWorker) => {
    try {
      const { user: created } = await apiClient.createUser({ ...newWorker, role: "WORKER", password: newWorker.password });
      const normalized = normalizeApiUser(created);
      setWorkersList(current => [normalized, ...current]);
      return normalized;
    } catch (error) {
      setSearchFeedback(error.message);
      throw error;
    }
  };

  const handleUpdateWorker = async (updated) => {
    try {
      const { user: saved } = await apiClient.updateUser(updated.id, { ...updated, role: "WORKER" });
      setWorkersList(current => current.map((w) => (w.id === updated.id ? normalizeApiUser(saved) : w)));
    } catch (error) { setSearchFeedback(error.message); }
  };

  const handleDeleteWorker = async (workerId) => {
    if (shipments.some(s => s.assignedWorkerId === workerId && s.status !== "Delivered")) {
      setSearchFeedback("Reassign active shipments before deleting this courier."); return;
    }
    try { await apiClient.deleteUser(workerId); setWorkersList(current => current.filter((w) => w.id !== workerId)); }
    catch (error) { setSearchFeedback(error.message); }
  };

  // CRUD for Customers (Shared by Admin & Staff)
  const handleAddCustomer = async (newCustomer) => {
    try {
      const { user: created } = await apiClient.createUser({ ...newCustomer, role: "CUSTOMER", password: newCustomer.password });
      const normalized = normalizeApiUser(created);
      setCustomersList(current => [normalized, ...current]);
      return normalized;
    } catch (error) {
      setSearchFeedback(error.message);
      throw error;
    }
  };

  const handleUpdateCustomer = async (updated) => {
    try {
      const { user: saved } = await apiClient.updateUser(updated.id, updated);
      setCustomersList(current => current.map((c) => (c.id === updated.id ? normalizeApiUser(saved) : c)));
    } catch (error) { setSearchFeedback(error.message); }
  };

  const handleDeleteCustomer = async (custId) => {
    try { await apiClient.deleteUser(custId); setCustomersList(current => current.filter((c) => c.id !== custId)); }
    catch (error) { setSearchFeedback(error.message); }
  };

  // CRUD for Staff (Admin Only)
  const handleAddStaff = async (newStaff) => {
    try {
      const { user: created } = await apiClient.createUser({ ...newStaff, role: "STAFF", jobTitle: newStaff.role, password: newStaff.password });
      const normalized = normalizeApiUser(created);
      setStaffList(current => [normalized, ...current]);
      return normalized;
    } catch (error) {
      setSearchFeedback(error.message);
      throw error;
    }
  };

  const handleUpdateStaff = async (updated) => {
    try {
      const { user: saved } = await apiClient.updateUser(updated.id, { ...updated, role: "STAFF", jobTitle: updated.role });
      setStaffList(current => current.map((st) => (st.id === updated.id ? normalizeApiUser(saved) : st)));
    } catch (error) { setSearchFeedback(error.message); }
  };

  const handleDeleteStaff = async (staffId) => {
    if (shipments.some(s => s.assignedStaffId === staffId && s.status !== "Delivered")) {
      setSearchFeedback("Reassign active shipments before deleting this supervisor."); return;
    }
    try { await apiClient.deleteUser(staffId); setStaffList(current => current.filter((st) => st.id !== staffId)); }
    catch (error) { setSearchFeedback(error.message); }
  };

  // Admin save modified shipment
  const handleSaveEditedShipment = async (updated) => {
    try {
      const { shipment: saved } = await apiClient.updateShipment(updated.id, updated);
      const normalized = { ...saved, id: saved.trackingNumber || saved.id };
      setShipments(current => current.map(s => s.id === updated.id ? normalized : s));
      setEditingShipment(null);
    } catch (error) {
      setSearchFeedback(`Shipment save failed: ${error.message}`);
      return;
    }

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
  const handleAddFuelLog = async (newEntry) => {
    try {
      const { fuelLog } = await apiClient.addFuelLog(newEntry);
      setFuelLogs(current => [fuelLog, ...current]);
    } catch (error) {
      setSearchFeedback(`Fuel log failed: ${error.message}`);
      return;
    }

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

  const handleSubmitTicket = async (newTicket) => {
    try {
      const { ticket } = await apiClient.createTicket(newTicket);
      setTickets(current => [{ ...ticket, id: ticket._id || ticket.ticketId }, ...current]);
    } catch (error) { setSearchFeedback(`Support request failed: ${error.message}`); }
  };

  const handleToggleNotification = async (id) => {
    try {
      const { notification } = await apiClient.toggleNotificationRead(id);
      setNotifications(current => current.map(n => n.id === id ? { ...notification, id: notification._id || notification.id } : n));
    } catch (error) { setSearchFeedback(`Notification update failed: ${error.message}`); }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      await apiClient.markAllNotificationsRead();
      setNotifications(current => current.map(n => ({ ...n, read: true })));
    } catch (error) { setSearchFeedback(`Notification update failed: ${error.message}`); }
  };

  const handleClearNotifications = async () => {
    try {
      await apiClient.clearNotifications();
      setNotifications([]);
    } catch (error) { setSearchFeedback(`Clear notifications failed: ${error.message}`); }
  };

  const visibleShipments = user?.systemRole === ROLES.USER
    ? shipments.filter(s => s.customerId === user.id || [s.senderEmail, s.receiverEmail].some(email => email?.toLowerCase() === user.email?.toLowerCase()))
    : user?.systemRole === ROLES.WORKER ? shipments.filter(s => s.assignedWorkerId === user.id) : shipments;

  // Global shipment search helper
  const handleSearchShipmentGlobal = (query) => {
    setSearchFeedback(null);
    const cleanQuery = query.trim().toUpperCase();
    const found = visibleShipments.find(
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
    setGuestResult(null);
    const cleanQuery = query.trim().toUpperCase();
    const found = cleanQuery ? shipments.find(s => s.id.toUpperCase() === cleanQuery) : null;

    if (found) {
      setGuestResult({ id: found.id, status: found.status, estimatedDelivery: found.estimatedDelivery });
    } else {
      setGuestSearchFeedback(
        `Unable to find waybill "${query}". Please check the tracking number or try demo tracking code TRK-8924-M.`
      );
    }
  };

  // Drilldown to details view for a selected shipment
  const navigateToShipment = (id, destination = "shipment-details") => {
    setSelectedShipmentId(id);
    setView(destination);
  };

  // Quick Action: Resolve customs hold trigger
  const handleQuickActionResolveHold = (shipmentId) => {
    setResolvingHoldId(shipmentId);
    setCustomsDocumentAttached(false);
    setCustomsSuccess(false);
    setCustomsError(null);
  };

  const handleSimulateCustomsClearance = async (e) => {
    e.preventDefault();
    if (!customsDocumentAttached) {
      setCustomsError("Confirm that the customs documents were verified outside LogiTrack before changing the status.");
      return;
    }
    const target = shipments.find(s => s.id === resolvingHoldId);
    if (!target) return;
    try {
      const { shipment: saved } = await apiClient.updateShipment(resolvingHoldId, {
              status: "In Transit",
              escalationStatus: "Resolved",
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
                ...(target.timeline || []),
              ],
      });
      const normalized = { ...saved, id: saved.trackingNumber || saved.id };
      setShipments(current => current.map(s => s.id === resolvingHoldId ? normalized : s));
      setCustomsSuccess(true);

      const resolveNotif = {
        id: `n-${Date.now()}`,
        type: "update",
        title: "Customs Clearance Approved",
        message: `Consignment waybill ${resolvingHoldId} has cleared UK border security and is now back In Transit.`,
        time: "Just now",
        read: false,
      };
      setNotifications(current => [resolveNotif, ...current]);

      setTickets(
        tickets.map((t) => {
          if (t.subject.includes(resolvingHoldId || "")) {
            return { ...t, status: "Resolved" };
          }
          return t;
        })
      );

      setTimeout(() => setResolvingHoldId(null), 1200);
    } catch (error) {
      setCustomsError(`Customs status update failed: ${error.message}`);
    }
  };

  const isAuthView = view !== "landing" && view !== "login" && view !== "register";

  if (authRestoring) return <div className="min-h-screen grid place-items-center bg-slate-950 text-sky-300"><div className="glass-control rounded-2xl px-6 py-4 text-sm font-bold">Restoring secure session…</div></div>;

  return (
    <div className="app-shell min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-sky-500/30 relative font-sans">
      {theme !== "light" && <ThreeDBackground />}

      {!isAuthView && (
        <div className="fixed right-4 top-4 z-[100] md:right-6 md:top-6">
          <ThemeSwitcher theme={theme} onChange={setTheme} />
        </div>
      )}

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
                : view === "worker-location"
                ? user.systemRole === ROLES.WORKER
                  ? "Eight-Hour Duty Location Sharing"
                  : user.systemRole === ROLES.USER
                  ? "Assigned Courier Live Location"
                  : "Live Worker Operations Map"
                : view === "staff-salary"
                ? "My Salary & Personal Compensation"
                : view.startsWith("book-")
                ? "Courier Booking Wizard"
                : view === "track-live"
                ? "Shipment Route Simulation"
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
          <main id="main-content" className="flex-1 min-w-0 p-4 md:p-8 overflow-y-auto">
            <Onboarding key={user.id + user.systemRole} user={user} onNavigate={setView} />
            {view === "dashboard" && (
              <DashboardView
                shipments={visibleShipments}
                notifications={notifications}
                onNavigate={setView}
                onSelectShipment={navigateToShipment}
                onQuickActionResolveHold={handleQuickActionResolveHold}
                user={user}
              />
            )}

            {view === "profit-loss" && user.systemRole === ROLES.ADMIN && (
              <AdminProfitLossView
                shipments={visibleShipments}
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

            {view === "staff-management" && user.systemRole === ROLES.ADMIN && (
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
                shipments={visibleShipments}
                workersList={workersList}
                customersList={customersList}
                onUpdateShipmentStatus={handleUpdateShipmentStatus}
                onReassignWorker={handleReassignWorker}
                onTriggerRedelivery={handleTriggerRedelivery}
                onAddWorker={handleAddWorker}
                onAddCustomer={handleAddCustomer}
                onUpdateWorker={handleUpdateWorker}
                onDeleteWorker={handleDeleteWorker}
                onUpdateCustomer={handleUpdateCustomer}
                onDeleteCustomer={handleDeleteCustomer}
                onAddFuelLog={handleAddFuelLog}
                onNavigate={setView}
              />
            )}

            {view === "worker-workspace" && (
              <WorkerWorkspaceView
                workerUser={user}
                shipments={visibleShipments}
                onCompleteDelivery={handleWorkerCompleteDelivery}
                onReportDeliveryIssue={handleWorkerReportIssue}
                onUpdateTransportMode={handleWorkerUpdateTransportMode}
                onAddFuelLog={handleAddFuelLog}
                onNavigate={setView}
              />
            )}

            {view === "worker-location" && (
              <WorkerLocationTracking user={user} />
            )}

            {view === "staff-salary" && (
              <StaffSalaryView staffUser={user} />
            )}

            {view.startsWith("book-") && (
              <BookingFlow
                user={user}
                savedAddresses={user.addresses || []}
                onBookingComplete={handleBookingComplete}
                onNavigate={setView}
              />
            )}

            {view === "track-live" && (
              <TrackingView
                shipments={visibleShipments}
                selectedShipmentId={selectedShipmentId}
                onSelectShipment={setSelectedShipmentId}
              />
            )}

            {view === "my-shipments" && (
              <ShipmentsListView
                shipments={visibleShipments}
                onSelectShipment={navigateToShipment}
                onNavigate={setView}
                user={user}
                onQuickActionResolveHold={handleQuickActionResolveHold}
                onEditShipment={(shipment) => setEditingShipment(shipment)}
              />
            )}

            {view === "shipment-details" && (
              <ShipmentDetailsView
                shipment={visibleShipments.find(s => s.id === selectedShipmentId)}
                onBack={() => setView("my-shipments")}
                onTrack={(id) => {
                  setSelectedShipmentId(id);
                  setView("track-live");
                }}
                onResolveCustomsHold={handleQuickActionResolveHold}
              />
            )}

            {view === "support" && (
              <SupportView
                tickets={tickets}
                onSubmitTicket={handleSubmitTicket}
                onNavigate={setView}
              />
            )}

            {view === "notifications" && (
              <NotificationsView
                notifications={notifications}
                onMarkAllRead={handleMarkAllNotificationsRead}
                onToggleRead={handleToggleNotification}
                onClearAll={handleClearNotifications}
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
                onUpdateUser={async (updated) => {
                  setUser(current => ({ ...current, ...updated }));
                  if (apiClient.getToken() && user.id) {
                    try {
                      const { user: saved } = await apiClient.updateProfile(user.id, updated);
                      setUser(current => ({ ...current, ...saved, id: saved._id || saved.id, systemRole: current.systemRole }));
                    } catch (error) { setSearchFeedback(`Profile update failed: ${error.message}`); }
                  }
                }}
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

      {logoutPrompt && (
        <div
          className="fixed inset-0 z-[130] grid place-items-center bg-black/80 p-4 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="location-logout-title"
          aria-describedby="location-logout-description"
        >
          <section className="w-full max-w-lg space-y-5 rounded-3xl border border-amber-400/30 bg-slate-900 p-6 text-slate-100 shadow-2xl md:p-8">
            <div className="space-y-2">
              <span className="inline-flex rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-amber-300">
                Location sharing is active
              </span>
              <h2 id="location-logout-title" className="text-2xl font-black text-white">
                Choose what happens after sign-out
              </h2>
              <p id="location-logout-description" className="text-sm leading-6 text-slate-300">
                {logoutPrompt.belongsToCurrentWorker
                  ? "This worker's Android foreground service can keep sharing during the active duty session, even after sign-out, screen-off, or swipe-away."
                  : "This phone is sharing location for a different worker account. Keeping it active will not attach that service to the account currently signed in."}
              </p>
              <p className="text-xs leading-5 text-slate-400">
                Sharing still ends from the Android notification, the duty Stop button, or automatically at the server expiry.
              </p>
            </div>

            {logoutError ? (
              <div role="alert" className="rounded-xl border border-rose-400/30 bg-rose-500/10 p-3 text-sm font-semibold text-rose-200">
                {logoutError}
              </div>
            ) : null}

            <div className="grid gap-3">
              <button
                type="button"
                disabled={logoutBusy}
                onClick={() => completeLogout({
                  stopCurrentShift: !logoutPrompt.belongsToCurrentWorker && user?.systemRole === ROLES.WORKER,
                })}
                className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3 text-sm font-black text-slate-950 transition hover:brightness-110 disabled:cursor-wait disabled:opacity-50"
              >
                {logoutBusy ? "Signing out..." : "Keep sharing & sign out"}
              </button>
              <button
                type="button"
                disabled={logoutBusy}
                onClick={() => completeLogout({
                  stopDevice: true,
                  stopCurrentShift: user?.systemRole === ROLES.WORKER,
                })}
                className="rounded-xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm font-black text-rose-200 transition hover:bg-rose-500/20 disabled:cursor-wait disabled:opacity-50"
              >
                Stop sharing & sign out
              </button>
              <button
                type="button"
                disabled={logoutBusy}
                onClick={() => {
                  setLogoutPrompt(null);
                  setLogoutError("");
                }}
                className="rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm font-bold text-slate-300 transition hover:bg-slate-800 disabled:cursor-wait disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </section>
        </div>
      )}

      {view === "landing" && guestResult && <div role="dialog" aria-modal="true" aria-label="Shipment status" className="fixed inset-0 z-[80] grid place-items-center bg-black/70 p-4"><section className="p-6 rounded-2xl bg-slate-900 text-slate-100"><h2 className="text-xl font-bold">{guestResult.id}</h2><p>{guestResult.status}</p><p>{guestResult.estimatedDelivery}</p><button className="gps-button mt-4" onClick={() => setGuestResult(null)}>Close</button></section></div>}
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
                    Verification acknowledgement
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
                        ? "Documents confirmed as externally verified"
                        : "Confirm documents were verified by customs"}
                    </p>
                    <span className="text-[11px] text-slate-400 block mt-1">
                      {customsDocumentAttached
                        ? "Acknowledgement recorded for this status update"
                        : "LogiTrack does not upload or validate customs files"}
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
                    Apply clearance status
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Global AI Chatbot — floating on all pages */}
      {user && view !== "landing" && view !== "login" && view !== "register" && (
        <AIChatbot shipments={visibleShipments} activeShipment={visibleShipments.find(s => s.id === selectedShipmentId) || null} />
      )}
    </div>
  );
}
