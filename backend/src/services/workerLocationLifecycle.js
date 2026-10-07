import Shipment from '../models/Shipment.js';
import WorkerLocationSession from '../models/WorkerLocationSession.js';

export const TERMINAL_TRACKING_STATUSES = ['Delivered', 'Cancelled'];

/**
 * End an off-duty worker's tracking session once they have no remaining
 * customer-visible deliveries. This also removes the current coordinates so
 * an ended delivery cannot expose an off-duty location.
 */
export const stopWorkerLocationIfNoActiveShipments = async (workerId, at = new Date()) => {
  if (!workerId) return false;

  const hasActiveShipment = await Shipment.exists({
    assignedWorker: workerId,
    status: { $nin: TERMINAL_TRACKING_STATUSES },
  });

  if (hasActiveShipment) return false;

  const result = await WorkerLocationSession.updateOne(
    { worker: workerId, active: true },
    { $set: { active: false, endedAt: at, lastLocation: null } }
  );
  return result.modifiedCount > 0;
};
