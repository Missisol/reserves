<script setup lang="ts">
const isOpen = defineModel()

function triggerDropdown() {
  isOpen.value = !isOpen.value
}
</script>

<template>
  <div class="transition-box">
    <button
      :class="[isOpen ? 'open' : '', 'transition-button']"
      @click="triggerDropdown"
    >
      <slot name="button"></slot>
    </button>
    <Transition
      name="dropdown"
    >
      <slot></slot>
    </Transition>
  </div>
</template>

<style>
.transition-button {
  background: transparent;
  border: none;
  color: var( --dropdown-color, var(--color-primary));
  font-family: inherit;
  display: inline-flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;

  &.open {
    margin-block-end: 1rem;
  }

  &::after {
    content: "";
    border: 6px solid transparent;
    border-top-color: currentColor;
    transform: translateY(50%);
  }

  &.open::after {
    border-top-color: transparent;
    border-bottom-color: currentColor;
    transform: translateY(-50%);
  }
}

.dropdown-enter-active, .dropdown-leave-active {
  transition: height .2s ease, opacity .2s ease;
}

.dropdown-enter-from, .dropdown-leave-to {
  height: 0;
  opacity: 0;
}
</style>