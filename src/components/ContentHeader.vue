<template>
  <div class="content-header">
    <span class="content-header__title">{{ title }}</span>
    <span
      v-if="closeButton"
      class="content-header__close"
      @click="onClose"
    >
      <Iconfont
        name="close-fill"
        size="18"
        color="#A0A1AB" />
    </span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api'
import Iconfont from '~/components/icon/Iconfont.vue'

export default defineComponent({
  name: 'ContentHeader',
  components: {
    Iconfont
  },
  props: {
    title: {
      type: String,
      required: true
    },
    closeButton: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    onClose () {
      this.$emit('close', false)
    }
  }
})
</script>

<style lang="scss">
@import 'src/assets/variables';

.content-header {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 16px 20px 24px;
}

.content-header__title {
  width: 84%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: $font-size-24;
  font-weight: 700;
  color: $primary-font-color;
  text-align: left;
}

.content-header__close {
  position: absolute;
  right: 12px;
  top: 15px;
  border-radius: 50%;
  padding: 9px;
  cursor: pointer;

  &:hover {
    background: $normal-color;
  }
}
</style>
