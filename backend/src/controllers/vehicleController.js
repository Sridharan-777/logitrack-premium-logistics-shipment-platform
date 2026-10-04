import Vehicle from '../models/Vehicle.js';
import FuelLog from '../models/FuelLog.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * GET /api/vehicles
 */
export const getVehicles = asyncHandler(async (req, res) => {
  const vehicles = await Vehicle.find({ active: true })
    .populate('driver', 'name email role')
    .sort({ createdAt: -1 });

  res.json({ success: true, count: vehicles.length, vehicles });
});

/**
 * GET /api/vehicles/:id
 */
export const getVehicleById = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id).populate('driver', 'name email role');

  if (!vehicle) {
    return res.status(404).json({ success: false, message: 'Vehicle not found.' });
  }

  res.json({ success: true, vehicle });
});

/**
 * POST /api/vehicles
 */
export const createVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.create(req.body);
  res.status(201).json({ success: true, vehicle });
});

/**
 * PUT /api/vehicles/:id
 */
export const updateVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!vehicle) {
    return res.status(404).json({ success: false, message: 'Vehicle not found.' });
  }

  res.json({ success: true, vehicle });
});

/**
 * DELETE /api/vehicles/:id
 */
export const deleteVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id);

  if (!vehicle) {
    return res.status(404).json({ success: false, message: 'Vehicle not found.' });
  }

  vehicle.active = false;
  await vehicle.save();

  res.json({ success: true, message: `Vehicle ${vehicle.name} has been deactivated.` });
});

/**
 * GET /api/vehicles/fuellogs
 */
export const getFuelLogs = asyncHandler(async (req, res) => {
  const fuelLogs = await FuelLog.find().sort({ date: -1 });
  res.json({ success: true, count: fuelLogs.length, fuelLogs });
});

/**
 * POST /api/vehicles/fuellogs
 */
export const addFuelLog = asyncHandler(async (req, res) => {
  if (!req.body.logId) {
    req.body.logId = `FUEL-${Date.now().toString().slice(-6)}`;
  }
  const fuelLog = await FuelLog.create(req.body);

  // Update vehicle odometer/fuel if vehicleId provided
  if (req.body.vehicleId) {
    await Vehicle.findOneAndUpdate(
      { vehicleId: req.body.vehicleId },
      {
        $inc: { currentOdometerKm: req.body.distanceKm || 0 },
        $set: { currentFuelLevel: Math.min(100, 50 + 30) },
      }
    );
  }

  res.status(201).json({ success: true, fuelLog });
});
