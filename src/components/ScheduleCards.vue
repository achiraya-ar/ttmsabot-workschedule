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
  const base = 'p-3.5 border-b border-[#C2D1E7] cursor-pointer transition-colors duration-300 last:border-b-0'
  if (isSelected) return `${base} bg-[#E0F2F1]`
  switch (status) {
    case 'BLOCKED': return `${base} bg-[#FFCDD2] text-[#D32F2F]`
    case 'AVAILABLE': return `${base} bg-[#E8F5E9] border border-[#1B5E20] my-2 shadow-sm`
    default: return base
  }
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
    <div
      v-for="time in props.data.times"
      :key="time"
      class="bg-white border border-[#AABBDD] rounded-xl shadow-sm overflow-hidden"
    >
      <div class="bg-[#F0F6FC] px-5 py-3.5 font-semibold text-[1.2rem] text-[#2F59A8] border-b border-[#AABBDD]">
        {{ time }}
      </div>
      <div class="py-2">
        <template v-if="props.data.employees.some(emp => props.data.appointments[`${time}-${emp}`]?.status !== 'OFF_SCHEDULE')">
          <div
            v-for="emp in props.data.employees"
            :key="`${time}-${emp}`"
          >
            <div
              v-if="props.data.appointments[`${time}-${emp}`]?.status !== 'OFF_SCHEDULE'"
              :class="getEntryClass(props.data.appointments[`${time}-${emp}`]?.status ?? '', selectedEntry === `${time}-${emp}`)"
              @click="toggleSelected(`${time}-${emp}`)"
            >
              <div
                class="font-semibold flex items-center gap-2.5 mb-2 text-[1.05rem]"
                :class="props.data.appointments[`${time}-${emp}`]?.status === 'AVAILABLE' ? 'text-[#1B5E20]' : 'text-[#212121]'"
              >
                <i class="fa-solid fa-user"></i>
                {{ emp }}
              </div>
              <div class="pl-7">
                <template v-if="props.data.appointments[`${time}-${emp}`]?.status === 'BOOKED'">
                  <div class="font-semibold text-[#212121]">{{ parseBooked(props.data.appointments[`${time}-${emp}`]?.content ?? '').name }}</div>
                  <div class="text-[0.9em] text-[#555]">{{ parseBooked(props.data.appointments[`${time}-${emp}`]?.content ?? '').phone }}</div>
                </template>
                <template v-else-if="props.data.appointments[`${time}-${emp}`]?.status === 'BLOCKED'">
                  <strong>ล็อคคิว</strong>
                  <div class="text-sm">{{ props.data.appointments[`${time}-${emp}`]?.content }}</div>
                </template>
                <template v-else-if="props.data.appointments[`${time}-${emp}`]?.status === 'AVAILABLE'">
                  <span class="text-[#1B5E20] font-medium">ว่าง</span>
                </template>
              </div>
            </div>
          </div>
        </template>
        <div v-else class="p-3.5 text-center text-gray-400">ไม่มีนัดหมาย</div>
      </div>
    </div>
  </div>
</template>
