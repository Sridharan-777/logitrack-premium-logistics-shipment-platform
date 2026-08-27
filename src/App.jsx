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
import { AlertCircle, CheckCircle, Upload, X } from "lucide-react";

export default function App() {
  // Current view routing state
  const [view, setView] = useState("landing");

  // Theme switching state
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('logitrack-theme') || 'dark'; } catch { return 'dark'; }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('logitrack-theme', theme); } catch {}
  }, [theme]);

  // Custom interactive popup state to resolve customs holds!
  const [resolvingHoldId, setResolvingHoldId] = useState(null);
  const [customsDocumentAttached, setCustomsDocumentAttached] = useState(false);
  const [customsSuccess, setCustomsSuccess] = useState(false);
  const [customsError, setCustomsError] = useState(null);
  const [searchFeedback, setSearchFeedback] = useState(null);
  const [guestSearchFeedback, setGuestSearchFeedback] = useState(null);

  // Authenticated user profile state ( Sridharan K is logged in by default for dynamic interaction )
  const [user, setUser] = useState({
    name: "Sridharan K",
    email: "24104029@nec.edu.in",
    phone: "+91 94432 10987",
    company: "National Engineering College",
    avatar: "SK",
    memberSince: "Mar 2025",
    displayName: "Sridharan",
    role: "CSE Student & Full-Stack Developer",
    college: "National Engineering College, Kovilpatti",
    department: "Computer Science and Engineering",
    portfolio: "https://sridharan-777.github.io/sridharan-portfolio/",
    github: "https://github.com/Sri080307",
    linkedin: "https://www.linkedin.com/in/sridharan-k-a759b340/",
    accountType: "Individual Customer",
    location: "Tamil Nadu, India",
    addresses: [
      {
        id: "addr-1",
        label: "Frankfurt Central Hub",
        name: "Frankfurt sorting facility",
        address: "Cargo-Terminal 3, Gate 15",
        city: "Frankfurt",
        phone: "+49 69 1234 567",
      },
      {
        id: "addr-2",
        label: "Hamburg HQ Warehouse",
        name: "Hamburg distribution yard",
        address: "Industriestrasse 12, Gate B",
        city: "Hamburg",
        phone: "+49 40 9876 543",
      },
      {
        id: "addr-3",
        label: "NEC Campus Office",
        name: "Sridharan K (HQ)",
        address: "National Engineering College Campus",
        city: "Kovilpatti",
        phone: "+91 94432 10987",
      },
    ],
  });

  // Database seed lists (Shipments Ledger)
  const [shipments, setShipments] = useState([
    {
      id: "TRK-8924-M",
      senderName: "Sridharan K",
      senderCity: "Hamburg",
      senderAddress: "Industriestrasse 12, Gate B",
      senderPhone: "+91 94432 10987",
      senderEmail: "24104029@nec.edu.in",
      receiverName: "Marcus Vance",
      receiverCity: "London",
      receiverAddress: "88 Canary Wharf Blvd, Level 12",
      receiverPhone: "+44 20 7946 0958",
      receiverEmail: "m.vance@globalhealth.org",
      category: "Electronics",
      weight: 4.8,
      dimensions: "40 x 30 x 15",
      speed: "Express",
      cost: 48.3,
      status: "In Transit",
      estimatedDelivery: "Tomorrow (by 2:00 PM)",
      currentLocation: "Frankfurt Hub Sorting Yard",
      fragile: false,
      insurance: true,
      itemDescription: "High-precision diagnostics medical monitors.",
      qty: 1,
      paymentMethod: "Visa •••• 4444",
      bookingDate: "07/17/2026",
      timeline: [
        {
          id: "t-1",
          time: "11:34 AM",
          status: "Customs Cleared",
          location: "Frankfurt Hub",
          description:
            "Waybill pre-checked and cleared for air freight routing.",
        },
        {
          id: "t-2",
          time: "08:12 AM",
          status: "In Transit",
          location: "Hamburg Yard",
          description: "Cargo departed Hamburg distribution warehouse.",
        },
        {
          id: "t-3",
          time: "06:00 AM",
          status: "Booking Created",
          location: "Hamburg Yard",
          description:
            "Air freight slot secured. Courier dispatched for priority pickup.",
        },
      ],
    },
    {
      id: "TRK-900112-E",
      senderName: "Sridharan K",
      senderCity: "Hamburg",
      senderAddress: "Industriestrasse 12, Gate B",
      senderPhone: "+91 94432 10987",
      senderEmail: "24104029@nec.edu.in",
      receiverName: "Marcus Vance",
      receiverCity: "London",
      receiverAddress: "88 Canary Wharf Blvd, Level 12",
      receiverPhone: "+44 20 7946 0958",
      receiverEmail: "m.vance@globalhealth.org",
      category: "Medical",
      weight: 12.5,
      dimensions: "50 x 50 x 40",
      speed: "Same-Day",
      cost: 112.5,
      status: "Customs Hold",
      estimatedDelivery: "Delayed (Awaiting documentation)",
      currentLocation: "UK Border Customs Gate 4",
      fragile: true,
      insurance: true,
      itemDescription:
        "Critical temperature-controlled biomedical cell cultures.",
      qty: 1,
      paymentMethod: "Visa •••• 4444",
      bookingDate: "07/16/2026",
      timeline: [
        {
          id: "t-hold",
          time: "02:15 PM",
          status: "Customs Hold",
          location: "UK Border Control",
          description:
            "Transit paused. Customs officials require complete commercial invoice documentation.",
        },
        {
          id: "t-dep",
          time: "09:30 AM",
          status: "Departed sorting facility",
          location: "Frankfurt Airbase",
          description:
            "Flight LT-282 departed Frankfurt with biological cargo cooler.",
        },
        {
          id: "t-reg",
          time: "07:45 AM",
          status: "Booking Created",
          location: "Hamburg HQ",
          description: "Biocooler dispatch locked. Priority courier collected.",
        },
      ],
    },
    {
      id: "TRK-891992-B",
      senderName: "Sridharan K",
      senderCity: "Hamburg",
      senderAddress: "Industriestrasse 12, Gate B",
      senderPhone: "+91 94432 10987",
      senderEmail: "24104029@nec.edu.in",
      receiverName: "Dr. Evelyn Thomas",
      receiverCity: "Paris",
      receiverAddress: "24 Rue de l'Université",
      receiverPhone: "+33 1 42 27 78 90",
      receiverEmail: "e.thomas@sorbonne-labs.fr",
      category: "Documents",
      weight: 1.2,
      dimensions: "30 x 22 x 2",
      speed: "Standard",
      cost: 24.7,
      status: "Delivered",
      estimatedDelivery: "Completed (Delivered)",
      currentLocation: "Paris Sorbonne Receiving Desk",
      fragile: false,
      insurance: false,
      itemDescription: "SLA Contract Agreements and medical audit signatures.",
      qty: 1,
      paymentMethod: "Corporate SLA Balance",
      bookingDate: "07/14/2026",
      timeline: [
        {
          id: "t-d",
          time: "04:50 PM",
          status: "Delivered",
          location: "Paris",
          description: "Signed and approved by Dr. Evelyn Thomas.",
        },
        {
          id: "t-out",
          time: "11:00 AM",
          status: "Out for Delivery",
          location: "Paris Central",
          description: "Courier driver assigned and dispatched.",
        },
        {
          id: "t-rec",
          time: "08:15 AM",
          status: "Arrival at sort facility",
          location: "Paris Central",
          description: "Awaiting courier vehicle loading.",
        },
      ],
    },
  ]);

  // Support Tickets Ledger
  const [tickets, setTickets] = useState([
    {
      id: "TCK-3021",
      subject: "Address correction request for TRK-8924-M",
      category: "Address Correction",
      status: "Open",
      date: "07/17/2026",
      description:
        "Recipient noted Canary Wharf Blvd suite should be Level 14 instead of Level 12. Please amend before customs clearance completes.",
      priority: "Medium",
    },
    {
      id: "TCK-2940",
      subject: "Customs hold clarification on TRK-900112-E",
      category: "Delivery Delay",
      status: "Resolved",
      date: "07/16/2026",
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
      title: "Cargo Out for Delivery",
      message:
        "Courier Hans Müller is dispatched for final delivery of waybill TRK-8924-M.",
      time: "3 hours ago",
      read: false,
    },
    {
      id: "n-3",
      type: "billing",
      title: "Monthly SLA Statement Ready",
      message:
        "Your compiled corporate transport statements for June are ready in settings.",
      time: "1 day ago",
      read: false,
    },
    {
      id: "n-4",
      type: "update",
      title: "Shipment Delivered",
      message:
        "Your document consignment TRK-891992-B has been successfully delivered in Paris.",
      time: "2 days ago",
      read: true,
    },
  ]);

  // Currently selected shipment for drill-down details or live map tracking
  const [selectedShipmentId, setSelectedShipmentId] = useState(null);

  // Authentication State triggers
  const handleLoginSuccess = (name, email) => {
    const isSridharan =
      email.toLowerCase() === "24104029@nec.edu.in" ||
      name.toLowerCase().includes("sridharan");
    setUser({
      name: isSridharan ? "Sridharan K" : name,
      email: email,
      phone: isSridharan ? "+91 94432 10987" : "+1 (555) 012-3456",
      company: isSridharan
        ? "National Engineering College"
        : "Enterprise Corp.",
      avatar: "SK",
      memberSince: isSridharan ? "Mar 2025" : "Jul 2026",
      displayName: isSridharan ? "Sridharan" : name.split(" ")[0],
      role: isSridharan
        ? "CSE Student & Full-Stack Developer"
        : "Senior Operations Manager",
      college: isSridharan
        ? "National Engineering College, Kovilpatti"
        : undefined,
      department: isSridharan ? "Computer Science and Engineering" : undefined,
      portfolio: isSridharan
        ? "https://sridharan-777.github.io/sridharan-portfolio/"
        : undefined,
      github: isSridharan ? "https://github.com/Sri080307" : undefined,
      linkedin: isSridharan
        ? "https://www.linkedin.com/in/sridharan-k-a759b340/"
        : undefined,
      accountType: isSridharan
        ? "Individual Customer"
        : "SLA Enterprise Partner",
      location: isSridharan ? "Tamil Nadu, India" : "California, USA",
      addresses: isSridharan
        ? [
            {
              id: "addr-1",
              label: "Frankfurt Central Hub",
              name: "Frankfurt sorting facility",
              address: "Cargo-Terminal 3, Gate 15",
              city: "Frankfurt",
              phone: "+49 69 1234 567",
            },
            {
              id: "addr-2",
              label: "Hamburg HQ Warehouse",
              name: "Hamburg distribution yard",
              address: "Industriestrasse 12, Gate B",
              city: "Hamburg",
              phone: "+49 40 9876 543",
            },
            {
              id: "addr-3",
              label: "NEC Campus Office",
              name: "Sridharan K (HQ)",
              address: "National Engineering College Campus",
              city: "Kovilpatti",
              phone: "+91 94432 10987",
            },
          ]
        : [],
    });
    setView("dashboard");
  };

  const handleLogout = () => {
    setUser(null);
    setView("landing");
  };

  // Callback when a user books a courier
  const handleBookingComplete = (newShipment) => {
    setShipments([newShipment, ...shipments]);
    setSelectedShipmentId(newShipment.id);

    // Auto-generate notification
    const newNotif = {
      id: `n-${Date.now()}`,
      type: "update",
      title: "Dispatch Confirmed",
      message: `Consignment waybill ${newShipment.id} successfully generated and assigned.`,
      time: "Just now",
      read: false,
    };
    setNotifications([newNotif, ...notifications]);
  };

  // Callback to append support ticket
  const handleSubmitTicket = (newTicket) => {
    setTickets([newTicket, ...tickets]);
  };

  // Notification methods
  const handleMarkAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const handleToggleRead = (id) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: !n.read } : n)),
    );
  };

  const handleClearAllNotifs = () => {
    setNotifications([]);
  };

  // Navigation router helper
  const navigateToShipment = (id, targetView) => {
    setSelectedShipmentId(id);
    setView(targetView);
  };

  // Search input handlers
  const handleSearchShipmentGlobal = (query) => {
    setSearchFeedback(null);
    const matched = shipments.find(
      (s) => s.id.toLowerCase() === query.toLowerCase(),
    );
    if (matched) {
      setSelectedShipmentId(matched.id);
      setView("track-live");
    } else {
      setSearchFeedback(
        `Waybill '${query}' is not catalogued in this workspace. Try searching 'TRK-8924-M'.`,
      );
      setTimeout(() => setSearchFeedback(null), 6000);
    }
  };

  // Add/Remove saved addresses
  const handleAddAddress = (newAddr) => {
    if (user) {
      setUser({
        ...user,
        addresses: [...user.addresses, newAddr],
      });
    }
  };

  const handleDeleteAddress = (id) => {
    if (user) {
      setUser({
        ...user,
        addresses: user.addresses.filter((a) => a.id !== id),
      });
    }
  };

  // Interactive Customs Hold Resolution simulator!
  const handleQuickActionResolveHold = (id) => {
    setResolvingHoldId(id);
    setCustomsDocumentAttached(false);
    setCustomsSuccess(false);
  };

  const handleCustomsSubmitFile = () => {
    setCustomsError(null);
    if (!customsDocumentAttached) {
      setCustomsError(
        "Please select or attach a valid waybill commercial invoice PDF.",
      );
      return;
    }

    // Clear Hold simulator
    setCustomsSuccess(true);
    setTimeout(() => {
      // Update shipment status in active state
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
        }),
      );

      // Update notifications
      const resolveNotif = {
        id: `n-${Date.now()}`,
        type: "update",
        title: "Customs Clearance Approved",
        message: `Consignment waybill ${resolvingHoldId} has cleared UK border security and is now back In Transit.`,
        time: "Just now",
        read: false,
      };
      setNotifications([resolveNotif, ...notifications]);

      // Resolve relevant support ticket
      setTickets(
        tickets.map((t) => {
          if (t.subject.includes(resolvingHoldId || "")) {
            return { ...t, status: "Resolved" };
          }
          return t;
        }),
      );

      // Close Dialog
      setResolvingHoldId(null);
    }, 1500);
  };

  // Render Layouts depending on view state
  const isAuthView =
    view !== "landing" && view !== "login" && view !== "register";

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
              // reset active target if switching tabs
              if (
                !v.startsWith("book-") &&
                v !== "track-live" &&
                v !== "shipment-details"
              ) {
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
                ? "Operations Control"
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
                            : "Settings Workspace"
            }
            onSearchShipment={handleSearchShipmentGlobal}
            onNavigate={setView}
            unreadNotifications={notifications.filter((n) => !n.read).length}
            user={user}
            theme={theme}
            onToggleTheme={setTheme}
          />

          {searchFeedback && (
            <div className="mx-4 md:mx-8 mt-4 p-4 bg-rose-50 border border-rose-250 rounded-xl flex items-center justify-between text-[#B91C1C] text-sm font-semibold animate-fade-in">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="h-5 w-5 text-[#B91C1C]" />
                <span>{searchFeedback}</span>
              </div>
              <button
                onClick={() => setSearchFeedback(null)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1"
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
              />
            )}

            {view.startsWith("book-") && (
              <BookingFlow
                savedAddresses={user.addresses}
                onBookingComplete={handleBookingComplete}
                onNavigate={setView}
              />
            )}

            {view === "track-live" && (
              <TrackingView
                shipments={shipments}
                initialSearchId={selectedShipmentId}
              />
            )}

            {view === "my-shipments" && (
              <ShipmentsListView
                shipments={shipments}
                onSelectShipment={navigateToShipment}
                onQuickActionResolveHold={handleQuickActionResolveHold}
              />
            )}

            {view === "shipment-details" && (
              <ShipmentDetailsView
                shipment={
                  shipments.find((s) => s.id === selectedShipmentId) || null
                }
                onBack={() => setView("my-shipments")}
                onTrack={(id) => navigateToShipment(id, "track-live")}
              />
            )}

            {view === "support" && (
              <SupportView
                tickets={tickets}
                onSubmitTicket={handleSubmitTicket}
              />
            )}

            {view === "notifications" && (
              <NotificationsView
                notifications={notifications}
                onMarkAllRead={handleMarkAllRead}
                onToggleRead={handleToggleRead}
                onClearAll={handleClearAllNotifs}
              />
            )}

            {view === "profile" && (
              <ProfileView
                profile={user}
                onUpdateProfile={setUser}
                onAddAddress={handleAddAddress}
                onDeleteAddress={handleDeleteAddress}
              />
            )}
          </main>
        </div>
      ) : (
        /* PUBLIC GUEST SYSTEM LAYOUT (Landing, Login, Register) */
        <div>
          {view === "landing" && (
            <div className="relative">
              <LandingPage
                onNavigate={setView}
                onSearchTrack={(id) => {
                  setGuestSearchFeedback(null);
                  const match = shipments.find(
                    (s) => s.id.toLowerCase() === id.toLowerCase(),
                  );
                  if (match) {
                    // If matches seed list and they are logged out, log them in for full interaction!
                    setUser({
                      name: "Sridharan K",
                      email: "24104029@nec.edu.in",
                      phone: "+91 94432 10987",
                      company: "National Engineering College",
                      avatar: "SK",
                      memberSince: "Mar 2025",
                      displayName: "Sridharan",
                      role: "CSE Student & Full-Stack Developer",
                      college: "National Engineering College, Kovilpatti",
                      department: "Computer Science and Engineering",
                      portfolio:
                        "https://sridharan-777.github.io/sridharan-portfolio/",
                      github: "https://github.com/Sri080307",
                      linkedin:
                        "https://www.linkedin.com/in/sridharan-k-a759b340/",
                      accountType: "Individual Customer",
                      location: "Tamil Nadu, India",
                      addresses: [
                        {
                          id: "addr-1",
                          label: "Frankfurt Central Hub",
                          name: "Frankfurt sorting facility",
                          address: "Cargo-Terminal 3, Gate 15",
                          city: "Frankfurt",
                          phone: "+49 69 1234 567",
                        },
                        {
                          id: "addr-2",
                          label: "Hamburg HQ Warehouse",
                          name: "Hamburg distribution yard",
                          address: "Industriestrasse 12, Gate B",
                          city: "Hamburg",
                          phone: "+49 40 9876 543",
                        },
                        {
                          id: "addr-3",
                          label: "NEC Campus Office",
                          name: "Sridharan K (HQ)",
                          address: "National Engineering College Campus",
                          city: "Kovilpatti",
                          phone: "+91 94432 10987",
                        },
                      ],
                    });
                    navigateToShipment(match.id, "track-live");
                  } else {
                    setGuestSearchFeedback(
                      `Waybill code '${id}' could not be located. Guest users can test with TRK-8924-M.`,
                    );
                    setTimeout(() => setGuestSearchFeedback(null), 6000);
                  }
                }}
                availableTrackingIds={shipments.map((s) => s.id)}
              />
              {guestSearchFeedback && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-md w-full px-4">
                  <div className="bg-white border border-rose-250 p-4 rounded-xl shadow-xl flex items-center justify-between text-[#B91C1C] text-sm font-semibold animate-fade-in">
                    <div className="flex items-center gap-2.5">
                      <AlertCircle className="h-5 w-5 text-[#B91C1C]" />
                      <span>{guestSearchFeedback}</span>
                    </div>
                    <button
                      onClick={() => setGuestSearchFeedback(null)}
                      className="text-slate-450 hover:text-slate-600 font-bold p-1 cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {view === "login" && (
            <LoginView
              onNavigate={setView}
              onLoginSuccess={handleLoginSuccess}
            />
          )}

          {view === "register" && (
            <RegisterView
              onNavigate={setView}
              onLoginSuccess={handleLoginSuccess}
            />
          )}
        </div>
      )}

      {/* INTERACTIVE CUSTOMS HOLD RESOLUTION MODAL OVERLAY */}
      {resolvingHoldId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#163A5F]/85 backdrop-blur-md animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-6 relative">
            <button
              onClick={() => {
                setResolvingHoldId(null);
                setCustomsError(null);
              }}
              className="absolute top-4 right-4 p-1 hover:bg-slate-100 text-slate-450 hover:text-slate-650 rounded-lg transition"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-2">
              <div className="p-3 bg-rose-50 border border-rose-200 text-[#B91C1C] rounded-xl inline-block">
                <AlertCircle className="h-6 w-6 stroke-[2]" />
              </div>
              <h3 className="text-lg md:text-xl font-extrabold text-[#172033] font-sans leading-tight">
                Resolve Customs Delay: {resolvingHoldId}
              </h3>
              <p className="text-sm font-semibold text-slate-600 leading-normal">
                UK Border Control requires a certified commercial waybill
                invoice listing tax coordinates and country-of-origin details.
              </p>
            </div>

            {customsError && (
              <div className="p-3 bg-rose-50 border border-rose-250 text-[#B91C1C] text-xs font-bold rounded-lg animate-fade-in">
                {customsError}
              </div>
            )}

            {/* Custom file mock trigger */}
            <div
              onClick={() => {
                setCustomsDocumentAttached(true);
                setCustomsError(null);
              }}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:bg-slate-50 transition min-h-[120px] flex flex-col justify-center ${
                customsDocumentAttached
                  ? "border-[#15803D] bg-emerald-50/20"
                  : "border-slate-300 bg-slate-50"
              }`}
            >
              <Upload
                className={`h-7 w-7 mx-auto mb-2 ${customsDocumentAttached ? "text-[#15803D]" : "text-slate-400"}`}
              />
              {customsDocumentAttached ? (
                <div>
                  <span className="text-xs font-bold text-emerald-800 block">
                    Commercial_Waybill_SLA_Invoice.pdf
                  </span>
                  <span className="text-[10px] text-[#15803D] font-mono block mt-1">
                    1.4 MB • Complete & Signed
                  </span>
                </div>
              ) : (
                <div>
                  <span className="text-xs font-extrabold text-slate-700 block">
                    Click to upload Waybill Invoice PDF
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-1 font-semibold">
                    Will be instantly transmitted to EU-UK Customs Office
                  </span>
                </div>
              )}
            </div>

            {/* Submit clearance actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setResolvingHoldId(null);
                  setCustomsError(null);
                }}
                className="flex-1 py-3 border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold rounded-xl transition min-h-[44px]"
              >
                Cancel
              </button>

              <button
                onClick={handleCustomsSubmitFile}
                disabled={customsSuccess}
                className="flex-1 py-3 bg-[#B91C1C] hover:bg-[#991B1B] disabled:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer min-h-[44px]"
              >
                {customsSuccess ? (
                  <>
                    <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Clearing hold...</span>
                  </>
                ) : (
                  <span>Submit to Customs</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
