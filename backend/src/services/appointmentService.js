/**
 * Appointment and Calendar Service
 * 
 * Handles appointment scheduling, calendar management, and availability
 */

class AppointmentService {
  constructor() {
    this.appointments = new Map(); // Appointment storage
    this.availability = new Map(); // Staff availability
    this.timeSlots = new Map(); // Available time slots
    this.initializeMockData();
  }

  /**
   * Initialize mock data
   */
  initializeMockData() {
    // Mock staff availability
    const mockAvailability = [
      {
        staffId: '1',
        staffName: 'أحمد المدير',
        workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'sunday'],
        workingHours: {
          start: '09:00',
          end: '17:00'
        },
        breakTime: {
          start: '12:00',
          end: '13:00'
        },
        appointmentDuration: 30, // minutes
        bufferTime: 15, // minutes between appointments
        isActive: true,
      },
      {
        staffId: '2',
        staffName: 'سارة المستشارة',
        workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        workingHours: {
          start: '10:00',
          end: '18:00'
        },
        breakTime: {
          start: '13:00',
          end: '14:00'
        },
        appointmentDuration: 45,
        bufferTime: 15,
        isActive: true,
      }
    ];

    mockAvailability.forEach(availability => {
      this.availability.set(availability.staffId, availability);
    });

    // Mock appointments
    const mockAppointments = [
      {
        id: 'APT001',
        customerId: '1',
        customerName: 'أحمد محمد',
        customerEmail: 'ahmed@example.com',
        customerPhone: '+966501234567',
        staffId: '1',
        staffName: 'أحمد المدير',
        title: 'استشارة تجارية',
        description: 'مناقشة خطة التوسع التجاري',
        appointmentDate: new Date('2024-01-20'),
        startTime: '10:00',
        endTime: '10:30',
        duration: 30,
        status: 'confirmed',
        type: 'consultation',
        location: 'المكتب الرئيسي',
        meetingLink: null,
        reminderSent: false,
        notes: '',
        createdAt: new Date('2024-01-15'),
        createdBy: '1',
      },
      {
        id: 'APT002',
        customerId: '2',
        customerName: 'سارة أحمد',
        customerEmail: 'sara@example.com',
        customerPhone: '+966507654321',
        staffId: '2',
        staffName: 'سارة المستشارة',
        title: 'جلسة تدريب',
        description: 'تدريب على استخدام النظام',
        appointmentDate: new Date('2024-01-22'),
        startTime: '14:00',
        endTime: '14:45',
        duration: 45,
        status: 'pending',
        type: 'training',
        location: 'عبر الإنترنت',
        meetingLink: 'https://meet.google.com/abc-def-ghi',
        reminderSent: false,
        notes: 'إحضار جهاز لابتوب',
        createdAt: new Date('2024-01-16'),
        createdBy: '2',
      }
    ];

