<script setup lang="ts">
import ImageFlakepilesLandscape from '@assets/images/flakepiles-landscape.webp?url'
import ImageFlakepilesPortrait from '@assets/images/flakepiles-portrait.webp?url'
import LinkExternal from '@home/components/LinkExternal.vue'
import PageWorks from '@home/components/PageWorks.vue'
import WorksBadge from '@home/components/WorksBadge.vue'
import { useI18nComponent } from '@home/locales/i18n'
import { useResizeObserver } from '@vueuse/core'
import { m } from 'virtual:i18n'
import { computed, ref, useTemplateRef } from 'vue'

const {
  obsCommunityPage,
  githubRepo,
} = m // Workaround for https://github.com/vuejs/language-tools/issues/6322

const showFullDesc = ref(false)
const $content = useTemplateRef('$content')
const FullDescThreshold = 240000

useResizeObserver($content, () => {
  if ($content.value == null) return

  const { scrollWidth: w, scrollHeight: h } = $content.value
  if (w * h > FullDescThreshold) showFullDesc.value = true
  else showFullDesc.value = false
})

const DescFlakepilesBrief = useI18nComponent('DescFlakepilesBrief')
const DescFlakepilesFull = useI18nComponent('DescFlakepilesFull')
const DescFlakepiles = computed(() => {
  return showFullDesc.value ? DescFlakepilesFull.value : DescFlakepilesBrief.value
})
</script>

<template>
  <PageWorks>
    <div class="works-flakepiles" ref="$content">
      <div class="works-content">
        <h2 class="title">Flakepiles</h2>

        <div class="badges">
          <WorksBadge color="#6bb5ff">
            {{ m.webTechStack() }}
          </WorksBadge>
          <WorksBadge color="#b690fd">
            {{ m.obsPlugin() }}
          </WorksBadge>
        </div>

        <div class="id-typeface">
          <DescFlakepiles />
        </div>

        <div class="links">
          <LinkExternal href="https://community.obsidian.md/plugins/flakepiles">
            {{ obsCommunityPage() }}
          </LinkExternal>
          <LinkExternal href="https://github.com/idlist/flakepiles">
            {{ githubRepo() }}
          </LinkExternal>
        </div>
      </div>
    </div>

    <template #image-landscape>
      <div class="image-landscape">
        <img
          :src="ImageFlakepilesLandscape"
          alt="Flakepiles preview image in landscape layout"
        />
      </div>
    </template>

    <template #image-portrait>
      <div class="image-portrait">
        <img
          :src="ImageFlakepilesPortrait"
          alt="Flakepiles preview image in portrait layout"
        />
      </div>
    </template>
  </PageWorks>
</template>

<style scoped lang="scss">
.works-flakepiles {
  width: 100%;
  height: 100%;

  display: flex;
  align-items: center;
  justify-content: start;
  background-color: var(--color-main-deep);

  padding: 1rem;
  border-radius: 0.5rem 0 0 0.5rem;

  @media (max-aspect-ratio: 3/4) {
    border-radius: 0.5rem 0.5rem 0 0;
  }

  @media (max-width: 600px) {
    padding: 0.5rem;
  }
}

.works-content {
  > .title {
    font-family: var(--font-unique);
    font-weight: normal;
    font-size: 2rem;
    letter-spacing: 0.1rem;

    @media (max-width: 768px) {
      font-size: 1.5rem;
      letter-spacing: 0.075rem;
    }
  }

  > .badges {
    display: flex;
    column-gap: 0.75rem;
    row-gap: 0.25rem;

    margin-bottom: 0.75rem;
  }

  > .links {
    display: flex;
    flex-wrap: wrap;
    column-gap: 0.75rem;

    font-size: 0.875rem;
  }
}

.image-landscape {
  overflow: hidden;
  border-radius: 0 0.5rem 0.5rem 0;

  > img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: 5% center;
  }
}

.image-portrait {
  overflow: hidden;
  border-radius: 0 0 0.5rem 0.5rem;

  > img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: left top;
  }
}
</style>
