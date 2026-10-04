import mongoose from 'mongoose';

const timelineEventSchema = new mongoose.Schema(
  {
    time: { type: String, required: true },
    status: { type: String, required: true },
    location: { type: String, default: '' },
    description: { type: String, default: '' },
  },
  { _id: true }
);

const proofOfDeliverySchema = new mongoose.Schema(
  {
    signedBy: { type: String, required: true },
    timestamp: { type: String, required: true },
    signatureCode: { type: String, default: '' },
  },
  { _id: false }
);

const shipmentSchema = new mongoose.Schema(
  {
    trackingNumber: {
      type: String,
      required: [true, 'Tracking number is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    // Sender info
    senderName: { type: String, required: true },
    senderCity: { type: String, required: true },
    senderAddress: { type: String, default: '' },
    senderPhone: { type: String, default: '' },
    senderEmail: { type: String, default: '' },
    // Receiver info
    receiverName: { type: String, required: true },
    receiverCity: { type: String, required: true },
    receiverAddress: { type: String, default: '' },
    receiverPhone: { type: String, default: '' },
    receiverEmail: { type: String, default: '' },
    // Shipment details
    category: { type: String, default: 'General' },
    weight: { type: Number, default: 0 },
    dimensions: { type: String, default: '' },
    speed: { type: String, default: 'Standard' },
    cost: { type: Number, default: 0 },
    operationalCost: { type: Number, default: 0 },
    fuelExpense: { type: Number, default: 0 },
    qty: { type: Number, default: 1 },
    itemDescription: { type: String, default: '' },
    fragile: { type: Boolean, default: false },
    insurance: { type: Boolean, default: false },
    paymentMethod: { type: String, default: '' },
    bookingDate: { type: String, default: '' },
    // Status
    status: {
      type: String,
      enum: [
        'Booked',
        'Picked Up',
        'In Transit',
        'Customs Hold',
        'Out for Delivery',
        'Delivered',
        'Cancelled',
        'Returned',
        'Redelivery Scheduled',
        'Doorstep Attempt Failed',
      ],
      default: 'Booked',
    },
    receivedByCustomer: { type: Boolean, default: false },
    deliveryAttemptCount: { type: Number, default: 0 },
    escalationStatus: {
      type: String,
      enum: ['Normal', 'Action Required', 'Resolved'],
      default: 'Normal',
    },
    // Assignments (references)
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    assignedStaff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    assignedStaffName: { type: String, default: '' },
    assignedWorker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    assignedWorkerName: { type: String, default: '' },
    // Transport
    transportModeUsed: {
      type: String,
      enum: ['two-wheeler', 'van', 'bike', 'truck', 'flight', 'ship', ''],
      default: '',
    },
    workerVehicleName: { type: String, default: '' },
    doorstepService: { type: Boolean, default: false },
    customerNeeds: { type: String, default: '' },
    // Location & delivery
    estimatedDelivery: { type: String, default: '' },
    currentLocation: { type: String, default: '' },
    // Timeline and proof
    timeline: [timelineEventSchema],
    proofOfDelivery: proofOfDeliverySchema,
    // Legacy customer ID for backward compat during migration
    customerId: { type: String, default: '' },
    assignedStaffId: { type: String, default: '' },
    assignedWorkerId: { type: String, default: '' },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

shipmentSchema.index({ status: 1 });
shipmentSchema.index({ customer: 1 });
shipmentSchema.index({ assignedWorker: 1 });
shipmentSchema.index({ assignedStaff: 1 });

// Virtual id field that returns trackingNumber for backward compatibility
shipmentSchema.virtual('id').get(function () {
  return this.trackingNumber;
});

const Shipment = mongoose.model('Shipment', shipmentSchema);
export default Shipment;
