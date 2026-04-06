<script setup lang="ts">
import { ref } from 'vue'
import Swal from 'sweetalert2'
import { getLoginPassword } from '../services/supabase'

const emit = defineEmits<{
  (e: 'login'): void
}>()

const password = ref('')
const isLoading = ref(false)

async function handleSubmit() {
  if (!password.value) return
  isLoading.value = true
  Swal.fire({ title: 'กำลังตรวจสอบ...', allowOutsideClick: false, didOpen: () => Swal.showLoading() })
  try {
    const correctPassword = await getLoginPassword()
    if (correctPassword === null) {
      Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถดึงข้อมูลรหัสผ่านได้', 'error')
      return
    }
    if (password.value === correctPassword) {
      Swal.close()
      sessionStorage.setItem('isLoggedIn', 'true')
      emit('login')
    } else {
      Swal.fire('ล็อกอินล้มเหลว', 'รหัสผ่านไม่ถูกต้อง', 'error')
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดที่ไม่คาดคิด'
    Swal.fire('เกิดข้อผิดพลาด', message, 'error')
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="max-w-md mx-auto my-8 p-10 border border-[#AABBDD] rounded-lg bg-[#F7FBFF] shadow-md">
    <h2 class="text-[1.8rem] font-semibold text-[#2F59A8] mt-0 mb-7 flex items-center gap-4">
      <i class="fa-solid fa-right-to-bracket"></i> เข้าสู่ระบบ
    </h2>
    <form @submit.prevent="handleSubmit">
      <div class="mb-7">
        <label for="password" class="block mb-2 font-semibold text-[#212121] text-[1.05rem]">รหัสผ่าน</label>
        <input
          id="password"
          v-model="password"
          type="password"
          required
          class="w-full px-4 py-3.5 border border-[#AABBDD] rounded-lg text-[1.05rem] font-[Prompt] transition-all duration-200 focus:outline-none focus:border-[#2F59A8] focus:shadow-[0_0_0_4px_rgba(47,89,168,0.2)]"
        />
      </div>
      <div class="flex justify-end gap-5 mt-6">
        <button
          type="submit"
          :disabled="isLoading"
          class="px-6 py-3 border-none rounded-md cursor-pointer font-[Prompt] text-[1.05rem] font-medium transition-all duration-200 bg-[#2F59A8] text-white hover:bg-[#204A8B] hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
        >
          เข้าสู่ระบบ
        </button>
      </div>
    </form>
  </div>
</template>
