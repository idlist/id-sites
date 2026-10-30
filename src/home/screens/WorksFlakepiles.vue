<script setup lang="ts">
import ExternalLink from '@home/components/ExternalLink.vue'
import PageWorks from '@home/components/PageWorks.vue'
import WorksBadge from '@home/components/WorksBadge.vue'
import { useI18nComponent } from '@home/locales/i18n'
import { m } from 'virtual:i18n'

const {
  obsCommunityPage,
  githubRepo,
} = m // Workaround for https://github.com/vuejs/language-tools/issues/6322

const DescFlakepilesShort = useI18nComponent('DescFlakepilesShort')
</script>

<template>
  <PageWorks>
    <div class="works-flakepiles">
      <div class="works-content">
        <h2 class="title">Flakepiles</h2>

        <div class="badges">
          <WorksBadge color="#6bb5ff">
            {{ m.webFrontend() }}
          </WorksBadge>
          <WorksBadge color="#b690fd">
            {{ m.obsPlugin() }}
          </WorksBadge>
        </div>

        <div class="id-typeface">
          <DescFlakepilesShort />
        </div>

        <div class="links">
          <ExternalLink href="https://community.obsidian.md/plugins/flakepiles">
            {{ obsCommunityPage() }}
          </ExternalLink>
          <ExternalLink href="https://github.com/idlist/flakepiles">
            {{ githubRepo() }}
          </ExternalLink>
        </div>
      </div>
    </div>
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

  @media (max-width: 640px) {
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
</style>
