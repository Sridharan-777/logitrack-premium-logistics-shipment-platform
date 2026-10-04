import mongoose from 'mongoose';

const trackingLocationSchema = new mongoose.Schema(
  {
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
    },
    shipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shipment',
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    accuracy: { type: Number, default: 0 },
    timestamp: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
    // Legacy tracking fields from existing system
    plate: { type: String, default: '' },
    label: { type: String, default: '' },
    sharing: { type: Boolean, default: false },
    stale: { type: Boolean, default: false },
    receivedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

trackingLocationSchema.index({ location: '2dsphere' });
trackingLocationSchema.index({ worker: 1, isActive: 1 });
trackingLocationSchema.index({ vehicle: 1 });
trackingLocationSchema.index({ shipment: 1 });
trackingLocationSchema.index({ plate: 1 });

const TrackingLocation = mongoose.model('TrackingLocation', trackingLocationSchema);
export default TrackingLocation;
