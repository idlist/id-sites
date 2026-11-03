<script setup lang="ts">
import LinkExternal from '@home/components/LinkExternal.vue'
import WorksOtherItem from '@home/components/WorksOtherItem.vue'
import { m } from 'virtual:i18n'
</script>

<template>
  <section class="works-others">
    <div class="content">
      <h2 class="id-section-title">{{ m.sectionWorksOther() }}</h2>

      <div>
        <WorksOtherItem>
          <template #name>npm-san-check</template>

          <p v-html="m.nscDesc()"></p>

          <template #links>
            <LinkExternal href="https://www.npmjs.com/package/npm-san-check">
              {{ m.npmPackagePage() }}
            </LinkExternal>
            <LinkExternal href="https://github.com/idlist/npm-san-check">
              {{ m.githubRepo() }}
            </LinkExternal>
          </template>
        </WorksOtherItem>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.works-others {
  display: flex;
  align-items: center;
  justify-content: center;

  min-height: max(75vh, 400px);
  min-height: max(75svh, 400px);
  padding: 6rem 0;

  position: relative;

  > .content {
    display: grid;
    grid-template-columns: auto;
    justify-items: center;
    row-gap: 1rem;

    max-width: 800px;
    padding: 0 1rem;
  }
}
</style>
