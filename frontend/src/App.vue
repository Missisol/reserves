<script setup lang="ts">
import CommonHeader from '@/components/common/CommonHeader.vue'
</script>

<template>
  <div class="container">
    <CommonHeader />
    <main class="main">
      <RouterView v-slot="{ Component, route }">
        <transition>
          <component 
            :is="Component"
            :key="route.path"
          />
        </transition>
      </RouterView>
    </main>
  </div>
</template>

<style scoped>
.main {
  padding-block: 2rem;

  @media (width < 768px) {
    padding-block: 1rem;
  }
}

.v-enter-active {
  transition: opacity .4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* .v-leave-active {
  transition: opacity 0.1s ;
} */

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>