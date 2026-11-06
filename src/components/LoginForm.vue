<script setup lang="ts">
import { computed, ref } from 'vue'
import { loginWithUsername } from '../services/auth'
import type { UserProfile } from '../types'

const emit = defineEmits<{
  (e: 'login', profile: UserProfile): void
}>()

const username = ref('')
const password = ref('')
const showPassword = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')

const canSubmit = computed(
  () => username.value.trim().length > 0 && password.value.length > 0,
)

function clearError() {
  if (errorMessage.value) errorMessage.value = ''
}

async function handleSubmit() {
  if (!canSubmit.value || isLoading.value) return

  isLoading.value = true
  errorMessage.value = ''

  try {
    const profile = await loginWithUsername(username.value, password.value)
    emit('login', profile)
  } catch (err: unknown) {
    errorMessage.value =
      err instanceof Error ? err.message : 'เกิดข้อผิดพลาดที่ไม่คาดคิด'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="mx-auto my-6 w-full max-w-md">
    <div
      class="overflow-hidden rounded-2xl border border-[#AABBDD]/70 bg-white shadow-[0_20px_60px_rgba(32,74,139,0.14)]"
    >
      <!-- Subtle brand accent -->
      <div class="h-1.5 bg-gradient-to-r from-[#2F59A8] via-[#2F59A8] to-[#00796B]"></div>

      <div class="p-7 sm:p-9">
        <!-- Brand and heading -->
        <div class="text-center">
          <div
            class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2F59A8] to-[#204A8B] text-white shadow-[0_10px_24px_rgba(47,89,168,0.28)]"
          >
            <i class="fa-solid fa-calendar-days text-2xl"></i>
          </div>

          <p
            class="mt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#2F59A8]"
          >
            TTMSABOT · กลุ่มงานแพทย์แผนไทย
          </p>
          <h1 class="mt-2 text-2xl font-bold text-[#212121]">เข้าสู่ระบบ</h1>
          <p class="mt-1.5 text-sm leading-6 text-[#5C6F8A]">
            ระบบตารางปฏิบัติงาน · กรอกชื่อผู้ใช้และรหัสผ่านเพื่อเข้าใช้งาน
          </p>
        </div>

        <form class="mt-7 space-y-5" @submit.prevent="handleSubmit">
          <div>
            <label
              for="username"
              class="mb-2 block text-sm font-semibold text-[#212121]"
            >
              ชื่อผู้ใช้
            </label>
            <div class="relative">
              <i
                class="fa-solid fa-user pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#7B8FAE]"
              ></i>
              <input
                id="username"
                v-model="username"
                type="text"
                required
                autofocus
                autocomplete="username"
                autocapitalize="none"
                spellcheck="false"
                placeholder="กรอกชื่อผู้ใช้"
                class="w-full rounded-xl border border-[#C2D1E7] bg-[#F8FBFF] py-3.5 pl-11 pr-4 text-[1rem] text-[#212121] outline-none transition duration-200 placeholder:text-[#9AAABF] focus:border-[#2F59A8] focus:bg-white focus:ring-4 focus:ring-[#2F59A8]/15"
                @input="clearError"
              />
            </div>
          </div>

          <div>
            <label
              for="password"
              class="mb-2 block text-sm font-semibold text-[#212121]"
            >
              รหัสผ่าน
            </label>
            <div class="relative">
              <i
                class="fa-solid fa-lock pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#7B8FAE]"
              ></i>
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                required
                autocomplete="current-password"
                placeholder="กรอกรหัสผ่าน"
                class="w-full rounded-xl border border-[#C2D1E7] bg-[#F8FBFF] py-3.5 pl-11 pr-12 text-[1rem] text-[#212121] outline-none transition duration-200 placeholder:text-[#9AAABF] focus:border-[#2F59A8] focus:bg-white focus:ring-4 focus:ring-[#2F59A8]/15"
                @input="clearError"
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-[#7B8FAE] transition hover:bg-[#EBF2FD] hover:text-[#2F59A8] focus:outline-none focus:ring-2 focus:ring-[#2F59A8]/20"
                :aria-label="showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'"
                :aria-pressed="showPassword"
                @click="showPassword = !showPassword"
              >
                <i
                  :class="showPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"
                ></i>
              </button>
            </div>
          </div>

          <div
            v-if="errorMessage"
            class="flex items-start gap-2.5 rounded-xl border border-[#F5C2C7] bg-[#FFF5F5] px-4 py-3 text-sm leading-6 text-[#B42318]"
            role="alert"
          >
            <i class="fa-solid fa-circle-exclamation mt-0.5"></i>
            <span>{{ errorMessage }}</span>
          </div>

          <button
            type="submit"
            :disabled="isLoading || !canSubmit"
            class="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2F59A8] px-5 py-3.5 text-[1rem] font-semibold text-white shadow-[0_8px_20px_rgba(47,89,168,0.24)] transition duration-200 hover:bg-[#204A8B] hover:shadow-[0_10px_24px_rgba(32,74,139,0.3)] focus:outline-none focus:ring-4 focus:ring-[#2F59A8]/20 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
          >
            <i v-if="isLoading" class="fa-solid fa-circle-notch fa-spin"></i>
            <i v-else class="fa-solid fa-arrow-right-to-bracket"></i>
            {{ isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ' }}
          </button>

          <p class="text-center text-xs leading-6 text-[#7B8FAE]">
            หากยังไม่มีสิทธิ์เข้าใช้งาน กรุณาติดต่อผู้ดูแลระบบ
          </p>
        </form>
      </div>
    </div>
  </div>
</template>
