<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'
import LoginForm from './components/LoginForm.vue'
import Dashboard from './components/Dashboard.vue'
import type { ScheduleData } from './types'

const isLoggedIn = ref(false)
const welcomeMessage = ref('กรุณาเข้าสู่ระบบเพื่อดูข้อมูล')

function getTodayString() {
  return new Date().toISOString().split('T')[0]
}

const currentDate = ref(getTodayString())
const scheduleData = ref<ScheduleData | null>(null)
const windowWidth = ref(window.innerWidth)

function handleResize() {
  windowWidth.value = window.innerWidth
}

function handleLogin() {
  isLoggedIn.value = true
  welcomeMessage.value = 'ยินดีต้อนรับสู่ระบบตารางนัดหมาย'
}

function handleLogout() {
  sessionStorage.removeItem('isLoggedIn')
  isLoggedIn.value = false
  scheduleData.value = null
  welcomeMessage.value = 'กรุณาเข้าสู่ระบบเพื่อดูข้อมูล'
}

function handleScheduleLoaded(data: ScheduleData) {
  scheduleData.value = data
}

onMounted(() => {
  if (sessionStorage.getItem('isLoggedIn') === 'true') {
    isLoggedIn.value = true
    welcomeMessage.value = 'ยินดีต้อนรับสู่ระบบตารางนัดหมาย'
  }
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <div class="min-h-screen bg-[#EBF2FD] py-5 px-5 flex justify-center items-start">
    <div class="w-full max-w-[1400px] bg-white rounded-xl shadow-[0_8px_25px_rgba(0,0,0,0.1)] overflow-hidden">
      <AppHeader :welcome-message="welcomeMessage" />
      <main class="p-6">
        <LoginForm v-if="!isLoggedIn" @login="handleLogin" />
        <Dashboard
          v-else
          :current-date="currentDate"
          :window-width="windowWidth"
          @logout="handleLogout"
          @schedule-loaded="handleScheduleLoaded"
        />
      </main>
      <AppFooter />
    </div>
  </div>
</template>
