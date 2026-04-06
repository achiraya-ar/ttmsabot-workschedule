import { createClient } from "@supabase/supabase-js";
import type { ScheduleData, AppointmentCell } from "../types";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    "Missing Supabase environment variables. Define VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env",
  );
}

export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function getLoginPassword(): Promise<string | null> {
  const { data, error } = await supabaseClient
    .from("app_settings")
    .select("setting_value")
    .eq("setting_name", "login_password")
    .single();
  if (error) throw error;
  return data?.setting_value ?? null;
}

export async function getDailyScheduleData(
  dateString: string,
): Promise<ScheduleData> {
  const selectedDate = new Date(dateString + "T00:00:00");
  const dayOfWeek = selectedDate.getDay();

  const [schedulesRes, bookingsRes, blockagesRes] = await Promise.all([
    supabaseClient
      .from("schedules")
      .select("therapist_name, time_slots")
      .eq("day_of_week", dayOfWeek),
    supabaseClient.from("bookings").select("*").eq("booking_date", dateString),
    supabaseClient.from("blockages").select("*").eq("block_date", dateString),
  ]);

  if (schedulesRes.error) throw schedulesRes.error;
  if (bookingsRes.error) throw bookingsRes.error;
  if (blockagesRes.error) throw blockagesRes.error;

  const onDutySchedules = schedulesRes.data ?? [];
  const bookingsForDate = bookingsRes.data ?? [];
  const blockagesForDate = blockagesRes.data ?? [];

  if (onDutySchedules.length === 0) {
    return { employees: [], times: [], appointments: {} };
  }

  const employees = [
    ...new Set(onDutySchedules.map((r) => r.therapist_name.trim())),
  ].sort();
  const allTimesSet = new Set<string>();
  onDutySchedules.forEach((row) => {
    row.time_slots.forEach((time: string) => allTimesSet.add(time.trim()));
  });
  const times = Array.from(allTimesSet).sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true }),
  );

  const appointments: Record<string, AppointmentCell> = {};

  times.forEach((time) => {
    employees.forEach((employee) => {
      const key = `${time}-${employee}`;
      const employeeSchedule = onDutySchedules.find(
        (s) => s.therapist_name.trim() === employee,
      );
      const isOnDuty = employeeSchedule?.time_slots.includes(time);

      if (!isOnDuty) {
        appointments[key] = { status: "OFF_SCHEDULE", content: "" };
        return;
      }

      const booking = bookingsForDate.find(
        (b) =>
          b.therapist_name.trim() === employee &&
          b.booking_time.substring(0, 5) === time,
      );
      if (booking) {
        appointments[key] = {
          status: "BOOKED",
          content: `${booking.patient_first_name ?? ""} ${booking.patient_last_name ?? ""}|${booking.patient_phone ?? ""}`,
        };
        return;
      }

      const blockage = blockagesForDate.find(
        (bl) =>
          bl.therapist_name.trim() === employee &&
          bl.block_time.substring(0, 5) === time,
      );
      if (blockage) {
        appointments[key] = {
          status: "BLOCKED",
          content: blockage.reason ?? "โดยเจ้าของ/ผู้ดูแลระบบ",
        };
        return;
      }

      appointments[key] = { status: "AVAILABLE", content: "ว่าง" };
    });
  });

  return { employees, times, appointments };
}
