import React, { useState } from "react";
import {
  User,
  MapPin,
  Phone,
  Mail,
  Package,
  FileText,
  Scale,
  Layers,
  ShieldCheck,
  CheckCircle,
  ChevronRight,
  ArrowLeft,
  Upload,
  Info,
  CreditCard,
  Lock,
  Copy,
  Check,
  Truck,
  AlertTriangle,
  Box,
} from "lucide-react";
import ThreeDPackageViewer from "./ThreeDPackageViewer";
import ThreeDCard from "./ThreeDCard";

export default function BookingFlow({
  user,
  savedAddresses,
  onBookingComplete,
  onNavigate,
}) {
  const [step, setStep] = useState(1);
  const [formError, setFormError] = useState("");
  const [copiedId, setCopiedId] = useState(false);

  // Form States
  // Step 1: Sender
  const [senderName, setSenderName] = useState(user?.name || "");
  const [senderPhone, setSenderPhone] = useState(user?.phone || "");
  const [senderEmail, setSenderEmail] = useState(user?.email || "");
  const [senderAddress, setSenderAddress] = useState(
    "National Engineering College Campus",
  );
  const [senderCity, setSenderCity] = useState("Kovilpatti");
  const [saveSender, setSaveSender] = useState(false);

  // Step 2: Receiver
  const [receiverName, setReceiverName] = useState("Marcus Vance");
  const [receiverPhone, setReceiverPhone] = useState("+44 20 7946 0958");
  const [receiverEmail, setReceiverEmail] = useState(
    "m.vance@globalhealth.org",
  );
  const [receiverAddress, setReceiverAddress] = useState(
    "88 Canary Wharf Blvd, Level 12",
  );
  const [receiverCity, setReceiverCity] = useState("London");
  const [saveReceiver, setSaveReceiver] = useState(false);

  // Step 3: Parcel details
  const [category, setCategory] = useState("Electronics");
  const [itemDescription, setItemDescription] = useState(
    "High-precision medical diagnostics monitor.",
  );
  const [weight, setWeight] = useState(4.8);
  const [qty, setQty] = useState(1);
  const [dimensions, setDimensions] = useState("40 x 30 x 15"); // L x W x H
  const [fragile, setFragile] = useState(false);
  const [insurance, setInsurance] = useState(true);
  const [imageUploaded, setImageUploaded] = useState(false);

  // Step 4: Speed selection
  const [speed, setSpeed] = useState("Express");

  // Checkout States
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardName, setCardName] = useState(user?.name || "");
  const [cardNumber, setCardNumber] = useState("4111 2222 3333 4444");
  const [cardExpiry, setCardExpiry] = useState("11/29");
  const [cardCvv, setCardCvv] = useState("382");
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  // Booking Results
  const [createdTrackingId, setCreatedTrackingId] = useState("");
  const [createdShipment, setCreatedShipment] = useState(null);

  // Fee calculation values
  const baseFees = {
    Standard: 15.0,
    Express: 35.0,
    "Same-Day": 85.0,
  };

  const getShippingFee = () => baseFees[speed] * qty;
  const getFragileFee = () => (fragile ? 15.0 : 0);
  const getInsuranceFee = () => (insurance ? 12.5 : 0);
  const getFuelSurcharge = () => +(getShippingFee() * 0.08).toFixed(2);
  const getGrandTotal = () =>
    +(
      getShippingFee() +
      getFragileFee() +
      getInsuranceFee() +
      getFuelSurcharge()
    ).toFixed(2);

  const isLiftgateRequired = weight > 30;

  const handleSelectSavedSender = (addr) => {
    setSenderName(addr.name);
    setSenderPhone(addr.phone);
    setSenderAddress(addr.address);
    setSenderCity(addr.city);
  };

  const handleNextStep = () => {
    setFormError("");
    const contact = step === 1 ? [senderName, senderPhone, senderEmail, senderAddress, senderCity] : [receiverName, receiverPhone, receiverEmail, receiverAddress, receiverCity];
    if ((step === 1 || step === 2) && (contact.some(v => !v.trim()) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact[2]))) { setFormError("Complete all contact fields and enter a valid email."); return; }
    if (step === 3 && (!(weight > 0) || !Number.isInteger(Number(qty)) || qty < 1 || !itemDescription.trim() || !/^\d+(\.\d+)?\s*x\s*\d+(\.\d+)?\s*x\s*\d+(\.\d+)?$/i.test(dimensions))) { setFormError("Enter a positive weight, whole quantity, description, and dimensions such as 40 x 30 x 15."); return; }
    if (step === 1) setStep(2);
    else if (step === 2) setStep(3);
    else if (step === 3) setStep(4);
    else if (step === 4) setStep("summary");
  };

  const handlePrevStep = () => {
    if (step === 2) setStep(1);
    else if (step === 3) setStep(2);
    else if (step === 4) setStep(3);
    else if (step === "summary") setStep(4);
    else if (step === "checkout") setStep("summary");
  };

  const handleProcessPayment = () => {
    setPaymentProcessing(true);

    setTimeout(() => {
      const randNum = Math.floor(1000 + Math.random() * 9000);
      const randChar = String.fromCharCode(65 + Math.floor(Math.random() * 26));
      const generatedId = `TRK-${randNum}-${randChar}3D`;

      const newShipmentObj = {
        id: generatedId,
        senderName,
        senderCity,
        senderAddress,
        senderPhone,
        senderEmail,
        receiverName,
        receiverCity,
        receiverAddress,
        receiverPhone,
        receiverEmail,
        category,
        weight,
        dimensions,
        speed,
        cost: getGrandTotal(),
        status: "Pending",
        estimatedDelivery:
          speed === "Same-Day"
            ? "Today (by 6:00 PM)"
            : speed === "Express"
              ? "Tomorrow (by 2:00 PM)"
              : "In 3-5 Business Days",
        currentLocation: senderCity,
        fragile,
        insurance,
        itemDescription,
        qty,
        paymentMethod:
          paymentMethod === "card"
            ? "Visa •••• 4444"
            : paymentMethod === "paypal"
              ? "PayPal Checkout"
              : "Corporate Account Invoice",
        bookingDate: new Date().toLocaleDateString(),
        timeline: [
          {
            id: "evt-1",
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            status: "Booking Created",
            location: senderCity,
            description: "Courier assigned and 3D transit label pre-authorized.",
          },
        ],
      };

      setCreatedTrackingId(generatedId);
      setCreatedShipment(newShipmentObj);
      try { onBookingComplete(newShipmentObj); } catch (error) { setFormError(error.message); setPaymentProcessing(false); return; }
      setPaymentProcessing(false);
      setStep("confirmation");
    }, 1500);
  };

  const handleResetBooking = () => {
    setStep(1);
    setCreatedTrackingId("");
    setCreatedShipment(null);
    setCopiedId(false);
  };

  const copyTrackingToClipboard = () => {
    if (createdTrackingId) {
      navigator.clipboard.writeText(createdTrackingId).then(() => {
        setCopiedId(true);
        setTimeout(() => setCopiedId(false), 3000);
      }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = createdTrackingId;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopiedId(true);
        setTimeout(() => setCopiedId(false), 3000);
      });
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 font-sans">
      <p className="text-sm text-slate-300">Demo booking: no payment is collected. Do not enter real card details.</p>
      {formError && <p role="alert" className="p-3 rounded-xl bg-rose-500/10 text-rose-400">{formError}</p>}
      {/* Wizard Header Stepper */}
      {step !== "confirmation" && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-sky-400">
              WIZARD:
            </span>
            <span className="text-sm font-black text-white uppercase tracking-wider">
              3D Courier Dispatch Engine
            </span>
          </div>

          <div className="flex items-center flex-wrap gap-2 md:gap-4">
            {[
              { num: 1, label: "Sender" },
              { num: 2, label: "Receiver" },
              { num: 3, label: "3D Parcel" },
              { num: 4, label: "Service" },
              { num: "summary", label: "Summary" },
            ].map((s, idx) => {
              const numVal = s.num;
              const isPassed =
                (typeof numVal === "number" &&
                  typeof step === "number" &&
                  step > numVal) ||
                (typeof numVal === "number" && typeof step === "string") ||
                (numVal === "summary" && step === "checkout");
              const isCurrent = step === numVal;
              return (
                <div key={idx} className="flex items-center gap-1.5 md:gap-2">
                  <div
                    className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-mono font-bold ${
                      isPassed
                        ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20"
                        : isCurrent
                          ? "bg-sky-500 text-slate-950 shadow-lg shadow-sky-500/20"
                          : "bg-slate-800 text-slate-400 border border-slate-700"
                    }`}
                  >
                    {isPassed ? (
                      <Check className="h-4 w-4 stroke-[3]" />
                    ) : (
                      idx + 1
                    )}
                  </div>
                  <span
                    className={`text-xs font-extrabold ${isCurrent ? "text-sky-400" : "text-slate-400"}`}
                  >
                    {s.label}
                  </span>
                  {idx < 4 && (
                    <ChevronRight className="h-3.5 w-3.5 text-slate-700 hidden md:block" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Grid: Shown only when not on confirmation */}
      {step !== "confirmation" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Form Area */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
              {/* STEP 1: SENDER */}
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-black text-white">
                      Step 1: Sender Contacts & Origin
                    </h3>
                    <p className="text-xs text-slate-400 font-medium mt-1">
                      Select origin hub or input pickup address coordinates.
                    </p>
                  </div>

                  {savedAddresses.length > 0 && (
                    <div className="space-y-2">
                      <span className="block text-xs font-mono font-bold text-slate-400 uppercase">
                        Quick Address Book Selection:
                      </span>
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {savedAddresses.map((addr) => (
                          <button
                            key={addr.id}
                            type="button"
                            onClick={() => handleSelectSavedSender(addr)}
                            className="px-3.5 py-2 bg-slate-800 border border-slate-700 hover:border-sky-500 text-xs font-extrabold text-slate-200 rounded-xl transition shrink-0 cursor-pointer"
                          >
                            {addr.label} ({addr.city})
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-300">Sender Full Name</label>
                      <input
                        type="text"
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm font-semibold text-slate-100 focus:outline-none focus:border-sky-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-300">Phone Contact</label>
                      <input
                        type="text"
                        value={senderPhone}
                        onChange={(e) => setSenderPhone(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-slate-100 focus:outline-none focus:border-sky-500"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-xs font-bold text-slate-300">Email Address</label>
                      <input
                        type="email"
                        value={senderEmail}
                        onChange={(e) => setSenderEmail(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm font-semibold text-slate-100 focus:outline-none focus:border-sky-500"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-xs font-bold text-slate-300">Street Pickup Address</label>
                      <input
                        type="text"
                        value={senderAddress}
                        onChange={(e) => setSenderAddress(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm font-semibold text-slate-100 focus:outline-none focus:border-sky-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-300">City</label>
                      <input
                        type="text"
                        value={senderCity}
                        onChange={(e) => setSenderCity(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm font-semibold text-slate-100 focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: RECEIVER */}
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-black text-white">
                      Step 2: Receiver Contacts & Destination
                    </h3>
                    <p className="text-xs text-slate-400 font-medium mt-1">
                      Provide destination city and recipient details.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-300">Recipient Name</label>
                      <input
                        type="text"
                        value={receiverName}
                        onChange={(e) => setReceiverName(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm font-semibold text-slate-100 focus:outline-none focus:border-sky-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-300">Phone Contact</label>
                      <input
                        type="text"
                        value={receiverPhone}
                        onChange={(e) => setReceiverPhone(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-slate-100 focus:outline-none focus:border-sky-500"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-xs font-bold text-slate-300">Email Address</label>
                      <input
                        type="email"
                        value={receiverEmail}
                        onChange={(e) => setReceiverEmail(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm font-semibold text-slate-100 focus:outline-none focus:border-sky-500"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-xs font-bold text-slate-300">Delivery Street Address</label>
                      <input
                        type="text"
                        value={receiverAddress}
                        onChange={(e) => setReceiverAddress(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm font-semibold text-slate-100 focus:outline-none focus:border-sky-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-300">Destination City</label>
                      <input
                        type="text"
                        value={receiverCity}
                        onChange={(e) => setReceiverCity(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm font-semibold text-slate-100 focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: PARCEL SPECS & LIVE 3D INSPECTOR */}
              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-black text-white">
                      Step 3: Parcel Specs & Live 3D Model
                    </h3>
                    <p className="text-xs text-slate-400 font-medium mt-1">
                      Custom cargo box geometry updates dynamically in the 3D viewport.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <span className="block text-xs font-bold text-slate-300 uppercase">Category</span>
                    <div className="flex flex-wrap gap-2">
                      {["Electronics", "Documents", "Medical", "Apparel", "Heavy Cargo"].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setCategory(cat)}
                          className={`px-3.5 py-2 text-xs font-extrabold rounded-xl border transition cursor-pointer ${
                            category === cat
                              ? "bg-sky-500 border-sky-400 text-slate-950 shadow-md shadow-sky-500/20"
                              : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-300">Weight (kg)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={weight}
                        onChange={(e) => setWeight(parseFloat(e.target.value) || 1)}
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono font-bold text-sky-300 focus:outline-none focus:border-sky-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-300">Quantity</label>
                      <input
                        type="number"
                        value={qty}
                        onChange={(e) => setQty(parseInt(e.target.value) || 1)}
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono font-bold text-slate-100 focus:outline-none focus:border-sky-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-300">Dimensions (L x W x H cm)</label>
                      <input
                        type="text"
                        value={dimensions}
                        onChange={(e) => setDimensions(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono font-bold text-emerald-300 focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-2">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={fragile}
                        onChange={(e) => setFragile(e.target.checked)}
                        className="h-4 w-4 rounded bg-slate-800 border-slate-700 text-sky-500"
                      />
                      Fragile Cargo Handling (+ $15.00)
                    </label>
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={insurance}
                        onChange={(e) => setInsurance(e.target.checked)}
                        className="h-4 w-4 rounded bg-slate-800 border-slate-700 text-sky-500"
                      />
                      Transit Protection (+ $12.50)
                    </label>
                  </div>
                </div>
              )}

              {/* STEP 4: SERVICE SELECTION */}
              {step === 4 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-black text-white">Step 4: Speed SLA Tier</h3>
                    <p className="text-xs text-slate-400 font-medium mt-1">
                      Select priority fulfillment timelines.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {[
                      { id: "Standard", label: "Standard Logistics", time: "3-5 Business Days", price: 15.0 },
                      { id: "Express", label: "Priority Express Air", time: "1-2 Business Days", price: 35.0 },
                      { id: "Same-Day", label: "Same-Day Emergency Messenger", time: "Same Day by 6 PM", price: 85.0 },
                    ].map((opt) => {
                      const isSel = speed === opt.id;
                      return (
                        <div
                          key={opt.id}
                          onClick={() => setSpeed(opt.id)}
                          className={`p-5 rounded-2xl border-2 cursor-pointer transition flex items-center justify-between ${
                            isSel
                              ? "border-sky-500 bg-sky-500/10 shadow-lg shadow-sky-500/20"
                              : "border-slate-800 bg-slate-950 hover:border-slate-700"
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-3">
                              <span className="text-base font-extrabold text-white">{opt.label}</span>
                              <span className="px-2.5 py-0.5 bg-slate-800 text-sky-400 text-[10px] font-mono font-bold rounded-md">
                                {opt.time}
                              </span>
                            </div>
                          </div>
                          <span className="text-lg font-black font-mono text-sky-300">
                            ${opt.price.toFixed(2)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP SUMMARY */}
              {step === "summary" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-black text-white">Step 5: Review Waybill Summary</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs font-medium text-slate-300 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                    <div>
                      <span className="text-slate-500 uppercase block font-mono">Origin</span>
                      <span className="font-bold text-white text-sm">{senderName} ({senderCity})</span>
                    </div>
                    <div>
                      <span className="text-slate-500 uppercase block font-mono">Destination</span>
                      <span className="font-bold text-white text-sm">{receiverName} ({receiverCity})</span>
                    </div>
                    <div>
                      <span className="text-slate-500 uppercase block font-mono">Category / Weight</span>
                      <span className="font-bold text-amber-300 text-sm">{category} ({weight} kg)</span>
                    </div>
                    <div>
                      <span className="text-slate-500 uppercase block font-mono">SLA Tier</span>
                      <span className="font-bold text-sky-300 text-sm">{speed}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* CHECKOUT STEP */}
              {step === "checkout" && (
                <div className="space-y-6">
                  <h3 className="text-xl font-black text-white">Step 6: Payment Authorization</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-300">Cardholder Name</label>
                      <input
                        type="text"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm font-semibold text-slate-100"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-300">Card Number</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-slate-100"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6 border-t border-slate-800">
                {step !== 1 && (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="px-5 py-3 border border-slate-700 hover:bg-slate-800 text-slate-300 font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                )}

                <div className="ml-auto">
                  {step === "summary" ? (
                    <button
                      type="button"
                      onClick={() => setStep("checkout")}
                      className="px-6 py-3 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-sky-500/20 transition cursor-pointer"
                    >
                      Proceed to Checkout <ChevronRight className="h-4 w-4" />
                    </button>
                  ) : step === "checkout" ? (
                    <button
                      type="button"
                      onClick={handleProcessPayment}
                      disabled={paymentProcessing}
                      className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition cursor-pointer"
                    >
                      {paymentProcessing ? "Authorizing 3D Waybill..." : `Confirm demo booking (€${getGrandTotal().toFixed(2)})`}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="px-6 py-3 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-sky-500/20 transition cursor-pointer"
                    >
                      Continue <ChevronRight className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: 3D Package Inspector & Invoice Box */}
          <div className="space-y-6">
            {/* Live 3D Package Inspector Model */}
            <ThreeDPackageViewer
              weight={weight}
              category={category}
              dimensions={dimensions}
              fragile={fragile}
              insurance={insurance}
              trackingId="DRAFT-3D"
            />

            {/* Pricing Box */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                Live Fee Calculation
              </h4>

              <div className="space-y-2 text-xs font-semibold text-slate-300">
                <div className="flex justify-between">
                  <span>Shipping Base ({speed}):</span>
                  <span className="font-mono text-sky-400">${getShippingFee().toFixed(2)}</span>
                </div>
                {fragile && (
                  <div className="flex justify-between">
                    <span>Fragile Handling:</span>
                    <span className="font-mono text-rose-400">+$15.00</span>
                  </div>
                )}
                {insurance && (
                  <div className="flex justify-between">
                    <span>Transit Cover:</span>
                    <span className="font-mono text-emerald-400">+$12.50</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-slate-800 pt-3 text-sm font-extrabold text-white">
                  <span>Grand Total:</span>
                  <span className="font-mono text-amber-300">${getGrandTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Clean Full Confirmation Screen when booked */
        createdShipment && (
          <div className="p-8 md:p-10 bg-slate-900/95 border border-slate-800 rounded-3xl shadow-2xl space-y-6 text-center max-w-2xl mx-auto animate-fade-in">
            <div className="w-20 h-20 bg-emerald-500/20 border-2 border-emerald-500/40 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <CheckCircle className="h-12 w-12" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-black uppercase tracking-wider rounded-full border border-emerald-500/30">
                Dispatch Pre-Authorized & Locked
              </span>
              <h2 className="text-3xl font-black text-white">3D Courier Dispatch Confirmed!</h2>
              <p className="text-sm text-slate-300 font-medium max-w-md mx-auto">
                Waybill manifest has been registered into the satellite tracking telemetry database.
              </p>
            </div>

            {/* Waybill Code with Copy Button */}
            <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-left">
                <span className="text-slate-400 text-xs font-mono font-bold block">ASSIGNED WAYBILL NUMBER:</span>
                <span className="text-sky-400 font-mono font-black text-2xl tracking-wider">{createdTrackingId}</span>
              </div>
              <button
                type="button"
                onClick={copyTrackingToClipboard}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold font-mono flex items-center gap-2 transition cursor-pointer shrink-0"
              >
                {copiedId ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-400 stroke-[3]" />
                    <span className="text-emerald-400 font-bold">Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 text-sky-400" />
                    <span>Copy Waybill</span>
                  </>
                )}
              </button>
            </div>

            {/* Shipment Summary Recap Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80">
              <div className="p-2 bg-slate-900 rounded-xl">
                <span className="text-slate-500 block text-[10px]">ROUTE</span>
                <strong className="text-white font-bold">{createdShipment.senderCity} ➔ {createdShipment.receiverCity}</strong>
              </div>
              <div className="p-2 bg-slate-900 rounded-xl">
                <span className="text-slate-500 block text-[10px]">SPEED SLA</span>
                <strong className="text-amber-300 font-bold">{createdShipment.speed}</strong>
              </div>
              <div className="p-2 bg-slate-900 rounded-xl">
                <span className="text-slate-500 block text-[10px]">PARCEL</span>
                <strong className="text-purple-300 font-bold">{createdShipment.category} ({createdShipment.weight}kg)</strong>
              </div>
              <div className="p-2 bg-slate-900 rounded-xl">
                <span className="text-slate-500 block text-[10px]">TOTAL PAID</span>
                <strong className="text-emerald-300 font-bold">${createdShipment.cost.toFixed(2)}</strong>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => onNavigate("track-live")}
                className="px-6 py-3.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-sky-500/20 transition cursor-pointer flex items-center gap-2"
              >
                <Truck className="h-4 w-4" />
                <span>Track on 3D Sat-Map</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate("my-shipments")}
                className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold text-xs rounded-xl border border-slate-700 transition cursor-pointer"
              >
                View in Manifest Ledger
              </button>

              <button
                type="button"
                onClick={handleResetBooking}
                className="px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition cursor-pointer"
              >
                Book Another Courier
              </button>
            </div>
          </div>
        )
      )}
    </div>
  );
}
