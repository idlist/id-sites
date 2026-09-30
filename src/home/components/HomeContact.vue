<script setup lang="ts">
import type { ContactItem } from '@home/data/contacts'
import { toMessage } from 'virtual:i18n'
import BubbleRect16 from './BubbleRect16.vue'

defineProps<{
  contact: ContactItem
}>()
</script>

<template>
  <BubbleRect16>
    <a class="home-contact" :href="contact.link" target="_blank" noopener noreferer>
      <div class="platform">
        <div class="icon">
          <component :is="contact.icon" />
        </div>
        <p class="text">{{ toMessage(contact.platform) }}</p>
      </div>
      <p class="id">{{ contact.id }}</p>
    </a>
  </BubbleRect16>
</template>

<style scoped lang="scss">
.home-contact {
  background-color: var(--color-main);

  display: flex;
  align-items: stretch;
  height: 100%;
  text-decoration: none;

  > .platform {
    display: flex;
    align-items: center;
    padding: 0 0.125rem;
    color: var(--color-sub);
  }

  > .platform > .icon {
    width: 1.5rem;
    height: 1.5rem;
    padding: 0.125rem;
  }

  > .platform > .text {
    padding: 0 0.125rem;
  }

  > .id {
    display: flex;
    align-items: center;
    height: 100%;

    color: var(--color-main);
    background-color: var(--color-sub);

    border-radius: 8px 16px 16px 8px;
    padding: 0 0.5rem 0 0.25rem;
    height: 100%;

    transition: background-color 0.25s ease;
  }

  &:hover > .id {
    background-color: var(--color-sub-2);
  }
}
</style>
