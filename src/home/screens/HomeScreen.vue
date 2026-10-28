<script setup lang="ts">
import IconIdlist from '@assets/idlist-light.svg?component'
import HomeContact from '@home/components/HomeContact.vue'
import HomeTitleCarousel from '@home/components/HomeTitleCarousel.vue'
import PageFull from '@home/components/PageFull.vue'
import { contactsLocaled } from '@home/data/contacts'
import HomePulses from '@home/motions/HomePulses.vue'
import HomeWaves from '@home/motions/HomeWaves.vue'
</script>

<template>
  <PageFull class="home-screen">
    <div class="waves">
      <div class="waves-canvas">
        <HomeWaves />
      </div>
    </div>

    <div class="pulse">
      <div class="pulse-canvas">
        <HomePulses />
      </div>
    </div>

    <div class="main">
      <div class="first-row">
        <div class="home-icon">
          <IconIdlist />
        </div>

        <HomeTitleCarousel />
      </div>

      <div class="home-divider">
        <svg width="100%" height="4" class="line">
          <line x1="0" y1="50%" x2="100%" y2="50%" stroke-dasharray="12 16" />
        </svg>
      </div>

      <div class="home-contacts">
        <HomeContact v-for="contact of contactsLocaled" :contact="contact" />
      </div>
    </div>
  </PageFull>
</template>

<style scoped lang="scss">
.home-screen {
  position: relative;
  user-select: none;

  > .main {
    position: absolute;
    bottom: 2rem;
    left: 2rem;
    right: 2rem;
  }

  @media (max-width: 768px) {
    & > .main {
      bottom: 1rem;
      left: 1rem;
      right: 1rem;
    }
  }

  > .waves {
    position: absolute;
    z-index: -2;

    bottom: -100px;
    left: 0;

    max-width: 100%;
    overflow: hidden;
  }

  > .pulse {
    position: absolute;
    z-index: -1;

    top: 0;
    right: 0;

    max-width: 100%;
    overflow: hidden;
  }
}

.waves-canvas {
  width: 800px;
}

.pulse-canvas {
  width: 400px;
}

.first-row {
  display: grid;
  grid-template-columns: max-content max-content;
  column-gap: 1rem;
  row-gap: 0.75rem;
  align-items: end;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    justify-items: start;
  }
}

.home-icon {
  height: 4rem;

  > svg {
    width: auto;
  }
}

.home-divider {
  width: 100%;
  max-width: 768px;
  margin: 0.5rem 0;

  > .line {
    overflow: visible;

    stroke: currentColor;
    stroke-linecap: round;
    stroke-width: 2px;
  }
}

.home-contacts {
  display: flex;
  column-gap: 0.75rem;
  row-gap: 0.5rem;
  flex-wrap: wrap;
}
</style>
