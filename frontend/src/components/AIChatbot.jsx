import React, { useState, useRef, useEffect, useMemo } from "react";
import { MessageCircle, X, Send, Bot, User, Sparkles, Package, MapPin, Clock, Truck, Plane, Ship, ChevronDown } from "lucide-react";

// ── Smart response engine ──────────────────────────────────────
// This is a rule-based AI that uses actual shipment data to give
// demonstration, contextual answers about deliveries.

const GREETINGS = [
  "Hello! 👋 I'm LogiTrack AI, your smart logistics assistant. How can I help you today?",
  "Welcome to LogiTrack AI! I can help you track packages, check delivery times, and answer logistics questions. What do you need?",
  "Hi there! 🚀 I'm here to help with all your shipping questions. Try asking me about a tracking ID or delivery status!",
];

// ── Haversine for distance calculation ──
function haversine(la1, lo1, la2, lo2) {
  const R = 6371, dL = ((la2 - la1) * Math.PI) / 180, dO = ((lo2 - lo1) * Math.PI) / 180;
  const a = Math.sin(dL / 2) ** 2 + Math.cos((la1 * Math.PI) / 180) * Math.cos((la2 * Math.PI) / 180) * Math.sin(dO / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── City coords for ETA calculation ──
const CITY_COORDS = {
  Hamburg:[53.55,9.99], London:[51.51,-0.13], Paris:[48.86,2.35], Berlin:[52.52,13.41],
  Munich:[48.14,11.58], Rotterdam:[51.92,4.48], Frankfurt:[50.11,8.68], Amsterdam:[52.37,4.90],
  Shanghai:[31.23,121.47], Tokyo:[35.68,139.65], Singapore:[1.35,103.82], Dubai:[25.20,55.27],
  "New York":[40.71,-74.01], "Los Angeles":[34.05,-118.24], Sydney:[-33.87,151.21],
  Mumbai:[19.08,72.88], Delhi:[28.61,77.21], Chennai:[13.08,80.27], Bangalore:[12.97,77.59],
  Kovilpatti:[9.17,77.87], Kolkata:[22.57,88.36], Madurai:[9.93,78.12], Seoul:[37.57,126.98],
  Beijing:[39.90,116.41], Barcelona:[41.39,2.17], Istanbul:[41.01,28.98], Cairo:[30.04,31.24],
  Nuremberg:[49.45,11.08],
};

function getCityCoord(name) {
  if (!name) return null;
  const clean = String(name).trim();
  if (CITY_COORDS[clean]) return CITY_COORDS[clean];
  const k = Object.keys(CITY_COORDS).find(k => k.toLowerCase().includes(clean.toLowerCase()) || clean.toLowerCase().includes(k.toLowerCase()));
  return k ? CITY_COORDS[k] : null;
}

// ── Speed profiles (km/h) ──
const SPEED_PROFILES = {
  "two-wheeler": { avg: 40, label: "Two-Wheeler Courier" },
  "van": { avg: 60, label: "Delivery Van" },
  "truck": { avg: 80, label: "Highway Truck" },
  "flight": { avg: 850, label: "Air Freight" },
  "ship": { avg: 40, label: "Container Vessel (~22 knots)" },
};

function formatDuration(hours) {
  if (hours < 0.017) return "a few minutes";
  if (hours < 1) return `about ${Math.round(hours * 60)} minutes`;
  if (hours < 24) {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return m > 0 ? `approximately ${h} hour${h > 1 ? "s" : ""} and ${m} minutes` : `approximately ${h} hour${h > 1 ? "s" : ""}`;
  }
  const days = Math.floor(hours / 24);
  const remainHrs = Math.round(hours % 24);
  return remainHrs > 0 ? `approximately ${days} day${days > 1 ? "s" : ""} and ${remainHrs} hours` : `approximately ${days} day${days > 1 ? "s" : ""}`;
}

function computeETA(senderCity, receiverCity, mode) {
  const oC = getCityCoord(senderCity);
  const dC = getCityCoord(receiverCity);
  if (!oC || !dC) return null;
  if (["two-wheeler", "bike", "van"].includes(mode) && haversine(oC[0], oC[1], dC[0], dC[1]) > 100) return null;
  const dist = haversine(oC[0], oC[1], dC[0], dC[1]);
  const profile = SPEED_PROFILES[mode] || SPEED_PROFILES.truck;

  // Add overhead for multi-modal
  let totalHours = dist / profile.avg;
  if (mode === "flight") totalHours += 4; // airport procedures, customs, last-mile
  if (mode === "ship") totalHours += 48; // port loading, customs, last-mile truck
  if (mode === "truck") totalHours += 1; // loading/unloading
  if (mode === "two-wheeler") totalHours += 0.25; // pickup time

  return { dist: Math.round(dist), hours: totalHours, formatted: formatDuration(totalHours), profile };
}

function getRouteMode(shipment) {
  const recorded = shipment?.transportModeUsed || "truck";
  const origin = getCityCoord(shipment?.senderCity);
  const destination = getCityCoord(shipment?.receiverCity);
  if (!origin || !destination || !["two-wheeler", "bike", "van"].includes(recorded)) return recorded;
  const distance = haversine(origin[0], origin[1], destination[0], destination[1]);
  if (distance <= 120) return recorded;
  return distance > 1800 ? "flight" : "truck";
}

function transportDescription(shipment, routeMode) {
  const recorded = shipment?.transportModeUsed || "truck";
  const lineHaul = SPEED_PROFILES[routeMode]?.label || routeMode.toUpperCase();
  if (routeMode === recorded) return lineHaul;
  const finalMile = SPEED_PROFILES[recorded]?.label || recorded.toUpperCase();
  return `${lineHaul} + ${finalMile} final mile`;
}

// ── Response Generator ──
function generateResponse(input, shipments, activeShipment) {
  const q = input.toLowerCase().trim();

  // Track specific shipment by ID
  const idMatch = q.match(/trk[-\s]?\w+[-\s]?\w*/i);
  if (idMatch) {
    const searchId = idMatch[0].toUpperCase().replace(/\s/g, "-");
    const found = shipments.find(s => s.id.toUpperCase().includes(searchId) || searchId.includes(s.id.toUpperCase().replace(/-/g, "")));
    if (found) {
      const mode = getRouteMode(found);
      const eta = computeETA(found.senderCity, found.receiverCity, mode);
      const etaStr = eta ? `\n\n📊 **Route Analysis**: ${eta.dist.toLocaleString()} km via ${eta.profile.label}. Estimated transit time: **${eta.formatted}**.` : "";
      return `📦 **${found.id}** — Status: **${found.status}**\n\n` +
        `📍 From: **${found.senderCity}** → To: **${found.receiverCity}**\n` +
        `🚚 Transport: **${transportDescription(found, mode)}** (${found.workerVehicleName || "Standard carrier"})\n` +
        `📍 Current Location: ${found.currentLocation || "En route"}\n` +
        `⏰ ETA: ${found.estimatedDelivery || "Calculating..."}` +
        etaStr +
        `\n\n${found.status === "Delivered" ? "✅ This package has been successfully delivered!" :
          found.status === "Customs Hold" ? "⚠️ This package is held at customs. Documentation may be required to proceed." :
          found.status === "Out for Delivery" ? "🏍️ Your package is out for final delivery! The courier is on the way." :
          "📡 Package is shown on the simulated route map."}`;
    }
    return `❌ I couldn't find a shipment with ID matching "${idMatch[0]}". Please check the tracking number and try again. Your tracking IDs look like: **TRK-XXXX-X**`;
  }

  // When will it arrive / ETA questions
  if (q.includes("when") || q.includes("arrive") || q.includes("eta") || q.includes("how long") || q.includes("time") || q.includes("delivery time") || q.includes("reach")) {
    if (activeShipment) {
      const mode = getRouteMode(activeShipment);
      const eta = computeETA(activeShipment.senderCity, activeShipment.receiverCity, mode);
      if (eta) {
        let explanation = "";
        if (mode === "flight") {
          explanation = `\n\n✈️ **Flight Route Breakdown**:\n- Ground transport to airport: ~1 hour\n- Airport processing & customs: ~2 hours\n- Flight time (${eta.dist.toLocaleString()} km at ~850 km/h): ~${Math.round(eta.dist / 850)} hours\n- Last-mile delivery from airport: ~1 hour`;
        } else if (mode === "ship") {
          explanation = `\n\n🚢 **Ocean Freight Breakdown**:\n- Port loading & customs clearance: ~24 hours\n- Ocean voyage (${eta.dist.toLocaleString()} km at ~22 knots): ~${Math.round(eta.dist / 40 / 24)} days\n- Destination port unloading: ~12 hours\n- Last-mile truck delivery: ~6 hours`;
        } else if (mode === "truck") {
          explanation = `\n\n🚛 **Highway Route**:\n- Loading & departure: ~30 min\n- Highway driving (${eta.dist.toLocaleString()} km at ~80 km/h): ~${Math.round(eta.dist / 80)} hours\n- Rest stops & fuel: ~${Math.max(0, Math.floor(eta.dist / 400))} stops\n- Unloading at destination: ~30 min`;
        } else if (mode === "two-wheeler") {
          explanation = `\n\n🏍️ **Last-Mile Courier**:\n- Pickup & sorting: ~15 min\n- Street transit (${eta.dist.toLocaleString()} km): ~${Math.round(eta.dist / 40 * 60)} min\n- Doorstep delivery: ~5 min`;
        }
        return `⏰ **Delivery ETA for ${activeShipment.id}**\n\n` +
          `Route: **${activeShipment.senderCity}** → **${activeShipment.receiverCity}** (${eta.dist.toLocaleString()} km)\n` +
          `Transport Mode: **${transportDescription(activeShipment, mode)}**\n` +
          `Estimated Transit Time: **${eta.formatted}**\n` +
          `Official ETA: ${activeShipment.estimatedDelivery || "Check tracking panel"}` +
          explanation;
      }
    }
    return "🔍 Please select a shipment first, or tell me the tracking ID (e.g., \"track TRK-8924-M\") and I'll calculate the ETA for you!";
  }

  // Status questions
  if (q.includes("status") || q.includes("where") || q.includes("location") || q.includes("progress")) {
    if (activeShipment) {
      return `📍 **${activeShipment.id}** Status Update:\n\n` +
        `**Status**: ${activeShipment.status}\n` +
        `**Current Location**: ${activeShipment.currentLocation || "En route"}\n` +
        `**From**: ${activeShipment.senderCity} → **To**: ${activeShipment.receiverCity}\n` +
        `**Transport**: ${transportDescription(activeShipment, getRouteMode(activeShipment))}\n\n` +
        `${activeShipment.status === "In Transit" ? "📡 The vehicle is shown on the simulated route map. Watch the animation!" :
          activeShipment.status === "Out for Delivery" ? "🏍️ Almost there! The courier is heading to the delivery address." :
          activeShipment.status === "Delivered" ? "✅ Package has been delivered and confirmed." :
          activeShipment.status === "Customs Hold" ? "⚠️ Package is held at customs. Please check if any documentation is needed." :
          "📦 Package is being processed."}`;
    }
    return "Please select a shipment to check its status, or provide a tracking ID!";
  }

  // Delayed?
  if (q.includes("delay") || q.includes("late") || q.includes("stuck") || q.includes("problem")) {
    if (activeShipment) {
      if (activeShipment.status === "Customs Hold") {
        return `⚠️ **${activeShipment.id} is currently delayed**\n\n` +
          `Reason: **Customs Hold** at ${activeShipment.currentLocation || "border control"}\n` +
          `This usually requires additional documentation. The assigned supervisor **${activeShipment.assignedStaffName || "staff"}** is handling this case.\n\n` +
          `💡 **What you can do**:\n- Contact the carrier via the "Contact Carrier" button\n- Check if any customs documents need to be uploaded\n- Contact support for escalation`;
      }
      if (activeShipment.status === "Delivered") {
        return `✅ Good news! **${activeShipment.id}** has already been delivered successfully. No delays!`;
      }
      return `📊 **${activeShipment.id}** appears to be on schedule.\n\nStatus: **${activeShipment.status}**\nCurrent Location: ${activeShipment.currentLocation || "En route"}\n\nIf you believe there's a delay, please contact the carrier or support team.`;
    }
    return "Which shipment are you concerned about? Please provide the tracking ID.";
  }

  // Vehicle/transport mode questions
  if (q.includes("vehicle") || q.includes("transport") || q.includes("how is it") || q.includes("what vehicle") || q.includes("carrier")) {
    if (activeShipment) {
      const mode = getRouteMode(activeShipment);
      const modeInfo = SPEED_PROFILES[mode] || SPEED_PROFILES.truck;
      return `🚚 **Transport Details for ${activeShipment.id}**\n\n` +
        `**Mode**: ${transportDescription(activeShipment, mode)}\n` +
        `**Vehicle**: ${activeShipment.workerVehicleName || "Standard carrier"}\n` +
        `**Average Speed**: ~${modeInfo.avg} km/h\n` +
        `**Assigned Worker**: ${activeShipment.assignedWorkerName || "Pending"}\n` +
        `**Supervisor**: ${activeShipment.assignedStaffName || "—"}\n\n` +
        `${mode === "flight" ? "✈️ Air freight with airport-to-airport transit, plus ground trucks for pickup and last-mile delivery." :
          mode === "ship" ? "🚢 Ocean freight via container vessel. Travels through international sea lanes, never crossing land." :
          mode === "two-wheeler" ? "🏍️ Fast urban courier on a two-wheeler for quick doorstep delivery." :
          mode === "van" ? "🚐 Delivery van for suburban and city routes with multi-stop capability." :
          "🚛 Highway freight truck for long-distance road transport."}`;
    }
    return "Select a shipment to see its transport details!";
  }

  // General FAQ
  if (q.includes("shipping") && q.includes("mode") || q.includes("types of") || q.includes("options")) {
    return `📋 **LogiTrack Shipping Modes**\n\n` +
      `🏍️ **Two-Wheeler** — Urban same-day delivery, ~40 km/h, up to 65kg\n` +
      `🚐 **Van** — City/suburban delivery, ~60 km/h, up to 1,650kg\n` +
      `🚛 **Truck** — Highway freight, ~80 km/h, up to 24,000kg\n` +
      `✈️ **Air Freight** — Express international, ~850 km/h (flight), 1-2 days\n` +
      `🚢 **Ocean Freight** — Heavy/bulk cargo, ~22 knots, 1-4 weeks\n\n` +
      `Each mode is automatically selected based on your package weight, distance, and speed preference. You can also specify your preferred mode when booking.`;
  }

  if (q.includes("custom") || q.includes("clearance") || q.includes("border") || q.includes("document")) {
    return `📄 **Customs & Border Clearance**\n\n` +
      `International shipments may be held at customs for inspection. Common reasons:\n\n` +
      `1. **Missing documentation** — Commercial invoices, packing lists\n` +
      `2. **Restricted items** — Certain goods need special permits\n` +
      `3. **Value declarations** — Items over certain values need duty payment\n` +
      `4. **Temperature-controlled cargo** — Biomedical items need cold chain verification\n\n` +
      `💡 If your shipment is in customs hold, check the tracking page for required actions, or contact support.`;
  }

  if (q.includes("help") || q.includes("what can you")) {
    return `🤖 **I can help you with:**\n\n` +
      `📦 **Track a package** — "Track TRK-8924-M" or "Where is my package?"\n` +
      `⏰ **Check ETA** — "When will it arrive?" or "How long will delivery take?"\n` +
      `🚚 **Vehicle info** — "What vehicle is delivering?" or "What transport mode?"\n` +
      `⚠️ **Delay check** — "Is my package delayed?" or "Any problems?"\n` +
      `📋 **Shipping modes** — "What shipping options are available?"\n` +
      `📄 **Customs help** — "Why is my package in customs?"\n` +
      `📊 **Route info** — "How long does a flight from X to Y take?"\n\n` +
      `Just type your question naturally and I'll do my best to help! 🚀`;
  }

  // Route calculation: "how long from X to Y"
  const routeMatch = q.match(/(?:from|between)\s+(\w+)\s+(?:to|and)\s+(\w+)/i);
  if (routeMatch) {
    const city1 = routeMatch[1], city2 = routeMatch[2];
    const modes = ["two-wheeler", "truck", "flight", "ship"];
    const results = modes.map(m => {
      const eta = computeETA(city1, city2, m);
      return eta ? `• **${SPEED_PROFILES[m].label}**: ${eta.formatted} (${eta.dist.toLocaleString()} km)` : null;
    }).filter(Boolean);

    if (results.length > 0) {
      return `📊 **Route: ${city1} → ${city2}**\n\nEstimated transit times by mode:\n\n${results.join("\n")}\n\n_Times include loading, customs, and last-mile delivery overhead._`;
    }
    return `I don't have coordinate data for one of those cities. Try major cities like Hamburg, London, Shanghai, etc.`;
  }

  // All shipments
  if (q.includes("all") && (q.includes("shipment") || q.includes("package") || q.includes("order"))) {
    if (shipments.length === 0) return "No shipments found in the system.";
    const list = shipments.map(s => `• **${s.id}** — ${s.senderCity} → ${s.receiverCity} — *${s.status}*`).join("\n");
    return `📦 **All Shipments (${shipments.length})**\n\n${list}\n\nClick on any tracking ID in the search bar to view it on the map!`;
  }

  // Greeting
  if (q.match(/^(hi|hello|hey|yo|sup|good\s)/)) {
    return GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
  }

  // Thank you
  if (q.includes("thank") || q.includes("thanks")) {
    return "You're welcome! 😊 Let me know if you need anything else. Happy tracking! 🚀";
  }

  // Fallback
  return `🤔 I'm not sure I understand that. Here are some things you can ask me:\n\n` +
    `• **"Track TRK-8924-M"** — Track a specific package\n` +
    `• **"When will it arrive?"** — Get delivery ETA\n` +
    `• **"What vehicle is delivering?"** — Transport details\n` +
    `• **"Is it delayed?"** — Check for delays\n` +
    `• **"How long from Hamburg to London?"** — Route calculator\n` +
    `• **"Help"** — See all available commands\n\n` +
    `Try typing one of these! 💡`;
}

// ══════════════════════════════════════════════════════════════
// CHATBOT COMPONENT
// ══════════════════════════════════════════════════════════════
export default function AIChatbot({ shipments = [], activeShipment = null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "bot",
      text: "👋 Hi! I'm **LogiTrack AI**, your smart logistics assistant. Ask me about tracking, delivery times, or shipping modes!",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = (text) => {
    const msgText = text || input.trim();
    if (!msgText) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      role: "user",
      text: msgText,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    setShowQuickActions(false);

    // Simulate AI thinking delay (150-800ms for realism)
    const delay = 300 + Math.random() * 500;
    setTimeout(() => {
      const response = generateResponse(msgText, shipments, activeShipment);
      const botMsg = {
        id: `bot-${Date.now()}`,
        role: "bot",
        text: response,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, delay);
  };

  const quickActions = useMemo(() => {
    const actions = [
      { label: "📦 Track my package", text: activeShipment ? `Track ${activeShipment.id}` : "Show all shipments" },
      { label: "⏰ Delivery ETA", text: "When will my package arrive?" },
      { label: "🚚 Vehicle info", text: "What vehicle is delivering my package?" },
      { label: "❓ Help", text: "What can you help me with?" },
    ];
    if (activeShipment?.status === "Customs Hold") {
      actions.splice(2, 0, { label: "⚠️ Customs issue", text: "Why is my package in customs?" });
    }
    return actions;
  }, [activeShipment]);

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen((p) => !p)}
        className="fixed bottom-6 right-6 z-[9999] w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 cursor-pointer group"
        style={{
          background: isOpen ? "linear-gradient(135deg, #ef4444, #dc2626)" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
          boxShadow: isOpen ? "0 0 30px rgba(239,68,68,0.4)" : "0 0 30px rgba(99,102,241,0.4)",
        }}
        title={isOpen ? "Close chat" : "Open AI Chat"}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <div className="relative">
            <MessageCircle className="h-6 w-6 text-white" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-indigo-600 animate-pulse" />
          </div>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 z-[9998] flex flex-col overflow-hidden"
          style={{
            width: "400px",
            maxWidth: "calc(100vw - 48px)",
            height: "560px",
            maxHeight: "calc(100vh - 140px)",
            borderRadius: "20px",
            border: "1px solid rgba(51, 65, 85, 0.8)",
            background: "rgba(15, 23, 42, 0.98)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 25px 60px rgba(0,0,0,0.5), 0 0 40px rgba(99,102,241,0.1)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-5 py-4 shrink-0"
            style={{
              background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))",
              borderBottom: "1px solid rgba(51,65,85,0.6)",
            }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                boxShadow: "0 0 15px rgba(99,102,241,0.3)",
              }}
            >
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                LogiTrack AI
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              </h3>
              <p className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                Online • Smart Logistics Assistant
              </p>
            </div>
            {activeShipment && (
              <div className="text-[9px] font-mono text-sky-300 bg-sky-500/10 border border-sky-500/30 px-2 py-1 rounded-lg">
                {activeShipment.id}
              </div>
            )}
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
            style={{ scrollbarWidth: "thin", scrollbarColor: "#334155 transparent" }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* Avatar */}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                    msg.role === "bot"
                      ? "bg-gradient-to-br from-indigo-500 to-purple-600"
                      : "bg-gradient-to-br from-sky-500 to-blue-600"
                  }`}
                  style={{ marginTop: "2px" }}
                >
                  {msg.role === "bot" ? (
                    <Bot className="h-3.5 w-3.5 text-white" />
                  ) : (
                    <User className="h-3.5 w-3.5 text-white" />
                  )}
                </div>

                {/* Bubble */}
                <div
                  className={`max-w-[80%] px-3.5 py-2.5 text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "bg-sky-600/20 border border-sky-500/30 text-sky-100 rounded-2xl rounded-tr-md"
                      : "bg-slate-800/80 border border-slate-700/50 text-slate-200 rounded-2xl rounded-tl-md"
                  }`}
                >
                  {/* Simple markdown rendering: bold and line breaks */}
                  {msg.text.split("\n").map((line, i) => (
                    <p key={i} className={i > 0 ? "mt-1" : ""}>
                      {line.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
                        part.startsWith("**") && part.endsWith("**") ? (
                          <strong key={j} className="font-bold text-white">
                            {part.slice(2, -2)}
                          </strong>
                        ) : (
                          <span key={j}>{part}</span>
                        )
                      )}
                    </p>
                  ))}
                  <span className="text-[9px] text-slate-500 mt-1 block text-right">{msg.time}</span>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0">
                  <Bot className="h-3.5 w-3.5 text-white" />
                </div>
                <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl rounded-tl-md px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {showQuickActions && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5">
              {quickActions.map((action, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(action.text)}
                  className="px-2.5 py-1.5 text-[10px] font-bold bg-slate-800/80 border border-slate-700/50 text-slate-300 rounded-xl hover:bg-slate-700/80 hover:text-white hover:border-slate-600 transition cursor-pointer"
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="px-4 py-3 flex items-center gap-2 shrink-0"
            style={{
              borderTop: "1px solid rgba(51,65,85,0.6)",
              background: "rgba(15,23,42,0.5)",
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about tracking, ETA, delays..."
              className="flex-1 bg-slate-900/80 border border-slate-700/60 rounded-xl px-3 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 font-mono"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition cursor-pointer shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                background: input.trim() ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "rgba(51,65,85,0.5)",
              }}
            >
              <Send className="h-4 w-4 text-white" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
