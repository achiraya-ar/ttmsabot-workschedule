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

interface ScheduleVersionRow {
  id: number;
  therapist_name: string;
  day_of_week: number;
  time_slots: string[] | null;
  effective_from: string;
}

interface EffectiveSchedule {
  therapist_name: string;
  time_slots: string[];
}

function isMissingTableError(error: unknown): boolean {
  return (error as { code?: string } | null)?.code === "42P01";
}

function resolveEffectiveSchedules(
  dateString: string,
  dayOfWeek: number,
  versionRows: ScheduleVersionRow[],
): EffectiveSchedule[] {
  const effective = new Map<string, EffectiveSchedule>();

  versionRows
    .filter(
      (row) => row.day_of_week === dayOfWeek && row.effective_from <= dateString,
    )
    .sort(
      (a, b) =>
        a.effective_from.localeCompare(b.effective_from) || a.id - b.id,
    )
    .forEach((row) => {
      effective.set(row.therapist_name.trim(), {
        therapist_name: row.therapist_name.trim(),
        time_slots: row.time_slots ?? [],
      });
    });

  return [...effective.values()];
}

export async function getDailyScheduleData(
  dateString: string,
): Promise<ScheduleData> {
  const selectedDate = new Date(dateString + "T00:00:00");
  const dayOfWeek = selectedDate.getDay();

  const [versionsRes, bookingsRes, blockagesRes] = await Promise.all([
    supabaseClient
      .from("schedule_versions")
      .select("id, therapist_name, day_of_week, time_slots, effective_from")
      .eq("day_of_week", dayOfWeek)
      .lte("effective_from", dateString),
    supabaseClient.from("bookings").select("*").eq("booking_date", dateString),
    supabaseClient.from("blockages").select("*").eq("block_date", dateString),
  ]);

  if (versionsRes.error && !isMissingTableError(versionsRes.error)) {
    throw versionsRes.error;
  }
  if (bookingsRes.error) throw bookingsRes.error;
  if (blockagesRes.error) throw blockagesRes.error;

  const onDutySchedules = resolveEffectiveSchedules(
    dateString,
    dayOfWeek,
    (versionsRes.data ?? []) as ScheduleVersionRow[],
  ).filter((schedule) => schedule.time_slots.length > 0);
  const bookingsForDate = bookingsRes.data ?? [];
  const blockagesForDate = blockagesRes.data ?? [];

  const employees = [
    ...new Set([
      ...onDutySchedules.map((r) => r.therapist_name.trim()),
      ...bookingsForDate.map((b) => b.therapist_name.trim()),
      ...blockagesForDate.map((bl) => bl.therapist_name.trim()),
    ]),
  ]
    .filter(Boolean)
    .sort();

  if (employees.length === 0) {
    return { employees: [], times: [], appointments: {} };
  }

  const allTimesSet = new Set<string>();
  onDutySchedules.forEach((row) => {
    row.time_slots.forEach((time: string) => allTimesSet.add(time.trim()));
  });
  bookingsForDate.forEach((b) =>
    allTimesSet.add(b.booking_time.substring(0, 5)),
  );
  blockagesForDate.forEach((bl) =>
    allTimesSet.add(bl.block_time.substring(0, 5)),
  );

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

      if (!isOnDuty) {
        appointments[key] = { status: "OFF_SCHEDULE", content: "" };
        return;
      }

      appointments[key] = { status: "AVAILABLE", content: "ว่าง" };
    });
  });

  return { employees, times, appointments };
}
