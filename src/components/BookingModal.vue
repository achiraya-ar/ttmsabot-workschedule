<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import Swal from 'sweetalert2'
import { checkPatientRegistration, processBooking } from '../services/supabase'

const props = defineProps<{
  open: boolean
  date: string
  time: string
  therapist: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'booked'): void
}>()

const patientId = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const inputRef = ref<HTMLInputElement | null>(null)

const canSubmit = computed(
  () => patientId.value.trim().length === 13 && !isLoading.value,
)

function formatThaiDate(dateString: string): string {
  if (!dateString) return ''
  return new Intl.DateTimeFormat('th-TH-u-ca-buddhist', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(dateString + 'T00:00:00'))
}

function validateThaiId(id: string): boolean {
  if (!/^\d{13}$/.test(id)) return false

  let sum = 0
  for (let i = 0; i < 12; i++) {
    sum += Number(id.charAt(i)) * (13 - i)
  }

  const checkDigit = (11 - (sum % 11)) % 10
  return checkDigit === Number(id.charAt(12))
}

function clearError() {
  if (errorMessage.value) errorMessage.value = ''
}

async function handleSubmit() {
  if (!canSubmit.value) return

  const id = patientId.value.trim()

  if (!validateThaiId(id)) {
    errorMessage.value = 'รูปแบบเลขบัตรประชาชนไม่ถูกต้อง'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    const { data: patient, error: lookupError } =
      await checkPatientRegistration(id)

    if (lookupError) throw lookupError

    if (!patient) {
      errorMessage.value =
        'ไม่พบข้อมูลผู้ป่วยที่ลงทะเบียนไว้ กรุณาตรวจสอบเลขบัตรประชาชน หรือติดต่อเจ้าหน้าที่เพื่อลงทะเบียนก่อนจองคิว'
      return
    }

    if (!patient.can_self_book) {
      errorMessage.value =
        'ผู้ป่วยรายนี้ยังไม่ได้รับอนุมัติให้จองคิวด้วยตัวเองผ่านหน้าเว็บ กรุณาติดต่อเจ้าหน้าที่'
      return
    }

    const patientName = `${patient.first_name} ${patient.last_name}`.trim()
    const confirmResult = await Swal.fire({
      title: 'ยืนยันการจองคิว?',
      html: `
        <div style="text-align:left;padding:0 1rem;font-size:1rem;">
          <p><strong>ผู้ป่วย:</strong> ${patientName}</p>
          <p><strong>เลขบัตรประชาชน:</strong> ${patient.patient_id}</p>
          <p><strong>เบอร์โทร:</strong> ${patient.phone_number || '-'}</p>
          <hr>
          <p><strong>วันที่:</strong> ${formatThaiDate(props.date)}</p>
          <p><strong>เวลา:</strong> ${props.time} น.</p>
          <p><strong>นักบำบัด:</strong> ${props.therapist}</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'ยืนยันการจอง',
      cancelButtonText: 'ยกเลิก',
      reverseButtons: true,
    })

    if (!confirmResult.isConfirmed) return

    const { data: result, error: bookingError } = await processBooking({
      date: props.date,
      time: props.time,
      therapist: props.therapist,
      patientId: patient.patient_id,
      patientFirstName: patient.first_name,
      patientLastName: patient.last_name,
      patientPhone: patient.phone_number,
    })

    if (bookingError) throw bookingError

    if (!result?.success) {
      errorMessage.value = result?.message || 'จองคิวไม่สำเร็จ กรุณาลองใหม่'
      return
    }

    await Swal.fire({
      icon: 'success',
      title: 'จองคิวสำเร็จ',
      html: `จองคิวให้ <strong>${patientName}</strong><br>วันที่ ${formatThaiDate(props.date)} เวลา ${props.time} น.<br>นักบำบัด ${props.therapist}`,
      confirmButtonText: 'ตกลง',
    })

    emit('booked')
    emit('close')
  } catch (err) {
    errorMessage.value =
      err instanceof Error ? err.message : 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง'
  } finally {
    isLoading.value = false
  }
}

watch(
  () => props.open,
  async (isOpen) => {
    if (!isOpen) return
    patientId.value = ''
    errorMessage.value = ''
    isLoading.value = false
    await nextTick()
    inputRef.value?.focus()
  },
)
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[100] flex items-end justify-center bg-[#0B1F3A]/55 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
      @click.self="!isLoading && emit('close')"
    >
      <div
        class="w-full max-w-lg overflow-hidden rounded-t-2xl bg-white shadow-[0_24px_80px_rgba(15,23,42,0.35)] sm:rounded-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-modal-title"
      >
        <div
          class="flex items-start justify-between gap-4 border-b border-[#DCE6F2] px-5 py-4 sm:px-6"
        >
          <div>
            <p
              class="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#2F59A8]"
            >
              จองคิว
            </p>
            <h2
              id="booking-modal-title"
              class="mt-1 text-xl font-bold text-[#1E293B]"
            >
              กรอกเลขบัตรประชาชน
            </h2>
          </div>
          <button
            type="button"
            class="flex h-9 w-9 items-center justify-center rounded-lg text-[#64748B] transition hover:bg-[#F0F6FC] hover:text-[#2F59A8] disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="isLoading"
            aria-label="ปิดหน้าต่างจองคิว"
            @click="emit('close')"
          >
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div
          class="mx-5 mt-5 rounded-xl border border-[#DCE6F2] bg-[#F0F6FC] px-4 py-3.5 text-sm text-[#334155] sm:mx-6"
        >
          <div class="grid gap-2 sm:grid-cols-3">
            <div>
              <p class="text-xs text-[#64748B]">วันที่</p>
              <p class="font-semibold">{{ formatThaiDate(date) }}</p>
            </div>
            <div>
              <p class="text-xs text-[#64748B]">เวลา</p>
              <p class="font-semibold">{{ time }} น.</p>
            </div>
            <div>
              <p class="text-xs text-[#64748B]">นักบำบัด</p>
              <p class="font-semibold">{{ therapist }}</p>
            </div>
          </div>
        </div>

        <form class="px-5 py-5 sm:px-6" @submit.prevent="handleSubmit">
          <label
            for="booking-patient-id"
            class="mb-2 block text-sm font-semibold text-[#212121]"
          >
            เลขบัตรประชาชน 13 หลัก <span class="text-[#C62828]">*</span>
          </label>

          <div class="relative">
            <i
              class="fa-solid fa-id-card pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#7B8FAE]"
            ></i>
            <input
              id="booking-patient-id"
              ref="inputRef"
              v-model="patientId"
              type="tel"
              required
              inputmode="numeric"
              maxlength="13"
              autocomplete="off"
              placeholder="กรอกเลขบัตรประชาชน 13 หลัก"
              class="w-full rounded-xl border border-[#C2D1E7] bg-[#F8FBFF] py-3.5 pl-11 pr-4 text-[1rem] tracking-[0.08em] text-[#212121] outline-none transition placeholder:tracking-normal placeholder:text-[#9AAABF] focus:border-[#2F59A8] focus:bg-white focus:ring-4 focus:ring-[#2F59A8]/15"
              :disabled="isLoading"
              @input="clearError"
            />
          </div>

          <p class="mt-2 text-xs leading-5 text-[#64748B]">
            ต้องเป็นผู้ป่วยที่ลงทะเบียนไว้แล้ว และจองได้ครั้งละ 1 คิว
            หากต้องการจองคิวถัดไป ให้กลับมาเลือกช่องว่างและกรอกเลขบัตรใหม่
          </p>

          <div
            v-if="errorMessage"
            class="mt-4 flex items-start gap-2.5 rounded-xl border border-[#F5C2C7] bg-[#FFF5F5] px-4 py-3 text-sm leading-6 text-[#B42318]"
            role="alert"
          >
            <i class="fa-solid fa-circle-exclamation mt-0.5"></i>
            <span>{{ errorMessage }}</span>
          </div>

          <div class="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              class="inline-flex items-center justify-center rounded-xl border border-[#C2D1E7] bg-white px-4 py-3 text-sm font-semibold text-[#475569] transition hover:bg-[#F8FBFF] disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="isLoading"
              @click="emit('close')"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              class="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2F59A8] px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(47,89,168,0.24)] transition hover:bg-[#204A8B] focus:outline-none focus:ring-4 focus:ring-[#2F59A8]/20 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="!canSubmit"
            >
              <i v-if="isLoading" class="fa-solid fa-circle-notch fa-spin"></i>
              <i v-else class="fa-solid fa-calendar-check"></i>
              {{ isLoading ? 'กำลังจอง...' : 'จองคิว' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>
