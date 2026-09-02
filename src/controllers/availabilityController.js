import Appointment from '../models/Appointment.js';
import StaffProfile from '../models/StaffProfile.js';
import Service from '../models/Service.js';
import Salon from '../models/Salon.js';
import Leave from '../models/Leave.js';

export const getAvailability = async (req, res, next) => {
  try {
    const { salonId, serviceId, staffId, date } = req.query;

    if (!salonId || !serviceId || !date) {
      res.status(400);
      throw new Error('Please provide salonId, serviceId, and date');
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      res.status(404);
      throw new Error('Service not found');
    }

    const salon = await Salon.findById(salonId);
    if (!salon) {
      res.status(404);
      throw new Error('Salon not found');
    }

    const searchDate = new Date(date);
    const dayOfWeek = searchDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

    // 1. Fetch Staff
    let staffQuery = { salon: salonId, isActive: true };
    if (staffId) {
      staffQuery._id = staffId;
    }
    const staffList = await StaffProfile.find(staffQuery).populate('user');

    if (staffList.length === 0) {
      return res.json({ success: true, data: [] });
    }

    // 2. Fetch existing appointments and leaves
    const startOfDay = new Date(searchDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(searchDate.setHours(23, 59, 59, 999));

    const appointments = await Appointment.find({
      salon: salonId,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: 'CANCELLED' }
    });

    const leaves = await Leave.find({
      salon: salonId,
      status: 'approved',
      startDate: { $lte: endOfDay },
      endDate: { $gte: startOfDay }
    });

    const duration = service.duration; 
    let availableSlots = [];

    const generateSlots = (start, end, interval) => {
      let slots = [];
      let [startH, startM] = start.split(':').map(Number);
      let [endH, endM] = end.split(':').map(Number);
      let current = startH * 60 + startM;
      let limit = endH * 60 + endM;
      while (current + interval <= limit) {
        let h = Math.floor(current / 60).toString().padStart(2, '0');
        let m = (current % 60).toString().padStart(2, '0');
        slots.push(h + ':' + m);
        current += interval; // FIXED interval instead of hardcoded 30
      }
      return slots;
    };

    for (let staff of staffList) {
      const isStaffOnLeave = leaves.some(leave => leave.staff.toString() === staff._id.toString());
      if (isStaffOnLeave) {
        continue;
      }

      const dayHours = staff.workingHours && staff.workingHours[dayOfWeek] && staff.workingHours[dayOfWeek].open
        ? staff.workingHours[dayOfWeek]
        : salon.workingHours[dayOfWeek];

      const isWorkingDay = dayHours && !dayHours.isClosed && dayHours.open && dayHours.close;

      let baseSlots = [];
      let hasOverride = false;
      let isServiceSlotOverride = false;
      
      if (service.dateOverrides && service.dateOverrides.length > 0) {
        const override = service.dateOverrides.find(o => o.date === date);
        if (override && override.slots) {
          baseSlots = override.slots;
          hasOverride = true;
        }
      }

      if (!hasOverride) {
        if (service.timeSlots && service.timeSlots.length > 0) {
          baseSlots = service.timeSlots;
          isServiceSlotOverride = true;
        } else {
          if (isWorkingDay) {
             baseSlots = generateSlots(dayHours.open, dayHours.close, duration); // Using duration for slots
          }
        }
      }

      const staffAppointments = appointments.filter(app => app.staff.toString() === staff._id.toString());
      const processedSlots = [];
      
      for (let slotTime of baseSlots) {
        let available = true;

        if (!hasOverride && !isServiceSlotOverride) {
          if (!isWorkingDay) {
            available = false;
          } else if (slotTime < dayHours.open || slotTime > dayHours.close) {
            available = false;
          }
        }

        if (available) {
          let [slotH, slotM] = slotTime.split(':').map(Number);
          let slotStart = slotH * 60 + slotM;
          let slotEnd = slotStart + duration;

          let hasConflict = staffAppointments.some(app => {
            let [appStartH, appStartM] = app.startTime.split(':').map(Number);
            let [appEndH, appEndM] = app.endTime.split(':').map(Number);
            let appStart = appStartH * 60 + appStartM;
            let appEnd = appEndH * 60 + appEndM;
            return (slotStart < appEnd && slotEnd > appStart);
          });

          if (hasConflict) available = false;
        }

        // Only include available slots
        if (available) {
          processedSlots.push({
            time: slotTime,
            available
          });
        }
      }

      if (processedSlots.length > 0) {
        availableSlots.push({
          staffId: staff._id,
          staffName: staff.user?.firstName || 'Staff',
          slots: processedSlots
        });
      }
    }

    res.json({
      success: true,
      data: availableSlots
    });
  } catch (error) {
    next(error);
  }
};

