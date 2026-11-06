<script setup lang="ts">
import { ref } from 'vue'
import type { ScheduleData } from '../types'

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

const selectedEntry = ref<string | null>(null)

function toggleSelected(key: string) {
  selectedEntry.value = selectedEntry.value === key ? null : key
}

function getEntryClass(
  status: string,
  isSelected: boolean,
  isHoliday: boolean,
): string {
  const base = `p-3.5 border-b ${isHoliday ? 'border-[#FCD34D]' : 'border-[#DCE6F2]'} cursor-pointer transition-all duration-200 last:border-b-0`
  if (isHoliday) {
    const selectedClass = isSelected
      ? 'ring-2 ring-inset ring-[#F59E0B]'
      : ''
    return `${base} bg-[#FEF3C7] text-[#78350F] ${selectedClass}`
  }
  const statusClass =
    status === 'AVAILABLE'
      ? 'bg-[#DCFCE7]'
      : status === 'BLOCKED'
        ? 'bg-[#F8FAFC]'
        : status === 'BOOKED'
          ? 'bg-[#F5F9FF]'
          : 'bg-white'
  const selectedClass = isSelected ? 'ring-2 ring-inset ring-[#2F59A8]' : ''
  return `${base} ${statusClass} ${selectedClass}`
}

function parseBooked(content: string) {
  const [name, phone] = content.split('|')
  return { name: name?.trim() ?? '', phone: phone?.trim() ?? '' }
}
</script>

<template>
  <div v-if="!props.data.times.length" class="text-center py-8 text-gray-500">
    ไม่มีตารางเวลาในวันที่เลือก
  </div>
  <div v-else class="space-y-4">
    <!-- Status legend -->
    <div
      v-if="!props.isHoliday"
      class="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-[#C2D1E7] bg-[#F8FBFF] px-4 py-3 text-sm text-[#475569]"
    >
      <span class="inline-flex items-center gap-1.5">
        <span class="h-2.5 w-2.5 rounded-full bg-[#22C55E]"></span>
        ว่าง
      </span>
      <span class="inline-flex items-center gap-1.5">
        <span class="h-2.5 w-2.5 rounded-full bg-[#3B82F6]"></span>
        มีนัดหมาย
      </span>
      <span class="inline-flex items-center gap-1.5">
        <span class="h-2.5 w-2.5 rounded-full bg-[#94A3B8]"></span>
        ล็อคคิว
      </span>
    </div>

    <div
      v-for="time in props.data.times"
      :key="time"
      class="rounded-xl border shadow-sm overflow-hidden"
      :class="
        props.isHoliday
          ? 'border-[#FCD34D] bg-[#FFFBEB]'
          : 'border-[#AABBDD] bg-white'
      "
    >
      <div
        class="px-5 py-3.5 font-semibold text-[1.2rem] border-b"
        :class="
          props.isHoliday
            ? 'border-[#FCD34D] bg-[#FDE68A] text-[#78350F]'
            : 'border-[#AABBDD] bg-[#F0F6FC] text-[#2F59A8]'
        "
      >
        {{ time }}
      </div>
      <div class="py-2">
        <template
          v-if="
            props.data.employees.some(
              (emp) =>
                props.data.appointments[`${time}-${emp}`]?.status !==
                'OFF_SCHEDULE',
            )
          "
        >
          <div
            v-for="emp in props.data.employees"
            :key="`${time}-${emp}`"
          >
            <div
              v-if="
                props.data.appointments[`${time}-${emp}`]?.status !==
                'OFF_SCHEDULE'
              "
              :class="
                getEntryClass(
                  props.data.appointments[`${time}-${emp}`]?.status ?? '',
                  selectedEntry === `${time}-${emp}`,
                  props.isHoliday,
                )
              "
              @click="toggleSelected(`${time}-${emp}`)"
            >
              <div
                class="font-semibold flex items-center gap-2.5 mb-2 text-[1.05rem] text-[#1E3A5F]"
              >
                <i class="fa-solid fa-user"></i>
                {{ emp }}
              </div>
              <div class="pl-7">
                <template
                  v-if="
                    props.data.appointments[`${time}-${emp}`]?.status ===
                    'BOOKED'
                  "
                >
                  <div class="font-semibold text-[#212121]">
                    {{
                      parseBooked(
                        props.data.appointments[`${time}-${emp}`]?.content ??
                          '',
                      ).name
                    }}
                  </div>
                  <div class="text-[0.9em] text-[#555]">
                    {{
                      parseBooked(
                        props.data.appointments[`${time}-${emp}`]?.content ??
                          '',
                      ).phone
                    }}
                  </div>
                </template>
                <template
                  v-else-if="
                    props.data.appointments[`${time}-${emp}`]?.status ===
                    'BLOCKED'
                  "
                >
                  <span
                    class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm font-medium"
                    :class="
                      props.isHoliday
                        ? 'bg-[#FDE68A] text-[#92400E]'
                        : 'bg-[#E2E8F0] text-[#475569]'
                    "
                  >
                    <i class="fa-solid fa-lock"></i>
                    ล็อคคิว
                  </span>
                  <div
                    class="mt-1 text-sm"
                    :class="props.isHoliday ? 'text-[#92400E]' : 'text-[#64748B]'"
                  >
                    {{ props.data.appointments[`${time}-${emp}`]?.content }}
                  </div>
                </template>
                <template
                  v-else-if="
                    props.data.appointments[`${time}-${emp}`]?.status ===
                    'AVAILABLE'
                  "
                >
                  <button
                    v-if="!props.isHoliday"
                    type="button"
                    class="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-[#16A34A] px-2.5 py-1 text-sm font-semibold text-white transition hover:bg-[#15803D]"
                    @click.stop="emit('book', { time, therapist: emp })"
                  >
                    <span class="h-1.5 w-1.5 rounded-full bg-white"></span>
                    ว่าง
                  </button>
                  <span
                    v-else
                    class="inline-flex items-center gap-1.5 rounded-full bg-[#F59E0B] px-2.5 py-1 text-sm font-semibold text-white"
                  >
                    <span class="h-1.5 w-1.5 rounded-full bg-white"></span>
                    ว่าง
                  </span>
                </template>
              </div>
            </div>
          </div>
        </template>
        <div v-else class="p-3.5 text-center text-gray-400">
          ไม่มีนัดหมาย
        </div>
      </div>
    </div>
  </div>
</template>
