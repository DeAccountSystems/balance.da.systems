<style lang="scss">
.base-card {
  margin: 16px 12px;
  padding-top: 16px;
  padding-bottom: 16px;
  border: 1px solid #EFF2F5;
  overflow: hidden;
  border-radius: 24px;
  box-shadow: 0px 27px 19px -27px rgba(99, 109, 133, 0.16);
  background: #FFFFFF;
}
</style>

<template>
  <div class="base-card" :style="`background-color: ${color}`">
    <slot />
  </div>
</template>

<script>

export default {
  name: 'BaseCard',
  components: {},
  props: {
    color: {
      type: String,
      default: ''
    }
  },
}
</script>
