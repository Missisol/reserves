<script setup lang="ts">
const { error } = defineProps<{
  error?: string
}>()
</script>

<template>
  <div>
    
    <p>{{ error }}</p>
  </div>
</template>

<style scoped></style>