<script setup lang="ts">
import { locale, m } from 'virtual:i18n'

const toNotes = () => {
  switch (locale.value) {
    case 'zh-Hans':
      window.location.href = '/notes/zh'
      break
    default:
      window.location.href = '/notes/en'
  }
}

const toggleLocale = () => {
  locale.value = locale.value === 'en' ? 'zh-Hans' : 'en'
}
</script>

<template>
  <div class="nav-overlay">
    <div class="notes-entry" @click="toNotes">
      <div class="inner">
        <div class="redirect-prompt">
          <span class="to">{{ m.notesTo() }}</span>
          <span class="notes">NOTES</span>
        </div>
      </div>
    </div>

    <div class="lang-switch" @click="toggleLocale">
      <div>S</div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.nav-overlay {
  z-index: 16;
  pointer-events: none;
}

.notes-entry {
  position: fixed;
  width: calc(10rem + 4px);
  height: calc(10rem + 4px);
  top: -2rem;
  right: -2rem;

  border: var(--color-sub) 4px solid;
  border-radius: 50%;
  padding: 4px;
  background-color: transparent;

  cursor: pointer;
  pointer-events: all;
  user-select: none;

  >.inner {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: var(--color-sub);
    color: var(--color-main);

    display: flex;
    justify-content: center;
    align-items: center;
  }
}

.redirect-prompt {
  transform: translateX(-6px) translateY(8px);

  >.to {
    position: absolute;
    left: 0;
    right: 0;
    bottom: calc(1rem + 4px);
    text-align: center;
    font-size: 0.8rem;
    letter-spacing: 2px;
  }

  >.notes {
    letter-spacing: 1px;
  }
}

.lang-switch {
  pointer-events: all;

  position: fixed;
  top: 8.75rem;
  right: 0.5rem;
  width: 3rem;
  height: 3rem;
  color: var(--color-main);
  background-color: var(--color-sub);
  border-radius: 50%;

  display: flex;
  justify-content: center;
  align-items: center;

  cursor: pointer;
  user-select: none;
}
</style>
