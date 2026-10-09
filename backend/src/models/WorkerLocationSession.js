import mongoose from 'mongoose';

const lastLocationSchema = new mongoose.Schema(
  {
    latitude: {
      type: Number,
      required: true,
      min: -90,
      max: 90,
    },
    longitude: {
      type: Number,
      required: true,
      min: -180,
      max: 180,
    },
    accuracy: {
      type: Number,
      required: true,
      min: 0,
      max: 10_000,
    },
    deviceTimestamp: {
      type: Date,
      required: true,
    },
    receivedAt: {
      type: Date,
      required: true,
    },
  },
  { _id: false }
);

/**
 * Stores only a worker's current shift and latest GPS fix. Location history is
 * intentionally not retained, and there can be only one current session per
 * worker.
 */
const workerLocationSessionSchema = new mongoose.Schema(
  {
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    startedAt: {
      type: Date,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    endedAt: {
      type: Date,
      default: null,
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
    deviceId: {
      type: String,
      trim: true,
      maxlength: 128,
      default: '',
    },
    deviceCredentialHash: {
      type: String,
      select: false,
      default: null,
    },
    deviceCredentialIssuedAt: {
      type: Date,
      default: null,
    },
    lastLocation: {
      type: lastLocationSchema,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.deviceCredentialHash;
        delete ret.__v;
        return ret;
      },
    },
  }
);

workerLocationSessionSchema.index({ active: 1, expiresAt: 1 });
workerLocationSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const WorkerLocationSession = mongoose.model(
  'WorkerLocationSession',
  workerLocationSessionSchema
);

export default WorkerLocationSession;
