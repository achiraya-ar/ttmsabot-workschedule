<script setup lang="ts">
import type { ScheduleData } from "../types";

const props = defineProps<{
    data: ScheduleData;
}>();

function getCellClass(status: string): string {
    switch (status) {
        case "BLOCKED":
            return "bg-[#FFCDD2] text-[#D32F2F]";
        case "AVAILABLE":
            return "text-[#1B5E20] italic font-medium";
        case "BOOKED":
            return "text-[#212121]";
        default:
            return "text-gray-300";
    }
}

function parseContent(cell: { status: string; content: string }) {
    if (cell.status === "BOOKED") {
        const [name, phone] = cell.content.split("|");
        return { name: name?.trim() ?? "", phone: phone?.trim() ?? "" };
    }
    return null;
}
</script>

<template>
    <div
        v-if="!props.data.employees.length"
        class="text-center py-8 text-gray-500"
    >
        ไม่มีพนักงานปฏิบัติงานในวันที่เลือก
    </div>
    <div v-else class="overflow-x-auto">
        <table class="w-full border-collapse schedule-table">
            <thead>
                <tr>
                    <th
                        class="border-b-2 border-[#AABBDD] px-4 py-4 text-center bg-white text-[#212121] font-semibold sticky top-0 left-0 z-[3] shadow-sm text-base"
                    >
                        เวลา
                    </th>
                    <th
                        v-for="emp in props.data.employees"
                        :key="emp"
                        class="border-b-2 border-[#AABBDD] px-4 py-4 text-center bg-white text-[#212121] font-semibold sticky top-0 z-[1] shadow-sm text-base"
                    >
                        {{ emp }}
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr
                    v-for="(time, idx) in props.data.times"
                    :key="time"
                    :class="idx % 2 === 1 ? 'bg-[#f7faff]' : 'bg-white'"
                    class="hover:[&>td]:bg-[#E0F2F1]"
                >
                    <td
                        class="border-b border-[#C2D1E7] px-4 py-4 text-center font-semibold sticky left-0 z-[2] bg-inherit text-base min-w-[80px]"
                    >
                        {{ time }}
                    </td>
                    <td
                        v-for="emp in props.data.employees"
                        :key="`${time}-${emp}`"
                        class="border-b border-[#C2D1E7] px-4 py-4 text-[0.98rem] transition-colors duration-200"
                        :class="
                            getCellClass(
                                props.data.appointments[`${time}-${emp}`]
                                    ?.status ?? 'OFF_SCHEDULE',
                            )
                        "
                    >
                        <template
                            v-if="
                                props.data.appointments[`${time}-${emp}`]
                                    ?.status === 'BOOKED'
                            "
                        >
                            <div
                                v-if="
                                    parseContent(
                                        props.data.appointments[
                                            `${time}-${emp}`
                                        ]!,
                                    )
                                "
                            >
                                <div
                                    class="font-semibold text-[#212121] text-[1.05em]"
                                >
                                    {{
                                        parseContent(
                                            props.data.appointments[
                                                `${time}-${emp}`
                                            ]!,
                                        )?.name
                                    }}
                                </div>
                                <div class="text-[0.95em] text-[#555] mt-1">
                                    {{
                                        parseContent(
                                            props.data.appointments[
                                                `${time}-${emp}`
                                            ]!,
                                        )?.phone
                                    }}
                                </div>
                            </div>
                        </template>
                        <template
                            v-else-if="
                                props.data.appointments[`${time}-${emp}`]
                                    ?.status === 'BLOCKED'
                            "
                        >
                            <strong>ล็อคคิว</strong><br />
                            <span class="text-sm">{{
                                props.data.appointments[`${time}-${emp}`]
                                    ?.content
                            }}</span>
                        </template>
                        <template
                            v-else-if="
                                props.data.appointments[`${time}-${emp}`]
                                    ?.status === 'AVAILABLE'
                            "
                        >
                            ว่าง
                        </template>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<style scoped>
/* Use fixed table layout so columns (except the first) share remaining width equally */
.schedule-table {
    table-layout: fixed;
    width: 100%;
    border-collapse: collapse;
}

/* Keep the leftmost column narrower / fixed */
.schedule-table th:first-child,
.schedule-table td:first-child {
    width: 80px;
    min-width: 80px;
    max-width: 120px;
}

/* Center content in all header and body cells */
.schedule-table th,
.schedule-table td {
    text-align: center;
    vertical-align: middle;
}

/* Allow wrapping and breaking long words in cells instead of truncating */
.schedule-table td {
    white-space: normal;
    overflow-wrap: anywhere;
    word-break: break-word;
}
</style>
