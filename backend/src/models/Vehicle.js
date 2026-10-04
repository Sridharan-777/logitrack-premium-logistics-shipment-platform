import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema(
  {
    vehicleId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: { type: String, required: true },
    plate: { type: String, required: true, uppercase: true, trim: true },
    type: { type: String, default: '' },
    fuelType: { type: String, default: '' },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    driverId: { type: String, default: '' }, // Legacy compat
    driverName: { type: String, default: '' },
    capacityKg: { type: Number, default: 0 },
    currentOdometerKm: { type: Number, default: 0 },
    avgEfficiency: { type: String, default: '' },
    fuelCapacity: { type: Number, default: 0 },
    currentFuelLevel: { type: Number, default: 100 },
    status: { type: String, default: 'Available' },
    maintenanceStatus: { type: String, default: 'Good' },
    fuelCostPerUnit: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        ret.id = ret.vehicleId;
        delete ret.__v;
        return ret;
      },
    },
  }
);

vehicleSchema.index({ plate: 1 });
vehicleSchema.index({ driver: 1 });

const Vehicle = mongoose.model('Vehicle', vehicleSchema);
export default Vehicle;
