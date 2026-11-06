<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'
import LoginForm from './components/LoginForm.vue'
import Dashboard from './components/Dashboard.vue'
import { getSessionProfile, signOut } from './services/auth'
import type { ScheduleData, UserProfile } from './types'

const isInitializing = ref(true)
const isLoggedIn = ref(false)
const currentUser = ref<UserProfile | null>(null)

const welcomeMessage = computed(() =>
  currentUser.value
    ? `ยินดีต้อนรับ, ${currentUser.value.full_name}`
    : 'กรุณาเข้าสู่ระบบเพื่อดูข้อมูล',
)

function getTodayString() {
  return new Date().toISOString().split('T')[0]
}

const currentDate = ref(getTodayString())
const scheduleData = ref<ScheduleData | null>(null)
const windowWidth = ref(window.innerWidth)

function handleResize() {
  windowWidth.value = window.innerWidth
}

function handleLogin(profile: UserProfile) {
  currentUser.value = profile
  isLoggedIn.value = true
}

async function handleLogout() {
  try {
    await signOut()
  } catch (err) {
    console.error('Cannot sign out:', err)
  } finally {
    currentUser.value = null
    isLoggedIn.value = false
    scheduleData.value = null
  }
}

function handleScheduleLoaded(data: ScheduleData) {
  scheduleData.value = data
}

onMounted(async () => {
  window.addEventListener('resize', handleResize)

  try {
    const profile = await getSessionProfile()

    if (profile?.can_access_workschedule) {
      currentUser.value = profile
      isLoggedIn.value = true
    } else if (profile) {
      // A valid Supabase session exists, but access was revoked.
      await signOut().catch(() => undefined)
    }
  } catch (err) {
    console.error('Cannot restore session:', err)
    await signOut().catch(() => undefined)
  } finally {
    isInitializing.value = false
  }
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
        <div v-if="isInitializing" class="text-center py-16 text-[#2F59A8]">
          <i class="fas fa-spinner fa-spin text-5xl block mb-3"></i>
          <p class="text-base mt-3">กำลังตรวจสอบสิทธิ์...</p>
        </div>
        <LoginForm v-else-if="!isLoggedIn" @login="handleLogin" />
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
