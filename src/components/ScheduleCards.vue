<script setup lang="ts">
import { ref } from 'vue'
import type { ScheduleData } from '../types'

const props = defineProps<{
  data: ScheduleData
}>()

const selectedEntry = ref<string | null>(null)

function toggleSelected(key: string) {
  selectedEntry.value = selectedEntry.value === key ? null : key
}

function getEntryClass(status: string, isSelected: boolean): string {
  const base =
    'p-3.5 border-b border-[#DCE6F2] cursor-pointer transition-all duration-200 last:border-b-0'
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
      class="bg-white border border-[#AABBDD] rounded-xl shadow-sm overflow-hidden"
    >
      <div
        class="bg-[#F0F6FC] px-5 py-3.5 font-semibold text-[1.2rem] text-[#2F59A8] border-b border-[#AABBDD]"
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
                    class="inline-flex items-center gap-1.5 rounded-full bg-[#E2E8F0] px-2.5 py-1 text-sm font-medium text-[#475569]"
                  >
                    <i class="fa-solid fa-lock"></i>
                    ล็อคคิว
                  </span>
                  <div class="mt-1 text-sm text-[#64748B]">
                    {{ props.data.appointments[`${time}-${emp}`]?.content }}
                  </div>
                </template>
                <template
                  v-else-if="
                    props.data.appointments[`${time}-${emp}`]?.status ===
                    'AVAILABLE'
                  "
                >
                  <span
                    class="inline-flex items-center gap-1.5 rounded-full bg-[#16A34A] px-2.5 py-1 text-sm font-semibold text-white"
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
