import mongoose from 'mongoose';

const fuelLogSchema = new mongoose.Schema(
  {
    logId: {
      type: String,
      required: true,
      unique: true,
    },
    date: { type: String, required: true },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
    },
    vehicleId: { type: String, default: '' }, // Legacy compat
    vehicleName: { type: String, default: '' },
    driverName: { type: String, default: '' },
    route: { type: String, default: '' },
    distanceKm: { type: Number, default: 0 },
    fuelAmount: { type: Number, default: 0 },
    fuelUnit: { type: String, default: 'kWh' },
    costPerUnit: { type: Number, default: 0 },
    totalCost: { type: Number, default: 0 },
    efficiency: { type: String, default: '' },
    notes: { type: String, default: '' },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        ret.id = ret.logId;
        delete ret.__v;
        return ret;
      },
    },
  }
);

fuelLogSchema.index({ vehicle: 1 });
fuelLogSchema.index({ date: -1 });

const FuelLog = mongoose.model('FuelLog', fuelLogSchema);
export default FuelLog;
