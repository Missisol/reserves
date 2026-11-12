<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, useTemplateRef } from 'vue'
import type { Component } from 'vue'

import IconSun from '../icons/IconSun.vue'
import IconMoon from '../icons/IconMoon.vue'
import IconSystem from '../icons/IconSystem.vue'
import IconSprout from '../icons/IconSprout.vue'
import { themes } from '@/utils/commonData'
import type { ThemeValue } from '@/@types/common'

const isMenuOpen = ref<boolean>(false)
const theme = ref<ThemeValue>('light dark')
const switcherRef = useTemplateRef<HTMLElement>('switcher')

const iconComponent: Record<ThemeValue, Component> = {
  light: IconSun,
  dark: IconMoon,
  'light dark': IconSystem,
}

function applyTheme(value: ThemeValue): void {
  const colorScheme = document.querySelector<HTMLMetaElement>('meta[name="color-scheme"]')
  if (colorScheme) {
    colorScheme.content = value
  }
}

function setTheme(value: ThemeValue): void {
  theme.value = value
  localStorage.setItem('theme', value)
  applyTheme(value)
  isMenuOpen.value = false
}

function toggleMenu(): void {
  isMenuOpen.value = !isMenuOpen.value
}

function onClickOutside(e: Event): void {
  const el = switcherRef.value
  if (!el) return
  const target = e.target as Node | null
  if (isMenuOpen.value && target && !el.contains(target)) {
    isMenuOpen.value = false
  }
}

onMounted(() => {
  const saved = localStorage.getItem('theme')
  if (!saved) {
    localStorage.setItem('theme', 'light dark')
    theme.value = 'light dark'
  } else {
    theme.value = saved as ThemeValue
  }

  applyTheme(theme.value)

  document.addEventListener('click', onClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onClickOutside)
})
</script>

<template>
  <div class="full full-header">
    <header class="container-inner header">
      <div class="header__container">
        <RouterLink
          to="/"
          class="logo__container router__link"
          aria-label="Logo"
        >
          <div class="logo">
            <IconSprout />
          </div>
          <span 
            class="logo__text"
          >Запасы</span>
        </RouterLink>
        <div class="header__right">
        <div
            class="theme-switcher"
            ref="switcher"
          >
            <button
              class="header__theme"
              @click="toggleMenu"
              :aria-label="theme"
              aria-haspopup="menu"
              :aria-expanded="isMenuOpen"
            >
              <component :is="iconComponent[theme]" />
            </button>
            <transition name="dropdown-fade">
              <div
                v-if="isMenuOpen"
                class="theme-menu"
                role="menu"
              >
                <button
                  v-for="item in themes"
                  :key="item.name"
                  class="theme-menu__item"
                  :class="[{ active: theme === item.value }]"
                  @click="setTheme(item.value)"
                  role="menuitem"
                >
                  <component :is="iconComponent[item.value]"/>
                  <span>{{ item.name }}</span>
                </button>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </header>
  </div>
</template>

<style scoped>
.full-header {
  position: sticky;
  top: 0px;
  backdrop-filter: blur(4px);
  border-bottom: 1px solid var(--color-border);
}

.header {
  padding-inline: 1rem;
  padding-block: 1rem;
}

.header__container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  width: 100%;
}

.logo__container {
  display: flex;
  gap: .5rem;
  text-decoration: none;
}

.logo {
  display: flex;
  gap: .5rem;
  justify-content: center;
  align-items: center;
  color: var(--color-accent);
  font-weight: bold;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.75rem;
  transition: var(--transition-smooth);
  box-shadow: var(--shadow-glow);
  color: var(--color-background);
  background: var(--gradient-primary);
}

.logo>svg {
  width: 2rem;
  height: 2rem;
  color: var(--color-background);
}

.logo__text {
  align-self: center;
  font-size: 1.25rem;
  font-weight: 700;
  text-wrap: nowrap;
  color: transparent;
  background-clip: text;
  background-image: linear-gradient(to right, var(--color-primary), var(--color-secondary));

  @media (width < 768px) {
    display: none;
  }
}

.header__right {
  display: flex;
  gap: 1rem;
  height: 40px;
}

.nav {
  display: flex;
  gap: .25rem;
  justify-content: center;
  /* align-items: center; */

  & a {
    color: var(--color-muted-foreground);
    font-weight: 500;
    text-decoration: inherit;
    padding: 0.5rem 1.5rem;
    border-radius: var(--radius);
    transition: var(--transition-smooth);
  }

  @media (hover: hover) and (pointer: fine) {
    & a:hover {
      color: var(--color-foreground);
      background: var(--color-muted);
    }
  }

  & a.router-link-exact-active:first-child {
    color: var(--color-primary);
    background-color: hsl(from var(--color-primary) h s l / 0.1);
  }

  & a.router-link-exact-active:last-child {
    color: var(--color-primary);
    background-color: hsl(from var(--color-primary) h s l / 0.1);
  }
}

.header__theme {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 2.5rem;
  height: 100%;
  font-size: 0.875rem;
  font-weight: 500;
  background: var(--color-background);
  border: 1px solid var(--color-input);
  border-radius: calc(var(--radius) - 2px);
  transition: var(--transition-smooth);
  color: var(--color-foreground);
}

.header__theme:hover {
  color: var(--accent-foreground);
  background: var(--color-primary);
}

.header__theme>svg {
  width: 16px;
  height: 16px;
}

.theme-switcher {
  position: relative;
}

.theme-menu {
  position: absolute;
  right: 0;
  margin-top: .5rem;
  min-width: max-content;
  background: var(--color-background);
  color: var(--color-foreground);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  overflow: hidden;
  z-index: 20;
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.theme-menu__item {
  display: flex;
  gap: .5rem;
  align-items: center;
  width: 100%;
  padding: .375rem 1rem;
  background: transparent;
  border: 0;
  transition: var(--transition-smooth);
}

.theme-menu__item:hover ,
.theme-menu__item.active {
  /* background:var(--color-accent); */
  color: var(--color-accent-foreground);
  background:var(--color-primary);
}

.theme-menu__item > svg {
  width: 16px;
  height: 16px;
}

/* dropdown animation */
.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: var(--transition-smooth);
}

.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.98);
}
</style>