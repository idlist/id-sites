<template>
  <section class="home-whoami">
    <div class="content">
      <h2 class="id-section-title">WHO IS THIS GUY?</h2>
      <div class="id-typeface">
        <p>A random guy on the Internet who happens to have nearly all sort of skills</p>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.home-whoami {
  display: flex;
  align-items: center;
  justify-content: center;

  min-height: max(400px, 80vh);
  min-height: max(400px, 80svh);
  padding: 2rem 0;

  > .content {
    max-width: 800px;
  }
}
</style>
