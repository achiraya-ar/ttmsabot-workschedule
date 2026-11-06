<script setup lang="ts">
import type { AppointmentCell, ScheduleData } from '../types'

const props = withDefaults(
    defineProps<{
        data: ScheduleData
        isHoliday?: boolean
    }>(),
    {
        isHoliday: false,
    },
)

const emit = defineEmits<{
    (e: 'book', payload: { time: string; therapist: string }): void
}>()

function getCell(time: string, emp: string): AppointmentCell | undefined {
    return props.data.appointments[`${time}-${emp}`]
}

function getCellClass(status: string): string {
    switch (status) {
        case 'BLOCKED':
            return 'cell-blocked'
        case 'AVAILABLE':
            return 'cell-available'
        case 'BOOKED':
            return 'cell-booked'
        default:
            return 'cell-off'
    }
}

function parseContent(cell: AppointmentCell) {
    const [name, phone] = cell.content.split('|')
    return { name: name?.trim() ?? '', phone: phone?.trim() ?? '' }
}
</script>

<template>
    <div
        v-if="!props.data.employees.length"
        class="empty-state"
        :class="{ 'empty-state--holiday': props.isHoliday }"
    >
        <i class="fa-solid fa-calendar-xmark"></i>
        ไม่มีพนักงานปฏิบัติงานในวันที่เลือก
    </div>

    <div
        v-else
        class="schedule-table-card"
        :class="{ 'schedule-table-card--holiday': props.isHoliday }"
    >
        <!-- Status legend -->
        <div v-if="!props.isHoliday" class="schedule-legend">
            <span class="legend-item">
                <span class="legend-dot dot-available"></span>
                ว่าง
            </span>
            <span class="legend-item">
                <span class="legend-dot dot-booked"></span>
                มีนัดหมาย
            </span>
            <span class="legend-item">
                <span class="legend-dot dot-blocked"></span>
                ล็อคคิว
            </span>
            <span class="legend-hint">
                <i class="fa-solid fa-arrows-left-right"></i>
                เลื่อนตารางแนวนอนได้
            </span>
        </div>

        <div class="table-scroll">
            <table class="schedule-table">
                <thead>
                    <tr>
                        <th class="time-header">เวลา</th>
                        <th v-for="emp in props.data.employees" :key="emp">
                            {{ emp }}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr
                        v-for="(time, idx) in props.data.times"
                        :key="time"
                        :class="{ 'row-alt': idx % 2 === 1 }"
                    >
                        <td class="time-cell">{{ time }}</td>
                        <td
                            v-for="emp in props.data.employees"
                            :key="`${time}-${emp}`"
                            class="schedule-cell"
                            :class="
                                getCellClass(
                                    getCell(time, emp)?.status ?? 'OFF_SCHEDULE',
                                )
                            "
                        >
                            <template v-if="getCell(time, emp)?.status === 'BOOKED'">
                                <div class="booked-name">
                                    {{ parseContent(getCell(time, emp)!).name }}
                                </div>
                                <div class="booked-phone">
                                    {{ parseContent(getCell(time, emp)!).phone }}
                                </div>
                            </template>

                            <template v-else-if="getCell(time, emp)?.status === 'BLOCKED'">
                                <span class="blocked-badge">
                                    <i class="fa-solid fa-lock"></i>
                                    ล็อคคิว
                                </span>
                                <div
                                    v-if="getCell(time, emp)?.content"
                                    class="blocked-reason"
                                >
                                    {{ getCell(time, emp)?.content }}
                                </div>
                            </template>

                            <template v-else-if="getCell(time, emp)?.status === 'AVAILABLE'">
                                <button
                                    v-if="!props.isHoliday"
                                    type="button"
                                    class="available-badge available-badge-button"
                                    @click="emit('book', { time, therapist: emp })"
                                >
                                    <span class="available-dot"></span>
                                    ว่าง
                                </button>
                                <span v-else class="available-badge">
                                    <span class="available-dot"></span>
                                    ว่าง
                                </span>
                            </template>

                            <template v-else>
                                <span class="off-schedule">–</span>
                            </template>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<style scoped>
/* ── Empty state ─────────────────────────────────────────────── */
.empty-state {
    border: 1px dashed #c2d1e7;
    border-radius: 14px;
    background: #f8fbff;
    color: #64748b;
    padding: 2rem 1rem;
    text-align: center;
    font-size: 1rem;
}

.empty-state i {
    display: block;
    margin-bottom: 0.5rem;
    font-size: 1.5rem;
    color: #94a3b8;
}

.empty-state--holiday {
    border-color: #fcd34d;
    background: #fffbeb;
    color: #92400e;
}

.empty-state--holiday i {
    color: #b45309;
}

/* ── Table card ──────────────────────────────────────────────── */
.schedule-table-card {
    border: 1px solid #c2d1e7;
    border-radius: 14px;
    background: #ffffff;
    overflow: hidden;
    box-shadow: 0 4px 14px rgba(30, 58, 95, 0.06);
}

/* ── Legend ──────────────────────────────────────────────────── */
.schedule-legend {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.6rem 1.1rem;
    padding: 0.85rem 1rem;
    border-bottom: 1px solid #e2eaf4;
    background: #f8fbff;
    color: #475569;
    font-size: 0.85rem;
}

.legend-item {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
}

.legend-dot {
    display: inline-block;
    width: 0.65rem;
    height: 0.65rem;
    border-radius: 9999px;
}

.dot-available {
    background: #22c55e;
}

.dot-booked {
    background: #3b82f6;
}

.dot-blocked {
    background: #94a3b8;
}

