 <style lang="scss">
.base-card-title {
  position: relative;
  top: -16px;
  padding-left: 16px;
  padding-top: 16px;
  display: flex;
  align-items: center;
  font-size: 24px;
  font-weight: 600;

  .title_icon {
    margin-right: 16px;
    width: 48px;
    height: 48px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 26px;
    border-radius: 17px;
    font-family: AppleColorEmoji,emoji, sans-serif;
  }
}
</style>

<template>
  <div class="base-card-title" :style="gradient ? `background: linear-gradient(360deg, rgba(255, 255, 255, 0) 0%, ${iconColor} 100%);` : ''">
    <div v-if="icon" class="title_icon" :style="`background-color: ${iconColor};`">{{icon}}</div>
    <slot />
  </div>
</template>

<script>

export default {
  name: 'BaseCardTitle',
  components: {},
  props: {
    icon: {
      type: String,
      default: '',
    },
    iconColor: {
      type: String,
      default: '',
    },
    gradient: Boolean
  }
}
</script>