    mockAppointments.forEach(appointment => {
      this.appointments.set(appointment.id, appointment);
    });
  }

  /**
   * Create new appointment
   */
  async createAppointment(appointmentData) {
    try {
      const {
        customerId,
        customerName,
        customerEmail,
        customerPhone,
        staffId,
        title,
        description,
        appointmentDate,
        startTime,
        type = 'consultation',
        location = 'المكتب الرئيسي',
        meetingLink = null,
        notes = ''
      } = appointmentData;

      // Validate staff availability
      const staff = this.availability.get(staffId);
      if (!staff) {
        return {
          success: false,
          error: 'الموظف غير موجود'
        };
      }

      if (!staff.isActive) {
        return {
          success: false,
          error: 'الموظف غير متاح حالياً'
        };
      }

      // Check if time slot is available
      const isAvailable = await this.checkTimeSlotAvailability(
        staffId, 
        new Date(appointmentDate), 
        startTime, 
        staff.appointmentDuration
      );

      if (!isAvailable.available) {
        return {
          success: false,
          error: isAvailable.reason
        };
      }

      // Calculate end time
      const endTime = this.calculateEndTime(startTime, staff.appointmentDuration);

      const appointment = {
        id: this.generateAppointmentId(),
        customerId,
        customerName,
        customerEmail,
        customerPhone,
        staffId,
        staffName: staff.staffName,
        title,
        description,
        appointmentDate: new Date(appointmentDate),
        startTime,
        endTime,
        duration: staff.appointmentDuration,
        status: 'pending',
        type,
        location,
        meetingLink,
        reminderSent: false,
        notes,
        createdAt: new Date(),
        createdBy: customerId,
      };

      this.appointments.set(appointment.id, appointment);

      // Send confirmation notification (mock)
      this.sendAppointmentNotification(appointment, 'created');

      return {
        success: true,
        data: appointment,
        message: 'تم حجز الموعد بنجاح'
      };
    } catch (error) {
      console.error('Error creating appointment:', error);
      return {
        success: false,
        error: 'فشل في حجز الموعد'
      };
    }
  }

  /**
   * Get available time slots
   */
  async getAvailableTimeSlots(staffId, date) {
    try {
      const staff = this.availability.get(staffId);
      if (!staff) {
        return {
          success: false,
          error: 'الموظف غير موجود'
        };
      }

      const appointmentDate = new Date(date);
      const dayOfWeek = this.getDayOfWeek(appointmentDate);

      // Check if staff works on this day
      if (!staff.workingDays.includes(dayOfWeek)) {
        return {
          success: true,
          data: [],
          message: 'الموظف لا يعمل في هذا اليوم'
        };
      }

      // Generate time slots
      const timeSlots = this.generateTimeSlots(
        staff.workingHours.start,
        staff.workingHours.end,
        staff.appointmentDuration,
        staff.bufferTime,
        staff.breakTime
      );

      // Filter out booked slots
      const bookedSlots = this.getBookedSlots(staffId, appointmentDate);
      const availableSlots = timeSlots.filter(slot => 
        !bookedSlots.some(booked => this.timeSlotsOverlap(slot, booked))
      );

      return {
        success: true,
        data: availableSlots.map(slot => ({
          startTime: slot.startTime,
          endTime: slot.endTime,
          duration: staff.appointmentDuration,
          available: true,
        }))
      };
    } catch (error) {
      console.error('Error getting available time slots:', error);
      return {
        success: false,
        error: 'فشل في جلب المواعيد المتاحة'
      };
    }
  }

  /**
   * Update appointment status
   */
  async updateAppointmentStatus(appointmentId, status, notes = '') {
    try {
      const appointment = this.appointments.get(appointmentId);
      
      if (!appointment) {
        return {
          success: false,
          error: 'الموعد غير موجود'
        };
      }

      const oldStatus = appointment.status;
      appointment.status = status;
      appointment.notes = notes;

      this.appointments.set(appointmentId, appointment);

      // Send status update notification
      if (oldStatus !== status) {
        this.sendAppointmentNotification(appointment, 'status_updated');
      }

      return {
        success: true,
        data: appointment,
        message: 'تم تحديث حالة الموعد'
      };
    } catch (error) {
      console.error('Error updating appointment status:', error);
      return {
        success: false,
        error: 'فشل في تحديث حالة الموعد'
      };
    }
  }

  /**
   * Get appointments
   */
  async getAppointments(filters = {}) {
    try {
      let appointments = Array.from(this.appointments.values());

      // Apply filters
      if (filters.customerId) {
        appointments = appointments.filter(apt => apt.customerId === filters.customerId);
      }

      if (filters.staffId) {
        appointments = appointments.filter(apt => apt.staffId === filters.staffId);
      }

      if (filters.status) {
        appointments = appointments.filter(apt => apt.status === filters.status);
      }

      if (filters.type) {
        appointments = appointments.filter(apt => apt.type === filters.type);
      }

      if (filters.dateFrom) {
        const fromDate = new Date(filters.dateFrom);
        appointments = appointments.filter(apt => apt.appointmentDate >= fromDate);
      }

      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo);
        appointments = appointments.filter(apt => apt.appointmentDate <= toDate);
      }

      // Sort by appointment date and time
      appointments.sort((a, b) => {
        const dateCompare = new Date(a.appointmentDate) - new Date(b.appointmentDate);
        if (dateCompare !== 0) return dateCompare;
        return a.startTime.localeCompare(b.startTime);
      });

      // Pagination
      const page = parseInt(filters.page) || 1;
      const limit = parseInt(filters.limit) || 20;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      const paginatedAppointments = appointments.slice(startIndex, endIndex);

      return {
        success: true,
        data: paginatedAppointments,
        pagination: {
          page,
          limit,
          total: appointments.length,
          pages: Math.ceil(appointments.length / limit)
        }
      };
    } catch (error) {
      console.error('Error getting appointments:', error);
      return {
        success: false,
        error: 'فشل في جلب المواعيد'
      };
    }
  }

  /**
   * Get appointment statistics
   */
  async getAppointmentStats() {
    try {
      const appointments = Array.from(this.appointments.values());
      
      const stats = {
        total: appointments.length,
        pending: appointments.filter(apt => apt.status === 'pending').length,
        confirmed: appointments.filter(apt => apt.status === 'confirmed').length,
        completed: appointments.filter(apt => apt.status === 'completed').length,
        cancelled: appointments.filter(apt => apt.status === 'cancelled').length,
        noShow: appointments.filter(apt => apt.status === 'no_show').length,
        todayAppointments: appointments.filter(apt => 
          this.isSameDay(apt.appointmentDate, new Date())
        ).length,
        upcomingAppointments: appointments.filter(apt => 
          apt.appointmentDate > new Date() && apt.status !== 'cancelled'
        ).length,
      };

      // Type distribution
      const typeStats = {};
      appointments.forEach(apt => {
        typeStats[apt.type] = (typeStats[apt.type] || 0) + 1;
      });
      stats.typeDistribution = typeStats;

      // Staff workload
      const staffStats = {};
      appointments.forEach(apt => {
        if (!staffStats[apt.staffId]) {
          staffStats[apt.staffId] = {
            staffName: apt.staffName,
            total: 0,
            upcoming: 0,
          };
        }
        staffStats[apt.staffId].total++;
        if (apt.appointmentDate > new Date() && apt.status !== 'cancelled') {
          staffStats[apt.staffId].upcoming++;
        }
      });
      stats.staffWorkload = staffStats;

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('Error getting appointment stats:', error);
      return {
        success: false,
        error: 'فشل في جلب إحصائيات المواعيد'
      };
    }
  }

  /**
   * Helper methods
   */
  checkTimeSlotAvailability(staffId, date, startTime, duration) {
    const staff = this.availability.get(staffId);
    const dayOfWeek = this.getDayOfWeek(date);

    // Check if staff works on this day
    if (!staff.workingDays.includes(dayOfWeek)) {
      return { available: false, reason: 'الموظف لا يعمل في هذا اليوم' };
    }

    // Check if time is within working hours
    if (startTime < staff.workingHours.start || startTime >= staff.workingHours.end) {
      return { available: false, reason: 'الوقت خارج ساعات العمل' };
    }

    // Check if time conflicts with break
    const endTime = this.calculateEndTime(startTime, duration);
    if (this.timeOverlapsWithBreak(startTime, endTime, staff.breakTime)) {
      return { available: false, reason: 'الوقت يتعارض مع فترة الراحة' };
    }

    // Check for existing appointments
    const bookedSlots = this.getBookedSlots(staffId, date);
    const newSlot = { startTime, endTime };
    
    if (bookedSlots.some(slot => this.timeSlotsOverlap(newSlot, slot))) {
      return { available: false, reason: 'الوقت محجوز مسبقاً' };
    }

    return { available: true };
  }

  generateTimeSlots(startTime, endTime, duration, bufferTime, breakTime) {
    const slots = [];
    let currentTime = startTime;

    while (currentTime < endTime) {
      const slotEndTime = this.calculateEndTime(currentTime, duration);
      
      if (slotEndTime <= endTime) {
        // Check if slot overlaps with break time
        if (!this.timeOverlapsWithBreak(currentTime, slotEndTime, breakTime)) {
          slots.push({
            startTime: currentTime,
            endTime: slotEndTime,
          });
        }
      }

      currentTime = this.calculateEndTime(currentTime, duration + bufferTime);
    }

    return slots;
  }

  getBookedSlots(staffId, date) {
    return Array.from(this.appointments.values())
      .filter(apt => 
        apt.staffId === staffId && 
        this.isSameDay(apt.appointmentDate, date) &&
        apt.status !== 'cancelled'
      )
      .map(apt => ({
        startTime: apt.startTime,
        endTime: apt.endTime,
      }));
  }

  calculateEndTime(startTime, durationMinutes) {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  }

  timeSlotsOverlap(slot1, slot2) {
    return slot1.startTime < slot2.endTime && slot2.startTime < slot1.endTime;
  }

  timeOverlapsWithBreak(startTime, endTime, breakTime) {
    return startTime < breakTime.end && breakTime.start < endTime;
  }

  getDayOfWeek(date) {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[date.getDay()];
  }

  isSameDay(date1, date2) {
    return date1.toDateString() === date2.toDateString();
  }

  generateAppointmentId() {
    return `APT${Date.now().toString(36).toUpperCase()}`;
  }

  sendAppointmentNotification(appointment, type) {
    // Mock notification sending
    console.log(`Appointment notification sent: ${type} for ${appointment.id}`);
  }
}

module.exports = new AppointmentService();
