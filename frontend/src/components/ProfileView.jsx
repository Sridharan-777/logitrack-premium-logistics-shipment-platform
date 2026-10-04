import React, { useState } from "react";
import {
  User,
  MapPin,
  Mail,
  Phone,
  Building,
  ShieldCheck,
  Lock,
  Key,
  Check,
  Trash2,
  Plus,
  RefreshCw,
  ExternalLink,
  Copy,
  Globe,
  Github,
  Linkedin,
  BookOpen,
  GraduationCap,
  BellRing,
  X,
  Edit2,
  Fingerprint,
  Monitor,
  Smartphone,
  Sparkles,
  Shield,
  Eye,
  EyeOff,
} from "lucide-react";
import ThreeDCard from "./ThreeDCard";
import apiClient from "../api/client";

export default function ProfileView({ user, onUpdateUser, onNavigate }) {
  // Alias user as profile so all existing references below work unchanged
  const profile = user || {};
  const initials = profile.avatar || (profile.name || "User").split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase();

  // Derived address helpers
  const onUpdateProfile = (updated) => onUpdateUser && onUpdateUser(updated);
  const onAddAddress = (newAddr) => {
    const existing = profile.addresses || [];
    onUpdateUser && onUpdateUser({ addresses: [...existing, newAddr] });
  };
  const onDeleteAddress = (addrId) => {
    const existing = profile.addresses || [];
    onUpdateUser && onUpdateUser({ addresses: existing.filter((a) => (a.id || a._id) !== addrId) });
  };

  // Edit mode toggle
  const [isEditing, setIsEditing] = useState(false);

  // Section 1: Personal Information Form States
  const [name, setName] = useState(profile.name || "Sridharan K");
  const [displayName, setDisplayName] = useState(
    profile.displayName || "Sridharan",
  );
  const [email, setEmail] = useState(profile.email || "24104029@nec.edu.in");
  const [location, setLocation] = useState(
    profile.location || "Tamil Nadu, India",
  );
  const [accountType, setAccountType] = useState(
    profile.accountType || "Individual Customer",
  );

  // Section 2: Education and Profession Form States
  const [college, setCollege] = useState(
    profile.college || "National Engineering College, Kovilpatti",
  );
  const [department, setDepartment] = useState(
    profile.department || "Computer Science and Engineering",
  );
  const [role, setRole] = useState(
    profile.role || "CSE Student & Full-Stack Developer",
  );

  // Section 3: Professional Links Form States
  const [portfolio, setPortfolio] = useState(
    profile.portfolio || "https://sridharan-777.github.io/sridharan-portfolio/",
  );
  const [github, setGithub] = useState(
    profile.github || "https://github.com/Sri080307",
  );
  const [linkedin, setLinkedin] = useState(
    profile.linkedin || "https://www.linkedin.com/in/sridharan-k-a759b340/",
  );

  // Section 4: Security States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  // Section 5: Notification Preferences States
  const [shipmentUpdates, setShipmentUpdates] = useState(true);
  const [deliveryNotifs, setDeliveryNotifs] = useState(true);
  const [paymentNotifs, setPaymentNotifs] = useState(true);
  const [promoEmails, setPromoEmails] = useState(false);

  // Address form states
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newName, setNewName] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newPhone, setNewPhone] = useState("");

  // Status indicators / Success alerts
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [deviceSignoutSuccess, setDeviceSignoutSuccess] = useState(false);
  const [avatarSuccess, setAvatarSuccess] = useState(false);

  // Developer API states
  const [apiKey, setApiKey] = useState("lt_live_f89c2a3949e2cf4b92b51080");
  const [apiKeyCopied, setApiKeyCopied] = useState(false);
  const [apiKeyRotating, setApiKeyRotating] = useState(false);

  const handleProfileSave = (e) => {
    e.preventDefault();
    onUpdateProfile({
      ...profile,
      name,
      email,
      displayName,
      location,
      accountType,
      college,
      department,
      role,
      portfolio,
      github,
      linkedin,
    });
    setProfileSuccess(true);
    setIsEditing(false);
    setTimeout(() => setProfileSuccess(false), 4000);
  };

  const handleCancel = () => {
    setName(profile.name || "Sridharan K");
    setDisplayName(profile.displayName || "Sridharan");
    setEmail(profile.email || "24104029@nec.edu.in");
    setLocation(profile.location || "Tamil Nadu, India");
    setAccountType(profile.accountType || "Individual Customer");
    setCollege(profile.college || "National Engineering College, Kovilpatti");
    setDepartment(profile.department || "Computer Science and Engineering");
    setRole(profile.role || "CSE Student & Full-Stack Developer");
    setPortfolio(
      profile.portfolio ||
        "https://sridharan-777.github.io/sridharan-portfolio/",
    );
    setGithub(profile.github || "https://github.com/Sri080307");
    setLinkedin(
      profile.linkedin || "https://www.linkedin.com/in/sridharan-k-a759b340/",
    );
    setIsEditing(false);
  };

  const handleAddAddressSubmit = (e) => {
    e.preventDefault();
    if (!newLabel || !newName || !newAddress || !newCity || !newPhone) return;

    onAddAddress({
      id: `addr-${Math.floor(1000 + Math.random() * 9000)}`,
      label: newLabel,
      name: newName,
      address: newAddress,
      city: newCity,
      phone: newPhone,
    });

    setNewLabel("");
    setNewName("");
    setNewAddress("");
    setNewCity("");
    setNewPhone("");
    setShowAddAddress(false);
  };

  const handleRotateKey = () => {
    setApiKeyRotating(true);
    setTimeout(() => {
      const randHex = Array.from({ length: 24 }, () =>
        Math.floor(Math.random() * 16).toString(16),
      ).join("");
      setApiKey(`lt_live_${randHex}`);
      setApiKeyRotating(false);
    }, 1000);
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setApiKeyCopied(true);
    setTimeout(() => setApiKeyCopied(false), 2000);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError("");
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Please fill in all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    try {
      await apiClient.changePassword(currentPassword, newPassword);
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        setPasswordSuccess(false);
        setShowPasswordSection(false);
      }, 4000);
    } catch (error) {
      setPasswordError(error.message);
    }
  };

  const handleSignoutOtherDevices = () => {
    setDeviceSignoutSuccess(true);
    setTimeout(() => setDeviceSignoutSuccess(false), 4000);
  };

  const handleAvatarChange = () => {
    setAvatarSuccess(true);
    setTimeout(() => setAvatarSuccess(false), 3000);
  };

  // Reusable input field class
  const inputCls = (disabled) =>
    `w-full px-4 py-3 bg-slate-950/60 border border-slate-700 rounded-xl text-sm font-bold text-slate-200 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 placeholder-slate-600 ${disabled ? "opacity-50 cursor-not-allowed" : ""}`;

  // Toggle switch component
  const ToggleSwitch = ({ id, checked, onChange }) => (
    <label htmlFor={id} className="relative inline-flex items-center cursor-pointer">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only peer"
      />
      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500 peer-checked:after:bg-white"></div>
    </label>
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans">
      {/* Success Alerts */}
      {profileSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/40 rounded-2xl flex items-center gap-3 text-emerald-300 text-sm font-bold animate-fade-in">
          <Check className="h-5 w-5 text-emerald-400 shrink-0 stroke-2" />
          <span>Profile saved successfully! Credentials updated across all systems.</span>
        </div>
      )}

      {avatarSuccess && (
        <div className="p-4 bg-sky-500/10 border border-sky-500/40 rounded-2xl flex items-center gap-3 text-sky-300 text-sm font-bold animate-fade-in">
          <Check className="h-5 w-5 text-sky-400 shrink-0 stroke-2" />
          <span>Profile avatar update requested!</span>
        </div>
      )}

      {/* Main Grid: Left Profile Card + Right Forms */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Profile Hero Card */}
        <ThreeDCard className="h-full">
          <div className="h-full bg-gradient-to-b from-slate-900 via-slate-900 to-sky-950/50 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
            {/* Glow accents */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-sky-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-500/8 rounded-full blur-3xl"></div>

            <div className="relative z-10 space-y-6 text-center">
              {/* Avatar */}
              <div className="relative inline-block">
                <div className="h-32 w-32 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 border-4 border-slate-800 mx-auto flex items-center justify-center text-white shadow-xl shadow-sky-500/20 relative">
                  <span className="text-5xl font-black tracking-wider select-none">
                    {initials}
                  </span>
                  {/* Animated ring */}
                  <div className="absolute inset-0 rounded-full border-2 border-sky-400/30 animate-ping" style={{ animationDuration: "3s" }}></div>
                </div>
                <div className="absolute bottom-1 right-1 bg-emerald-500 text-white rounded-full p-2 border-3 border-slate-900 shadow-lg">
                  <ShieldCheck className="h-4 w-4 stroke-2" />
                </div>
              </div>

              {/* Upload */}
              <div className="space-y-2">
                <button
                  disabled
                  title="Photo upload will be enabled after object storage is configured"
                  className="px-5 py-2.5 bg-slate-800 border border-slate-700 text-slate-500 text-sm font-bold rounded-xl cursor-not-allowed"
                >
                  Photo upload unavailable
                </button>
                <p className="text-[10px] text-slate-500 font-mono font-bold">
                  JPG, PNG up to 5MB
                </p>
              </div>

              {/* Identity */}
              <div className="space-y-3 border-t border-slate-800 pt-5">
                <h3 className="text-2xl font-black text-white tracking-tight">
                  {name}
                </h3>
                <p className="text-sm font-bold bg-gradient-to-r from-sky-400 to-blue-400 bg-clip-text text-transparent">
                  {role}
                </p>
                <span className="inline-flex items-center gap-1.5 text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/30 font-black uppercase tracking-wider px-3 py-1.5 rounded-full">
                  <Sparkles className="h-3 w-3" />
                  {accountType}
                </span>
                <p className="text-[10px] text-slate-500 font-bold font-mono">
                  Account ID: {profile.id || profile._id || "Pending"}
                </p>
              </div>

              {/* Quick Stats */}
              <div className="space-y-3 border-t border-slate-800 pt-5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-bold">Location</span>
                  <span className="text-white font-mono font-bold">{profile.location || "Not set"}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-bold">Institution</span>
                  <span className="text-white font-bold">{profile.company || profile.college || "LogiTrack"}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-bold">Shipments</span>
                  <span className="text-emerald-400 font-mono font-bold">{profile.activeParcels ?? profile.activeDeliveriesCount ?? 0} Active</span>
                </div>
              </div>
            </div>
          </div>
        </ThreeDCard>

        {/* Right: Profile Settings Form */}
        <div className="lg:col-span-2 space-y-6">
          <form
            onSubmit={handleProfileSave}
            className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-8"
          >
            {/* Header Row */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-800">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">
                  Profile Settings
                </h2>
                <p className="text-xs text-slate-500 font-bold mt-1">
                  Manage your logistics identity and credentials
                </p>
              </div>
              <div className="flex items-center gap-3">
                {!isEditing ? (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="px-5 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-sm rounded-xl flex items-center gap-2 shadow-lg shadow-sky-500/20 transition cursor-pointer"
                  >
                    <Edit2 className="h-4 w-4" />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold text-sm rounded-xl transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      id="btn-save-profile-changes"
                      className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/20 transition cursor-pointer"
                    >
                      Save Changes
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* SECTION 1: PERSONAL INFO */}
            <div className="space-y-4">
              <h3 className="text-base font-black text-white flex items-center gap-2 border-l-2 border-sky-500 pl-3">
                <User className="h-4 w-4 text-sky-400" />
                <span>1. Personal Information</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-wider" htmlFor="input-full-name">Full Name</label>
                  <input id="input-full-name" type="text" disabled={!isEditing} value={name} onChange={(e) => setName(e.target.value)} required className={inputCls(!isEditing)} />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-wider" htmlFor="input-display-name">Display Name</label>
                  <input id="input-display-name" type="text" disabled={!isEditing} value={displayName} onChange={(e) => setDisplayName(e.target.value)} required className={inputCls(!isEditing)} />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-wider" htmlFor="input-email">Email Address</label>
                  <input id="input-email" type="email" disabled={!isEditing} value={email} onChange={(e) => setEmail(e.target.value)} required className={inputCls(!isEditing)} />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-wider" htmlFor="input-location">Location</label>
                  <input id="input-location" type="text" disabled={!isEditing} value={location} onChange={(e) => setLocation(e.target.value)} required className={inputCls(!isEditing)} />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-wider" htmlFor="input-account-type">Account Type</label>
                  <select id="input-account-type" disabled={!isEditing} value={accountType} onChange={(e) => setAccountType(e.target.value)} className={inputCls(!isEditing)}>
                    <option value="Individual Customer">Individual Customer</option>
                    <option value="Corporate Account">Corporate Account</option>
                    <option value="SLA Enterprise">SLA Enterprise</option>
                    <option value="Developer Sandbox Account">Developer Sandbox Account</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SECTION 2: EDUCATION */}
            <div className="space-y-4 border-t border-slate-800 pt-6">
              <h3 className="text-base font-black text-white flex items-center gap-2 border-l-2 border-purple-500 pl-3">
                <GraduationCap className="h-4 w-4 text-purple-400" />
                <span>2. Education and Profession</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-wider" htmlFor="input-college">College / University</label>
                  <input id="input-college" type="text" disabled={!isEditing} value={college} onChange={(e) => setCollege(e.target.value)} required className={inputCls(!isEditing)} />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-wider" htmlFor="input-department">Department</label>
                  <input id="input-department" type="text" disabled={!isEditing} value={department} onChange={(e) => setDepartment(e.target.value)} required className={inputCls(!isEditing)} />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-wider" htmlFor="input-role">Professional Role</label>
                  <input id="input-role" type="text" disabled={!isEditing} value={role} onChange={(e) => setRole(e.target.value)} required className={inputCls(!isEditing)} />
                </div>
              </div>
            </div>

            {/* SECTION 3: PROFESSIONAL LINKS */}
            <div className="space-y-4 border-t border-slate-800 pt-6">
              <h3 className="text-base font-black text-white flex items-center gap-2 border-l-2 border-emerald-500 pl-3">
                <Globe className="h-4 w-4 text-emerald-400" />
                <span>3. Professional Links</span>
              </h3>

              <div className="space-y-4">
                {[
                  { label: "Portfolio URL", icon: Globe, value: portfolio, set: setPortfolio, id: "input-portfolio", linkText: "Open Link", color: "text-emerald-400" },
                  { label: "GitHub URL", icon: Github, value: github, set: setGithub, id: "input-github", linkText: "Open Profile", color: "text-slate-300" },
                  { label: "LinkedIn URL", icon: Linkedin, value: linkedin, set: setLinkedin, id: "input-linkedin", linkText: "Connect", color: "text-sky-400" },
                ].map((link) => (
                  <div key={link.id} className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5" htmlFor={link.id}>
                        <link.icon className={`h-3.5 w-3.5 ${link.color}`} />
                        {link.label}
                      </label>
                      <a
                        href={link.value}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sky-400 hover:text-sky-300 text-xs font-bold flex items-center gap-1"
                      >
                        {link.linkText}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                    <input
                      id={link.id}
                      type="url"
                      disabled={!isEditing}
                      value={link.value}
                      onChange={(e) => link.set(e.target.value)}
                      required
                      className={inputCls(!isEditing)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* SECTION 4 & 5: Security + Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Security */}
        <ThreeDCard>
          <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
            <h3 className="text-base font-black text-white flex items-center gap-2 border-l-2 border-amber-500 pl-3">
              <Shield className="h-4 w-4 text-amber-400" />
              <span>4. Security & Protection</span>
            </h3>

            {passwordSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-bold flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-400" />
                <span>Password updated successfully!</span>
              </div>
            )}

            {passwordError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/40 rounded-xl text-rose-300 text-xs font-bold flex items-center gap-2">
                <X className="h-4 w-4 text-rose-400" />
                <span>{passwordError}</span>
              </div>
            )}

            {deviceSignoutSuccess && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/40 rounded-xl text-amber-300 text-xs font-bold flex items-center gap-2">
                <Check className="h-4 w-4 text-amber-400" />
                <span>Terminated 2 other active sessions.</span>
              </div>
            )}

            <div className="space-y-4">
              {!showPasswordSection ? (
                <button
                  type="button"
                  onClick={() => setShowPasswordSection(true)}
                  className="w-full px-5 py-3.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-sm rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Key className="h-4 w-4 text-amber-400" />
                  <span>Change System Password</span>
                </button>
              ) : (
                <form
                  onSubmit={handlePasswordSubmit}
                  className="space-y-4 bg-slate-950/50 border border-slate-800 p-5 rounded-2xl animate-fade-in"
                >
                  <h4 className="text-sm font-black text-white">Update Password</h4>

                  <div className="space-y-3">
                    <div className="space-y-1 relative">
                      <label className="text-xs font-bold text-slate-500">Current Password</label>
                      <div className="relative">
                        <input
                          type={showCurrentPw ? "text" : "password"}
                          placeholder="••••••••"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full px-4 py-2.5 pr-10 bg-slate-950/80 border border-slate-700 rounded-xl text-sm text-slate-200 outline-none focus:border-sky-500"
                        />
                        <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                          {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1 relative">
                      <label className="text-xs font-bold text-slate-500">New Password</label>
                      <div className="relative">
                        <input
                          type={showNewPw ? "text" : "password"}
                          placeholder="••••••••"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-4 py-2.5 pr-10 bg-slate-950/80 border border-slate-700 rounded-xl text-sm text-slate-200 outline-none focus:border-sky-500"
                        />
                        <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                          {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500">Confirm New Password</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-sm text-slate-200 outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowPasswordSection(false)}
                      className="flex-1 py-2.5 bg-slate-800 border border-slate-700 text-slate-300 font-bold text-sm rounded-xl hover:bg-slate-700 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold text-sm rounded-xl transition shadow-lg shadow-emerald-500/20"
                    >
                      Save Password
                    </button>
                  </div>
                </form>
              )}

              {/* 2FA Toggle */}
              <div className="hidden p-4 bg-slate-950/40 border border-slate-800 rounded-2xl items-center justify-between gap-4">
                <div className="space-y-1 max-w-[75%]">
                  <div className="flex items-center gap-2">
                    <Fingerprint className="h-4 w-4 text-purple-400" />
                    <span className="text-sm font-black text-white">Two-Factor Authentication</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-bold">
                    Biometric or mobile verification on new logins.
                  </p>
                </div>
                <ToggleSwitch id="toggle-2fa" checked={twoFactor} onChange={(e) => setTwoFactor(e.target.checked)} />
              </div>

              {/* Login Activity */}
              <div className="hidden space-y-3 pt-2">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                  Login Activity
                </span>
                <div className="space-y-2">
                  <div className="p-3 bg-sky-500/5 border border-sky-500/20 rounded-xl flex justify-between items-center">
                    <div className="flex items-start gap-2.5">
                      <Monitor className="h-4 w-4 text-sky-400 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-xs text-white font-bold block">Chennai, TN • Current Session</span>
                        <span className="text-[10px] text-slate-500 font-mono">Chrome on Windows</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-[10px] font-black rounded uppercase">
                      Active
                    </span>
                  </div>

                  <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-xl flex justify-between items-center">
                    <div className="flex items-start gap-2.5">
                      <Smartphone className="h-4 w-4 text-slate-600 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-xs text-slate-400 font-bold block">Kovilpatti, TN • 2 days ago</span>
                        <span className="text-[10px] text-slate-600 font-mono">Safari on iPhone 15</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-600 font-mono">Closed</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSignoutOtherDevices}
                className="hidden w-full py-2.5 bg-slate-950/40 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Sign out from all other devices
              </button>
            </div>
          </div>
        </ThreeDCard>

        {/* Notifications */}
        <ThreeDCard className="hidden">
          <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
            <h3 className="text-base font-black text-white flex items-center gap-2 border-l-2 border-sky-500 pl-3">
              <BellRing className="h-4 w-4 text-sky-400" />
              <span>5. Notification Preferences</span>
            </h3>

            <div className="space-y-1">
              {[
                { id: "pref-shipment", label: "Shipment Status Updates", desc: "Instant updates on customs clearances and hub transitions.", checked: shipmentUpdates, set: setShipmentUpdates, color: "text-sky-400" },
                { id: "pref-delivery", label: "Delivery Notifications", desc: "SMS alerts with courier driver details and receipts.", checked: deliveryNotifs, set: setDeliveryNotifs, color: "text-emerald-400" },
                { id: "pref-payment", label: "Payment Notifications", desc: "Receipts, tax invoices, and balance updates.", checked: paymentNotifs, set: setPaymentNotifs, color: "text-amber-400" },
                { id: "pref-promo", label: "Promotional Emails", desc: "New freight lanes, capabilities, and schedules.", checked: promoEmails, set: setPromoEmails, color: "text-purple-400" },
              ].map((pref) => (
                <div key={pref.id} className="flex items-center justify-between gap-4 p-3.5 hover:bg-slate-800/50 rounded-xl transition border-b border-slate-800/50 last:border-0">
                  <div className="space-y-0.5 max-w-[75%]">
                    <label htmlFor={pref.id} className="block text-sm font-bold text-white cursor-pointer">
                      {pref.label}
                    </label>
                    <p className="text-[10px] text-slate-500 font-bold">{pref.desc}</p>
                  </div>
                  <ToggleSwitch id={pref.id} checked={pref.checked} onChange={(e) => pref.set(e.target.checked)} />
                </div>
              ))}
            </div>
          </div>
        </ThreeDCard>
      </div>

      {/* ADDRESS BOOK */}
      <ThreeDCard>
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2 border-l-2 border-sky-500 pl-3">
                <BookOpen className="h-4 w-4 text-sky-400" />
                <span>Corporate Address Book</span>
              </h3>
              <p className="text-xs text-slate-500 font-bold mt-1 pl-5">
                Pre-populate pick-up and receiver details for dispatch.
              </p>
            </div>
            <button
              onClick={() => setShowAddAddress(!showAddAddress)}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-sm font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Address</span>
            </button>
          </div>

          {showAddAddress && (
            <form
              onSubmit={handleAddAddressSubmit}
              className="p-5 bg-slate-950/50 border border-slate-800 rounded-2xl space-y-4 animate-fade-in"
            >
              <h4 className="text-sm font-black text-white">New Address</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input type="text" placeholder="Address Label" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} required className={inputCls(false)} />
                <input type="text" placeholder="Contact Person" value={newName} onChange={(e) => setNewName(e.target.value)} required className={inputCls(false)} />
                <input type="text" placeholder="Street Address" value={newAddress} onChange={(e) => setNewAddress(e.target.value)} required className={inputCls(false)} />
                <input type="text" placeholder="City" value={newCity} onChange={(e) => setNewCity(e.target.value)} required className={inputCls(false)} />
                <input type="text" placeholder="Contact Phone" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} required className={inputCls(false)} />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowAddAddress(false)} className="px-4 py-2 bg-slate-800 border border-slate-700 text-slate-400 font-bold text-sm rounded-xl hover:bg-slate-700 transition">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold text-sm rounded-xl transition shadow-lg shadow-emerald-500/20">Save Address</button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(profile.addresses || []).map((addr) => (
              <div
                key={addr.id || addr._id}
                className="p-4 bg-slate-950/40 border border-slate-800 rounded-2xl space-y-3 hover:border-sky-500/30 transition group"
              >
                <div className="flex justify-between items-start">
                  <span className="px-2.5 py-1 bg-sky-500/10 border border-sky-500/30 text-sky-300 font-bold text-[10px] rounded-lg font-mono uppercase tracking-wider">
                    {addr.label}
                  </span>
                  <button
                    onClick={() => onDeleteAddress(addr.id || addr._id)}
                    className="p-2 hover:bg-rose-500/10 text-slate-600 hover:text-rose-400 rounded-lg transition"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-1 text-xs text-slate-400">
                  <p className="font-bold text-white text-sm">{addr.name}</p>
                  <p>{addr.address}</p>
                  <p>{addr.city}</p>
                  <p className="font-mono text-slate-500 mt-1">{addr.phone}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ThreeDCard>

      {/* DEVELOPER CREDENTIALS */}
      <ThreeDCard className="hidden">
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2 border-l-2 border-amber-500 pl-3">
                <Key className="h-4 w-4 text-amber-400" />
                <span>Developer API Credentials</span>
              </h3>
              <p className="text-xs text-slate-500 font-bold mt-1 pl-5">
                Authenticates automated cargo dispatches via HTTPS.
              </p>
            </div>
            <button
              onClick={handleRotateKey}
              disabled={apiKeyRotating}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 border border-slate-700 text-white text-sm font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 ${apiKeyRotating ? "animate-spin" : ""}`} />
              <span>Rotate Key</span>
            </button>
          </div>

          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl flex items-center justify-between gap-4">
            <div className="font-mono text-sm font-bold text-sky-300 select-all truncate">
              {apiKey}
            </div>
            <button
              onClick={handleCopyKey}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-white rounded-xl transition"
              title="Copy to clipboard"
            >
              {apiKeyCopied ? (
                <Check className="h-4 w-4 text-emerald-400" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold font-mono">
            <span>Docs:</span>
            <a href="#support" className="text-sky-400 hover:text-sky-300 flex items-center gap-0.5">
              developer.logitrack.com/docs
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </ThreeDCard>
    </div>
  );
}
