<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import Swal from 'sweetalert2'
import ScheduleTable from './ScheduleTable.vue'
import ScheduleCards from './ScheduleCards.vue'
import BookingModal from './BookingModal.vue'
import { getDailyScheduleData } from '../services/supabase'
import type { ScheduleData } from '../types'

const props = defineProps<{
  currentDate: string
  windowWidth: number
}>()

const emit = defineEmits<{
  (e: 'logout'): void
  (e: 'schedule-loaded', data: ScheduleData): void
}>()

const selectedDate = ref(props.currentDate)
const scheduleData = ref<ScheduleData | null>(null)
const isLoading = ref(false)
const bookingSlot = ref<{ time: string; therapist: string } | null>(null)

const isMobile = computed(() => props.windowWidth <= 768)

function getMaxDateString() {
  const today = new Date()
  today.setDate(today.getDate() + 29)
  return today.toISOString().split('T')[0]
}

function formatToThaiDate(dateString: string) {
  const date = new Date(dateString + 'T00:00:00')
  return date.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })
}

async function loadSchedule(date: string) {
  isLoading.value = true
  scheduleData.value = null
  try {
    const data = await getDailyScheduleData(date)
    scheduleData.value = data
    emit('schedule-loaded', data)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดที่ไม่คาดคิด'
    Swal.fire({ icon: 'error', title: 'การโหลดข้อมูลตารางนัดหมายล้มเหลว', text: message })
  } finally {
    isLoading.value = false
  }
}

function handleBookSlot(payload: { time: string; therapist: string }) {
  bookingSlot.value = payload
}

function closeBooking() {
  bookingSlot.value = null
}

async function handleBooked() {
  bookingSlot.value = null
  await loadSchedule(selectedDate.value)
}

watch(selectedDate, (newDate) => {
  loadSchedule(newDate)
})

onMounted(() => {
  loadSchedule(selectedDate.value)
})
</script>

<template>
  <div>
    <div class="text-[1.4rem] font-semibold text-[#00796B] mb-5">แสดงข้อมูลตารางนัดหมาย</div>
    <div class="flex justify-between items-center mb-7 pb-5 border-b border-[#AABBDD] flex-wrap gap-5 max-[768px]:flex-col max-[768px]:items-stretch">
      <div class="flex items-center gap-3">
        <label for="date-selector" class="font-semibold">เลือกวันที่:</label>
        <input
          id="date-selector"
          v-model="selectedDate"
          type="date"
          :max="getMaxDateString()"
          class="px-3 py-2.5 border border-[#AABBDD] rounded-md text-[1.05rem] font-[Prompt] focus:outline-none focus:border-[#2F59A8] focus:shadow-[0_0_0_4px_rgba(47,89,168,0.2)]"
        />
      </div>
      <button
        class="px-6 py-3 border-none rounded-md cursor-pointer font-[Prompt] text-[1.05rem] font-medium transition-all duration-200 bg-[#C62828] text-white hover:bg-[#B71C1C] hover:shadow-md max-[768px]:w-full max-[768px]:text-center"
        @click="emit('logout')"
      >
        <i class="fa-solid fa-sign-out-alt mr-2"></i>ออกจากระบบ
      </button>
    </div>

    <div
      class="text-[1.2rem] font-semibold text-[#212121] mb-7 p-4 bg-[#F0F6FC] border border-[#AABBDD] rounded-lg text-center max-[768px]:text-[1.15rem] max-[768px]:p-3"
    >
      ข้อมูลวันที่: {{ formatToThaiDate(selectedDate) }}
    </div>

    <div v-if="isLoading" class="text-center py-16 text-[1.8rem] text-[#2F59A8]">
      <i class="fas fa-spinner fa-spin text-5xl block mb-3"></i>
      <p class="text-base mt-3">กำลังโหลดข้อมูล...</p>
    </div>

    <template v-else-if="scheduleData">
      <div
        v-if="scheduleData.isHoliday"
        class="mb-4 flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-amber-800"
      >
        <i class="fa-solid fa-calendar-xmark mt-1"></i>
        <div>
          <p class="m-0 font-semibold">
            วันหยุด: {{ scheduleData.holidayDescription || 'วันหยุด' }}
          </p>
          <p class="m-0 mt-1 text-sm text-amber-700">
            ไม่สามารถจองคิวในวันนี้ได้
          </p>
        </div>
      </div>

      <ScheduleTable
        v-if="!isMobile"
        :data="scheduleData"
        :is-holiday="scheduleData.isHoliday"
        @book="handleBookSlot"
      />
      <ScheduleCards
        v-else
        :data="scheduleData"
        :is-holiday="scheduleData.isHoliday"
        @book="handleBookSlot"
      />
    </template>

    <BookingModal
      :open="!!bookingSlot"
      :date="selectedDate"
      :time="bookingSlot?.time ?? ''"
      :therapist="bookingSlot?.therapist ?? ''"
      @close="closeBooking"
      @booked="handleBooked"
    />
  </div>
</template>
