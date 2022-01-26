<style lang="scss">
.base-list-header {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  margin: 0 16px;
  border-top: 1px solid #EFF2F5;
  border-bottom: 1px solid #EFF2F5;
  font-size: 16px;
  font-weight: 600;
  color: #11142D;
}
</style>

<template>
  <div class="base-list-header">
    <slot />
  </div>
</template>

<script>

export default {
  name: 'BaseListHeader',
  components: {},
}
</script>
