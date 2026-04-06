<script setup lang="ts">
defineProps<{
  welcomeMessage: string
}>()
</script>

<template>
  <header class="bg-gradient-to-br from-[#2F59A8] to-[#204A8B] text-white px-8 py-6 text-center">
    <h1 class="m-0 font-bold text-3xl">
      <i class="fa-solid fa-calendar-days mr-3"></i>ตารางปฏิบัติงาน
    </h1>
    <p class="mt-1 opacity-95 text-base">{{ welcomeMessage }}</p>
  </header>
</template>