.legend-hint {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    margin-left: auto;
    color: #94a3b8;
    font-size: 0.8rem;
}

/* ── Table layout ────────────────────────────────────────────── */
.table-scroll {
    overflow-x: auto;
}

.schedule-table {
    width: max-content;
    min-width: 100%;
    border-collapse: separate;
    border-spacing: 0;
}

.schedule-table th,
.schedule-table td {
    text-align: center;
    vertical-align: middle;
    border-right: 1px solid #edf2f9;
    border-bottom: 1px solid #e2eaf4;
}

.schedule-table th:last-child,
.schedule-table td:last-child {
    border-right: none;
}

/* Header */
.schedule-table thead th {
    position: sticky;
    top: 0;
    z-index: 2;
    padding: 0.9rem 0.75rem;
    background: #eef5ff;
    color: #1e3a5f;
    font-size: 0.9rem;
    font-weight: 700;
    line-height: 1.4;
    white-space: normal;
}

.schedule-table thead th.time-header {
    left: 0;
    z-index: 4;
    width: 88px;
    min-width: 88px;
}

/* Body */
.schedule-table tbody td {
    padding: 0.85rem 0.75rem;
    background: #ffffff;
    font-size: 0.95rem;
    transition: background-color 0.15s ease;
}

.schedule-table tbody td.time-cell {
    position: sticky;
    left: 0;
    z-index: 1;
    width: 88px;
    min-width: 88px;
    background: #f7faff;
    color: #1e3a5f;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
}

.schedule-table th:not(:first-child),
.schedule-table td:not(:first-child) {
    min-width: 160px;
    max-width: 220px;
}

.schedule-table td.schedule-cell {
    overflow-wrap: anywhere;
}

/* Zebra rows */
.schedule-table tbody tr:nth-child(even) td {
    background: #fbfdff;
}

.schedule-table tbody tr:nth-child(even) td.time-cell {
    background: #f2f7ff;
}

/* Status backgrounds */
.schedule-table tbody tr td.cell-available {
    background: #dcfce7;
}

.schedule-table tbody tr td.cell-booked {
    background: #f5f9ff;
}

.schedule-table tbody tr td.cell-blocked {
    background: #f8fafc;
}

.schedule-table tbody tr td.cell-off {
    background: #fbfcfe;
}

/* Row hover */
.schedule-table tbody tr:hover td {
    background: #eaf5ff;
}

.schedule-table tbody tr:hover td.cell-available {
    background: #bbf7d0;
}

.schedule-table tbody tr:hover td.cell-booked {
    background: #e8f2ff;
}

.schedule-table tbody tr:hover td.cell-blocked {
    background: #f1f5f9;
}

.schedule-table tbody tr:hover td.time-cell {
    background: #dcecfb;
}

/* ── Cell content ────────────────────────────────────────────── */
.booked-name {
    color: #1e293b;
    font-size: 0.95rem;
    font-weight: 600;
    line-height: 1.35;
}

.booked-phone {
    margin-top: 0.2rem;
    color: #64748b;
    font-size: 0.83rem;
    font-variant-numeric: tabular-nums;
    line-height: 1.3;
}

.available-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.24rem 0.6rem;
    border-radius: 9999px;
    background: #16a34a;
    color: #ffffff;
    font-size: 0.85rem;
    font-weight: 600;
    box-shadow: 0 1px 2px rgba(22, 163, 74, 0.25);
}

.available-dot {
    display: inline-block;
    width: 0.42rem;
    height: 0.42rem;
    border-radius: 9999px;
    background: #ffffff;
    opacity: 0.95;
}

.available-badge-button {
    border: 0;
    cursor: pointer;
    font-family: inherit;
    transition:
        transform 0.15s ease,
        background-color 0.15s ease,
        box-shadow 0.15s ease;
}

.available-badge-button:hover {
    background: #15803d;
    transform: translateY(-1px);
    box-shadow: 0 3px 8px rgba(22, 163, 74, 0.3);
}

.available-badge-button:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.25);
}

.blocked-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.2rem 0.55rem;
    border-radius: 9999px;
    background: #e2e8f0;
    color: #475569;
    font-size: 0.8rem;
    font-weight: 500;
}

.blocked-reason {
    margin-top: 0.3rem;
    color: #64748b;
    font-size: 0.8rem;
    line-height: 1.35;
}

.off-schedule {
    color: #cbd5e1;
}

/* ── Holiday theme ───────────────────────────────────────────── */
.schedule-table-card--holiday {
    border-color: #fcd34d;
    background: #fffbeb;
    box-shadow: 0 4px 14px rgba(180, 83, 9, 0.08);
}

.schedule-table-card--holiday .schedule-table thead th,
.schedule-table-card--holiday .schedule-table tbody td {
    background: #fef3c7 !important;
    border-color: #fcd34d !important;
    color: #78350f;
}

.schedule-table-card--holiday .schedule-table thead th {
    background: #fde68a !important;
}

.schedule-table-card--holiday .schedule-table tbody tr:hover td {
    background: #fde68a !important;
}

.schedule-table-card--holiday .available-badge {
    background: #f59e0b;
    color: #ffffff;
    box-shadow: none;
}

.schedule-table-card--holiday .available-dot {
    background: #ffffff;
}

.schedule-table-card--holiday .booked-name {
    color: #78350f;
}

.schedule-table-card--holiday .booked-phone {
    color: #92400e;
}

.schedule-table-card--holiday .blocked-badge {
    background: #fde68a;
    color: #92400e;
}

.schedule-table-card--holiday .blocked-reason {
    color: #92400e;
}

.schedule-table-card--holiday .off-schedule {
    color: #b45309;
}
</style>
