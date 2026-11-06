export interface AppointmentCell {
  status: 'AVAILABLE' | 'BOOKED' | 'BLOCKED' | 'OFF_SCHEDULE'
  content: string
}

export interface ScheduleData {
  employees: string[]
  times: string[]
  appointments: Record<string, AppointmentCell>
  isHoliday: boolean
  holidayDescription: string | null
}

export interface Booking {
  therapist_name: string
  booking_date: string
  booking_time: string
  patient_first_name: string | null
  patient_last_name: string | null
  patient_phone: string | null
}

export interface Schedule {
  therapist_name: string
  time_slots: string[]
  day_of_week: number
}

export interface Blockage {
  therapist_name: string
  block_date: string
  block_time: string
  reason: string | null
}

export interface RegisteredPatient {
  patient_id: string
  first_name: string
  last_name: string
  phone_number: string
  can_self_book: boolean
}

export interface BookingInfo {
  date: string
  time: string
  therapist: string
  patientId: string
  patientFirstName: string
  patientLastName: string
  patientPhone: string
}

export interface BookingResult {
  success: boolean
  message?: string
}

export interface UserProfile {
  id: string
  email: string
  full_name: string
  role: string
  username: string
  can_access_personalworkschedule: boolean
  can_access_workschedule: boolean
  can_access_bookingportalmanager: boolean
}
