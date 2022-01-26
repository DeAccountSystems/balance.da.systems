<style lang="scss">
.base-list-pager {
  display: flex;
  justify-content: center;

  .pager_item {
    margin-left: 2px;
    margin-right: 2px;
    height: 40px;
    width: 40px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    border-radius: 12px;
    cursor: pointer;

    &:hover {
      background-color: #EFF2F5;
    }

    &._active {
      background-color: #E7EEF6;
    }

    &._disabled {
      background-color: transparent;
      color: #D2D9E1;
      cursor: not-allowed;
    }
  }
}
</style>

<template>
  <div class="base-list-pager">
    <span class="pager_item" :class="{ _disabled: current === 1 }" @click="onClickPrev">
      <Iconfont name="arrow-left" size="14" />
    </span>
    <template v-if="!noItems">
      <span v-for="i in pages" :key="i"
            class="pager_item" :class="{ _active: current === i}"
            @click="onClickPage(i)">
        {{ i }}
      </span>
    </template>
    <span class="pager_item" :class="{ _disabled: current >= pages }" @click="onClickNext">
      <Iconfont name="arrow-right" size="14" />
    </span>
  </div>
</template>

<script>
import Iconfont from '~/components/icon/Iconfont'
import { defineComponent } from '@nuxtjs/composition-api'

export default defineComponent({
  name: 'BaseListPager',
  components: {
    Iconfont
  },
  props: {
    pages: {
      type: Number,
      default: 0
    },
    current: {
      type: Number,
      default: 0,
    },
    noItems: {
      type: Boolean,
      default: false
    }
  },
  setup (props, { emit }) {
    function onClickPrev () {
      if (props.current > 1) {
        emit('change', props.current - 1)
      }
    }

    function onClickNext () {
      if (props.current < props.pages) {
        emit('change', props.current + 1)
      }
    }

    function onClickPage (i) {
      if (i !== props.current) {
        emit('change', i)
      }
    }

    return {
      onClickPrev,
      onClickNext,
      onClickPage,
    }
  }
})</script>
