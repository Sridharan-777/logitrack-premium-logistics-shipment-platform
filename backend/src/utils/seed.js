import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { fileURLToPath } from 'node:url';
import connectDB from '../config/db.js';
import User, { ROLES } from '../models/User.js';
import Shipment from '../models/Shipment.js';
import Vehicle from '../models/Vehicle.js';
import FuelLog from '../models/FuelLog.js';
import Notification from '../models/Notification.js';
import Ticket from '../models/Ticket.js';

export const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('🌱 Starting database seed...\n');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Shipment.deleteMany({}),
      Vehicle.deleteMany({}),
      FuelLog.deleteMany({}),
      Notification.deleteMany({}),
      Ticket.deleteMany({}),
    ]);
    console.log('✓ Cleared existing collections');

    // ——— Create Users ———

    const admin = await User.create({
      name: 'LogiTrack Executive Admin',
      email: 'admin@logitrack.test',
      passwordHash: 'Admin@123',
      role: ROLES.ADMIN,
      avatar: 'AD',
      phone: '+49 69 9000 1111',
      company: 'LogiTrack 3D Global Operations HQ',
      location: 'Frankfurt, Germany',
      jobTitle: 'System Administrator & Managing Director',
      accountType: 'Administrator (Full Oversight & Master CRUD)',
      memberSince: 'Jan 2024',
    });
    console.log(`✓ Admin created: admin@logitrack.test / Admin@123`);

    const staff1 = await User.create({
      name: 'Alex Rivera',
      email: 'alex.rivera@logitrack.test',
      passwordHash: 'Staff@123',
      role: ROLES.STAFF,
      avatar: 'AR',
      phone: '+49 69 7788 9901',
      company: 'LogiTrack 3D Fleet Operations',
      location: 'Frankfurt Hub, Germany',
      jobTitle: 'Senior Operations Supervisor & Fleet Lead',
      accountType: 'Operations Staff (Monitor & Worker/User CRUD)',
      assignedVehicle: 'Volvo FH Electric (HH-LT-882)',
      monthlyBaseSalary: 4200,
      hourlyRate: 28.5,
      tripBonusRate: 45,
      completedTripsThisMonth: 34,
      hoursWorkedThisMonth: 160,
      overtimeHours: 14,
      rating: 4.95,
      staffStatus: 'Supervising Dispatch',
      zone: 'Central Europe & Global Dispatch',
      deductions: 620,
      lastPayoutDate: '08/31/2026',
      paymentMethod: 'Direct Bank Transfer (DE89 •••• 4021)',
      memberSince: 'Feb 2025',
    });

    const staff2 = await User.create({
      name: 'Elena Rostova',
      email: 'elena.rostova@logitrack.test',
      passwordHash: 'Staff@123',
      role: ROLES.STAFF,
      avatar: 'ER',
      phone: '+49 40 3344 5566',
      company: 'LogiTrack 3D Fleet Operations',
      location: 'Hamburg, Germany',
      jobTitle: 'Regional Logistics Controller',
      assignedVehicle: 'Mercedes-Benz Sprinter Van (HH-LT-104)',
      monthlyBaseSalary: 3850,
      hourlyRate: 25.0,
      tripBonusRate: 35,
      completedTripsThisMonth: 28,
      hoursWorkedThisMonth: 155,
      overtimeHours: 8,
      rating: 4.88,
      staffStatus: 'At Sorting Facility',
      zone: 'Northern Hub (Hamburg - Berlin)',
      deductions: 540,
      lastPayoutDate: '08/31/2026',
      paymentMethod: 'Direct Bank Transfer (DE44 •••• 9912)',
      memberSince: 'Mar 2025',
    });

    const staff3 = await User.create({
      name: 'Chen Wei',
      email: 'chen.wei@logitrack.test',
      passwordHash: 'Staff@123',
      role: ROLES.STAFF,
      avatar: 'CW',
      phone: '+44 20 8899 0011',
      company: 'LogiTrack 3D Air Operations',
      location: 'London, UK',
      jobTitle: 'Airfreight & Inter-Hub Coordinator',
      assignedVehicle: 'Boeing 777F SkyCargo (N-777LT)',
      monthlyBaseSalary: 5600,
      hourlyRate: 38.0,
      tripBonusRate: 80,
      completedTripsThisMonth: 19,
      hoursWorkedThisMonth: 140,
      overtimeHours: 20,
      rating: 4.98,
      staffStatus: 'Flight Dispatch Oversight',
      zone: 'Trans-European & UK Corridor',
      deductions: 890,
      lastPayoutDate: '08/31/2026',
      paymentMethod: 'Direct Bank Transfer (GB29 •••• 7731)',
      memberSince: 'Jan 2025',
    });
    console.log(`✓ Staff created: 3 staff members (password: Staff@123)`);

    const worker1 = await User.create({
      name: 'Rahul Sharma',
      email: 'rahul.worker@logitrack.test',
      passwordHash: 'Worker@123',
      role: ROLES.WORKER,
      avatar: 'RS',
      phone: '+91 98401 23456',
      vehicleType: 'Two-Wheeler (Ather 450X EV Scooter)',
      vehiclePlate: 'TN-72-LT-2024',
      transportMode: 'two-wheeler',
      zone: 'Tamil Nadu Hub / Urban Metro Corridor',
      activeDeliveriesCount: 3,
      completedToday: 18,
      rating: 4.96,
      workerStatus: 'At Doorstep Delivery',
      batteryLevel: 88,
      dailyEarnings: 95.0,
      doorStepServiceType: 'Express Home & Office Delivery',
      memberSince: 'May 2025',
    });

    const worker2 = await User.create({
      name: 'Lucas Müller',
      email: 'lucas.muller@logitrack.test',
      passwordHash: 'Worker@123',
      role: ROLES.WORKER,
      avatar: 'LM',
      phone: '+49 40 8822 1100',
      vehicleType: 'Two-Wheeler (BMW CE 04 Electric)',
      vehiclePlate: 'HH-LT-99M',
      transportMode: 'two-wheeler',
      zone: 'Hamburg Downtown & Harbour Metro',
      activeDeliveriesCount: 2,
      completedToday: 14,
      rating: 4.92,
      workerStatus: 'On Road Transit',
      batteryLevel: 75,
      dailyEarnings: 110.0,
      doorStepServiceType: 'Same-Day Door-to-Door',
      memberSince: 'Jun 2025',
    });

    const worker3 = await User.create({
      name: 'Antoine Laurent',
      email: 'antoine.l@logitrack.test',
      passwordHash: 'Worker@123',
      role: ROLES.WORKER,
      avatar: 'AL',
      phone: '+33 1 7788 9922',
      vehicleType: 'Ford E-Transit Urban Van',
      vehiclePlate: '75-LT-302',
      transportMode: 'van',
      zone: 'Paris Latin Quarter & Suburbs',
      activeDeliveriesCount: 4,
      completedToday: 22,
      rating: 4.89,
      workerStatus: 'Sorting at Hub',
      batteryLevel: 62,
      dailyEarnings: 130.0,
      doorStepServiceType: 'Bulk Package Doorstep Delivery',
      memberSince: 'Apr 2025',
    });

    const worker4 = await User.create({
      name: 'Sophie Clark',
      email: 'sophie.clark@logitrack.test',
      passwordHash: 'Worker@123',
      role: ROLES.WORKER,
      avatar: 'SC',
      phone: '+44 20 7711 4455',
      vehicleType: 'Two-Wheeler (Honda Super Cub EV)',
      vehiclePlate: 'LDN-LT-12',
      transportMode: 'two-wheeler',
      zone: 'London Central & Canary Wharf',
      activeDeliveriesCount: 1,
      completedToday: 16,
      rating: 4.98,
      workerStatus: 'Out for Door Delivery',
      batteryLevel: 92,
      dailyEarnings: 105.0,
      doorStepServiceType: 'Priority Documents & Medical Delivery',
      memberSince: 'Jul 2025',
    });
    console.log(`✓ Workers created: 4 workers (password: Worker@123)`);

    const customer1 = await User.create({
      name: 'Sridharan K',
      email: 'sridharan@logitrack.test',
      passwordHash: 'Customer@123',
      role: ROLES.CUSTOMER,
      avatar: 'SK',
      phone: '+91 94432 10987',
      company: 'National Engineering College',
      college: 'National Engineering College, Kovilpatti',
      department: 'Computer Science and Engineering',
      location: 'Tamil Nadu, India',
      accountType: 'Individual Customer',
      totalBookings: 12,
      activeParcels: 2,
      memberSince: 'Mar 2025',
      addresses: [
        { label: 'Frankfurt Central Hub', name: 'Frankfurt sorting facility', address: 'Cargo-Terminal 3, Gate 15', city: 'Frankfurt', phone: '+49 69 1234 567' },
        { label: 'Hamburg HQ Warehouse', name: 'Hamburg distribution yard', address: 'Industriestrasse 12, Gate B', city: 'Hamburg', phone: '+49 40 9876 543' },
        { label: 'NEC Campus Office', name: 'Sridharan K (HQ)', address: 'National Engineering College Campus, Gate 2', city: 'Kovilpatti', phone: '+91 94432 10987' },
      ],
    });

    const customer2 = await User.create({
      name: 'Dr. Marcus Vance',
      email: 'marcus.vance@logitrack.test',
      passwordHash: 'Customer@123',
      role: ROLES.CUSTOMER,
      avatar: 'MV',
      phone: '+44 20 7946 0958',
      company: 'Global Health Labs',
      location: 'London, UK',
      accountType: 'SLA Enterprise Customer',
      totalBookings: 28,
      activeParcels: 2,
      memberSince: 'Jan 2026',
    });

    const customer3 = await User.create({
      name: 'Dr. Evelyn Thomas',
      email: 'evelyn.thomas@logitrack.test',
      passwordHash: 'Customer@123',
      role: ROLES.CUSTOMER,
      avatar: 'ET',
      phone: '+33 1 42 27 78 90',
      company: 'Sorbonne Biomedical Labs',
      location: 'Paris, France',
      accountType: 'Enterprise Customer',
      totalBookings: 15,
      activeParcels: 1,
      memberSince: 'Feb 2026',
    });
    console.log(`✓ Customers created: 3 customers (password: Customer@123)`);

    // ——— Create Vehicles ———
    const vehicles = await Vehicle.insertMany([
      { vehicleId: 'VEH-TW-01', name: 'Ather 450X High-Speed EV Scooter', plate: 'TN-72-LT-2024', type: 'Two-Wheeler (EV Scooter)', fuelType: 'Electric (kWh)', driver: worker1._id, driverId: 'worker-1', driverName: 'Rahul Sharma', capacityKg: 65, currentOdometerKm: 12400, avgEfficiency: '0.038 kWh / km (26 km/kWh)', fuelCapacity: 3.7, currentFuelLevel: 88, status: 'Doorstep Delivery Active', maintenanceStatus: 'Optimal (Zero Emission)', fuelCostPerUnit: 0.15 },
      { vehicleId: 'VEH-TW-02', name: 'BMW CE 04 Urban Electric Two-Wheeler', plate: 'HH-LT-99M', type: 'Two-Wheeler (Performance Maxi-Scooter)', fuelType: 'Electric (kWh)', driver: worker2._id, driverId: 'worker-2', driverName: 'Lucas Müller', capacityKg: 85, currentOdometerKm: 8900, avgEfficiency: '0.065 kWh / km', fuelCapacity: 8.9, currentFuelLevel: 75, status: 'On Metro Delivery Run', maintenanceStatus: 'Optimal', fuelCostPerUnit: 0.28 },
      { vehicleId: 'VEH-TW-03', name: 'Honda Super Cub Cargo Delivery Bike', plate: 'LDN-LT-12', type: 'Two-Wheeler (High-Efficiency Bike)', fuelType: 'Petrol / E20 (L)', driver: worker4._id, driverId: 'worker-4', driverName: 'Sophie Clark', capacityKg: 70, currentOdometerKm: 16800, avgEfficiency: '62.5 km / L', fuelCapacity: 4.8, currentFuelLevel: 92, status: 'Active Door Route', maintenanceStatus: 'Optimal', fuelCostPerUnit: 1.65 },
      { vehicleId: 'VEH-01', name: 'Volvo FH Electric Heavy Semi-Truck', plate: 'HH-LT-882', type: 'Heavy Electric Semi-Truck', fuelType: 'Electric (kWh)', driver: staff1._id, driverId: 'staff-1', driverName: 'Alex Rivera', capacityKg: 24000, currentOdometerKm: 148200, avgEfficiency: '1.25 kWh / km', fuelCapacity: 540, currentFuelLevel: 82, status: 'Inter-City Route', maintenanceStatus: 'Good', fuelCostPerUnit: 0.28 },
      { vehicleId: 'VEH-04', name: 'Ford E-Transit Urban Van', plate: '75-LT-302', type: 'Electric Cargo Van', fuelType: 'Electric (kWh)', driver: worker3._id, driverId: 'worker-3', driverName: 'Antoine Laurent', capacityKg: 1650, currentOdometerKm: 42300, avgEfficiency: '0.32 kWh / km', fuelCapacity: 68, currentFuelLevel: 62, status: 'Urban Bulk Courier', maintenanceStatus: 'Optimal', fuelCostPerUnit: 0.28 },
    ]);
    console.log(`✓ Vehicles created: ${vehicles.length}`);

    // ——— Create Shipments ———
    const shipments = await Shipment.insertMany([
      {
        trackingNumber: 'TRK-8924-M', senderName: 'Sridharan K', senderCity: 'Hamburg', senderAddress: 'Industriestrasse 12, Gate B', senderPhone: '+91 94432 10987', senderEmail: 'sridharan@logitrack.test', receiverName: 'Marcus Vance', receiverCity: 'London', receiverAddress: '88 Canary Wharf Blvd, Level 12', receiverPhone: '+44 20 7946 0958', receiverEmail: 'marcus.vance@logitrack.test', category: 'Electronics', weight: 4.8, dimensions: '40 x 30 x 15', speed: 'Express', cost: 48.3, operationalCost: 26.5, fuelExpense: 8.4, status: 'Out for Delivery', customer: customer1._id, customerId: customer1._id.toString(), assignedStaff: staff1._id, assignedStaffId: staff1._id.toString(), assignedStaffName: 'Alex Rivera (Supervisor)', assignedWorker: worker4._id, assignedWorkerId: worker4._id.toString(), assignedWorkerName: 'Sophie Clark', transportModeUsed: 'two-wheeler', workerVehicleName: 'Honda Super Cub EV Two-Wheeler (LDN-LT-12)', doorstepService: true, customerNeeds: 'Ring door buzzer twice. Leave with recipient Marcus Vance directly.', estimatedDelivery: 'Today by 5:30 PM (Door Courier en route)', currentLocation: 'Canary Wharf Sector 4 (0.8 km away)', insurance: true, itemDescription: 'High-precision diagnostics medical monitors.', bookingDate: '08/29/2026',
        timeline: [
          { time: '04:15 PM', status: 'Out for Doorstep Delivery', location: 'London Canary Wharf', description: 'Two-Wheeler Courier Sophie Clark dispatched for final doorstep handoff.' },
          { time: '11:34 AM', status: 'Customs Cleared', location: 'London Air Cargo Hub', description: 'Waybill cleared and transferred to local doorstep dispatch unit.' },
          { time: '08:12 AM', status: 'In Transit', location: 'Hamburg Yard', description: 'Cargo departed Hamburg distribution warehouse.' },
        ],
      },
      {
        trackingNumber: 'TRK-900112-E', senderName: 'Sridharan K', senderCity: 'Hamburg', senderAddress: 'Industriestrasse 12, Gate B', senderPhone: '+91 94432 10987', senderEmail: 'sridharan@logitrack.test', receiverName: 'Marcus Vance', receiverCity: 'London', receiverAddress: '88 Canary Wharf Blvd, Level 12', receiverPhone: '+44 20 7946 0958', receiverEmail: 'marcus.vance@logitrack.test', category: 'Medical', weight: 12.5, dimensions: '50 x 50 x 40', speed: 'Same-Day', cost: 112.5, operationalCost: 68.2, fuelExpense: 34.0, status: 'Customs Hold', escalationStatus: 'Action Required', customer: customer1._id, customerId: customer1._id.toString(), assignedStaff: staff3._id, assignedStaffId: staff3._id.toString(), assignedStaffName: 'Chen Wei (Supervisor)', transportModeUsed: 'flight', workerVehicleName: 'Air Freight Hub Dispatch', doorstepService: true, customerNeeds: 'URGENT: Temperature must stay between 2°C - 8°C. Do not break cold chain seals.', estimatedDelivery: 'Delayed (Customs Verification Required)', currentLocation: 'UK Border Customs Gate 4', fragile: true, insurance: true, itemDescription: 'Critical temperature-controlled biomedical cell cultures.', bookingDate: '08/28/2026',
        timeline: [
          { time: '02:15 PM', status: 'Customs Hold', location: 'UK Border Control', description: 'Transit paused. Customs officials require complete commercial invoice documentation.' },
          { time: '09:30 AM', status: 'Departed sorting facility', location: 'Frankfurt Airbase', description: 'Flight LT-282 departed Frankfurt with biological cargo cooler.' },
        ],
      },
      {
        trackingNumber: 'TRK-891992-B', senderName: 'Sridharan K', senderCity: 'Hamburg', senderAddress: 'Industriestrasse 12, Gate B', senderPhone: '+91 94432 10987', senderEmail: 'sridharan@logitrack.test', receiverName: 'Dr. Evelyn Thomas', receiverCity: 'Paris', receiverAddress: '24 Rue de l\'Université', receiverPhone: '+33 1 42 27 78 90', receiverEmail: 'evelyn.thomas@logitrack.test', category: 'Documents', weight: 1.2, dimensions: '30 x 22 x 2', speed: 'Standard', cost: 24.7, operationalCost: 11.2, fuelExpense: 3.5, status: 'Delivered', receivedByCustomer: true, escalationStatus: 'Resolved', customer: customer1._id, customerId: customer1._id.toString(), assignedStaff: staff1._id, assignedStaffId: staff1._id.toString(), assignedStaffName: 'Alex Rivera (Supervisor)', assignedWorker: worker3._id, assignedWorkerId: worker3._id.toString(), assignedWorkerName: 'Antoine Laurent', transportModeUsed: 'van', workerVehicleName: 'Ford E-Transit (75-LT-302)', doorstepService: true, customerNeeds: 'Recipient physical signature required upon handoff.', estimatedDelivery: 'Delivered & Verified', currentLocation: 'Delivered at Doorstep - Paris Sorbonne', itemDescription: 'SLA Contract Agreements and medical audit signatures.', bookingDate: '08/26/2026',
        proofOfDelivery: { signedBy: 'Dr. Evelyn Thomas', timestamp: '04:50 PM, 08/26/2026', signatureCode: 'SIG-EVELYN-9921' },
        timeline: [
          { time: '04:50 PM', status: 'Delivered', location: 'Paris', description: 'Doorstep delivery completed. Signed and verified by Dr. Evelyn Thomas.' },
          { time: '11:00 AM', status: 'Out for Delivery', location: 'Paris Central', description: 'Courier driver Antoine Laurent assigned and dispatched for doorstep run.' },
        ],
      },
      {
        trackingNumber: 'TRK-774109-C', senderName: 'TechCorp Logistics', senderCity: 'Berlin', senderAddress: 'Alexanderplatz 4', senderPhone: '+49 30 1122 3344', senderEmail: 'dispatch@techcorp.de', receiverName: 'Sridharan K', receiverCity: 'Kovilpatti', receiverAddress: 'National Engineering College Campus', receiverPhone: '+91 94432 10987', receiverEmail: 'sridharan@logitrack.test', category: 'Hardware', weight: 18.2, dimensions: '60 x 40 x 40', speed: 'Express', cost: 185.0, operationalCost: 98.4, fuelExpense: 42.0, status: 'Out for Delivery', customer: customer1._id, customerId: customer1._id.toString(), assignedStaff: staff2._id, assignedStaffId: staff2._id.toString(), assignedStaffName: 'Elena Rostova (Supervisor)', assignedWorker: worker1._id, assignedWorkerId: worker1._id.toString(), assignedWorkerName: 'Rahul Sharma', transportModeUsed: 'two-wheeler', workerVehicleName: 'Ather 450X EV Scooter (TN-72-LT-2024)', doorstepService: true, customerNeeds: 'Call +91 94432 10987 upon arrival at NEC Campus Gate 2.', estimatedDelivery: 'Today by 6:00 PM (Ather EV Scooter en route)', currentLocation: 'Kovilpatti Main Road (1.2 km from NEC Campus)', fragile: true, insurance: true, itemDescription: 'Dual-socket GPU rack server units.', qty: 2, bookingDate: '08/30/2026',
        timeline: [
          { time: '04:30 PM', status: 'Out for Doorstep Delivery', location: 'Kovilpatti', description: 'Rahul Sharma on Ather 450X EV Two-Wheeler dispatched for NEC campus doorstep delivery.' },
          { time: '03:20 PM', status: 'Arrived at Local Sorting Hub', location: 'Kovilpatti Hub', description: 'Consignment checked and handed over to doorstep EV two-wheeler courier.' },
        ],
      },
    ]);
    console.log(`✓ Shipments created: ${shipments.length}`);

    // ——— Create Fuel Logs ———
    const fuelLogs = await FuelLog.insertMany([
      { logId: 'FUEL-8092', date: '08/31/2026', vehicleId: 'VEH-TW-01', vehicleName: 'Ather 450X EV Two-Wheeler (TN-72-LT-2024)', driverName: 'Rahul Sharma', route: 'Kovilpatti Hub -> NEC Campus Doorstep Runs', distanceKm: 48, fuelAmount: 1.82, fuelUnit: 'kWh', costPerUnit: 0.15, totalCost: 0.27, efficiency: '0.038 kWh/km', notes: 'Completed 18 doorstep package drops with rapid two-wheeler run.' },
      { logId: 'FUEL-8091', date: '08/30/2026', vehicleId: 'VEH-01', vehicleName: 'Volvo FH Electric (HH-LT-882)', driverName: 'Alex Rivera', route: 'Hamburg Central -> Frankfurt Cargo Terminal', distanceKm: 492, fuelAmount: 615, fuelUnit: 'kWh', costPerUnit: 0.28, totalCost: 172.2, efficiency: '1.25 kWh/km', notes: 'Overnight high-power fast charging at Frankfurt Hub station.' },
      { logId: 'FUEL-8090', date: '08/29/2026', vehicleId: 'VEH-TW-03', vehicleName: 'Honda Cargo Two-Wheeler (LDN-LT-12)', driverName: 'Sophie Clark', route: 'London Canary Wharf -> City Doorstep Run', distanceKm: 62, fuelAmount: 0.98, fuelUnit: 'Liters', costPerUnit: 1.65, totalCost: 1.62, efficiency: '63.2 km/L', notes: 'Door-to-door express delivery run.' },
    ]);
    console.log(`✓ Fuel logs created: ${fuelLogs.length}`);

    // ——— Create Notifications ———
    await Notification.insertMany([
      { type: 'alert', title: 'Action Required: Customs Delay', message: 'Border officials held shipment TRK-900112-E in UK Customs due to missing tax/valuation invoices.', read: false },
      { type: 'update', title: 'Doorstep Run Active (Two-Wheeler)', message: 'Rahul Sharma on Ather 450X EV Scooter dispatched for final doorstep handoff of TRK-774109-C.', read: false },
      { type: 'billing', title: 'P&L Financial Audit Statement Ready', message: 'Compiled operating gross revenue and fuel logs are available in Executive Controls.', read: false },
    ]);
    console.log(`✓ Notifications created: 3`);

    // ——— Create Tickets ———
    await Ticket.insertMany([
      { ticketId: 'TCK-3021', user: customer1._id, subject: 'Address correction request for TRK-8924-M', category: 'Address Correction', status: 'Open', date: '08/29/2026', description: 'Recipient noted Canary Wharf Blvd suite should be Level 14 instead of Level 12. Please amend before customs clearance completes.', priority: 'Medium' },
      { ticketId: 'TCK-2940', user: customer1._id, subject: 'Customs hold clarification on TRK-900112-E', category: 'Delivery Delay', status: 'Resolved', date: '08/28/2026', description: 'Inquired what exact commercial values are missing. Representative confirmed invoice file needs to state clear country of origin declarations.', priority: 'High' },
    ]);
    console.log(`✓ Tickets created: 2`);

    console.log('\n========================================');
    console.log('  🎉 DATABASE SEED COMPLETE');
    console.log('========================================\n');
    console.log('Demo Credentials:');
    console.log('─────────────────────────────────────');
    console.log('  ADMIN:    admin@logitrack.test       / Admin@123');
    console.log('  STAFF:    alex.rivera@logitrack.test  / Staff@123');
    console.log('  STAFF:    elena.rostova@logitrack.test / Staff@123');
    console.log('  STAFF:    chen.wei@logitrack.test     / Staff@123');
    console.log('  WORKER:   rahul.worker@logitrack.test / Worker@123');
    console.log('  WORKER:   lucas.muller@logitrack.test / Worker@123');
    console.log('  WORKER:   antoine.l@logitrack.test    / Worker@123');
    console.log('  WORKER:   sophie.clark@logitrack.test / Worker@123');
    console.log('  CUSTOMER: sridharan@logitrack.test    / Customer@123');
    console.log('  CUSTOMER: marcus.vance@logitrack.test / Customer@123');
    console.log('  CUSTOMER: evelyn.thomas@logitrack.test / Customer@123');
    console.log('─────────────────────────────────────\n');
    console.log('Open MongoDB Compass → mongodb://127.0.0.1:27017');
    console.log('Database: logitrack\n');

    return { users: 11, shipments: shipments.length, vehicles: vehicles.length };
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  }
};

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  seedDatabase().then(() => process.exit(0)).catch(() => process.exit(1));
}
