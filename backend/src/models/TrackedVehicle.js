import mongoose from 'mongoose';

const trackedVehicleSchema = new mongoose.Schema({
  plate: { type: String, required: true, unique: true, uppercase: true, index: true },
  label: { type: String, required: true, maxlength: 100 },
  driverHash: { type: String, required: true, select: false },
  viewerHash: { type: String, required: true, select: false },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
  sharing: { type: Boolean, default: false },
  location: {
    latitude: Number,
    longitude: Number,
    accuracy: Number,
    timestamp: Date,
    receivedAt: Date,
  },
}, { timestamps: true });

export default mongoose.model('TrackedVehicle', trackedVehicleSchema);
