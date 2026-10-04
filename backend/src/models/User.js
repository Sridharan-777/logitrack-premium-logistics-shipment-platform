import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const ROLES = {
  ADMIN: 'ADMIN',
  STAFF: 'STAFF',
  WORKER: 'WORKER',
  CUSTOMER: 'CUSTOMER',
};

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email'],
    },
    username: {
      type: String,
      trim: true,
      sparse: true,
      maxlength: [50, 'Username cannot exceed 50 characters'],
    },
    passwordHash: {
      type: String,
      select: false, // Never returned in queries by default
    },
    googleId: {
      type: String,
      sparse: true,
    },
    profileImage: {
      type: String,
      default: '',
    },
    avatar: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.CUSTOMER,
      required: true,
    },
    jobTitle: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
    company: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      default: '',
    },
    department: {
      type: String,
      default: '',
    },
    // Worker-specific fields
    vehicleType: { type: String, default: '' },
    vehiclePlate: { type: String, default: '' },
    transportMode: {
      type: String,
      enum: ['two-wheeler', 'van', 'bike', 'truck', ''],
      default: '',
    },
    zone: { type: String, default: '' },
    activeDeliveriesCount: { type: Number, default: 0 },
    completedToday: { type: Number, default: 0 },
    rating: { type: Number, default: 5.0, min: 0, max: 5 },
    dailyEarnings: { type: Number, default: 0 },
    doorStepServiceType: { type: String, default: '' },
    batteryLevel: { type: Number, default: 100 },
    workerStatus: { type: String, default: '' },
    // Staff-specific fields
    assignedVehicle: { type: String, default: '' },
    monthlyBaseSalary: { type: Number, default: 0 },
    hourlyRate: { type: Number, default: 0 },
    tripBonusRate: { type: Number, default: 0 },
    completedTripsThisMonth: { type: Number, default: 0 },
    hoursWorkedThisMonth: { type: Number, default: 0 },
    overtimeHours: { type: Number, default: 0 },
    staffStatus: { type: String, default: '' },
    deductions: { type: Number, default: 0 },
    lastPayoutDate: { type: String, default: '' },
    paymentMethod: { type: String, default: '' },
    // Customer-specific fields
    accountType: { type: String, default: 'Individual Customer' },
    totalBookings: { type: Number, default: 0 },
    activeParcels: { type: Number, default: 0 },
    college: { type: String, default: '' },
    portfolio: { type: String, default: '' },
    github: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    addresses: [
      {
        label: String,
        name: String,
        address: String,
        city: String,
        phone: String,
      },
    ],
    // Status
    active: {
      type: Boolean,
      default: true,
    },
    memberSince: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        // Never expose password hash
        delete ret.passwordHash;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Index for efficient lookups (email and googleId already indexed via unique/sparse in schema)
userSchema.index({ role: 1 });
userSchema.index({ active: 1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash') || !this.passwordHash) return next();
  // Only hash if it's not already a bcrypt hash
  if (this.passwordHash.startsWith('$2')) return next();
  const salt = await bcrypt.genSalt(12);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.passwordHash) return false;
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Generate avatar initials from name
userSchema.pre('save', function (next) {
  if (!this.avatar && this.name) {
    const parts = this.name.trim().split(/\s+/);
    this.avatar =
      parts.length >= 2
        ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
        : this.name.slice(0, 2).toUpperCase();
  }
  next();
});

const User = mongoose.model('User', userSchema);

export { ROLES };
export default User;
