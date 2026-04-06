export interface AppointmentCell {
  status: 'AVAILABLE' | 'BOOKED' | 'BLOCKED' | 'OFF_SCHEDULE'
  content: string
}

export interface ScheduleData {
  employees: string[]
  times: string[]
  appointments: Record<string, AppointmentCell>
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

export interface AppSetting {
  setting_name: string
  setting_value: string
}
