<style lang="scss">
@import "src/assets/variables";

a.base-list-item:hover {
  background-color: #EFF2F5;
}

.base-list-item {
  display: block;
  padding-left: 16px;
  padding-right: 16px;
  color: #11142D;

  &:active {
    background-color: #EFF2F5;
  }

  &:hover {
    background-color: #EFF2F5;
  }

  .item_content {
    display: flex;
    align-items: center;
    padding-top: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid $divider-color;

    &._plain {
      border-bottom: none;
    }
  }

  .item_head {
    margin-right: 15px;
  }

  .item_main {
    flex: 1;
  }

  .item_tail {
    text-align: right;
  }
}
</style>

<template>
  <!--todo: we can use render function to simplify code-->
  <nuxt-link v-if="to" class="base-list-item" :to="to">
    <div class="item_content" :class="{ _plain: plain }">
      <div v-if="$slots.head" class="item_head">
        <slot name="head" />
      </div>

      <div class="item_main">
        <slot />
      </div>

      <div class="item_tail">
        <slot name="tail" />
      </div>
    </div>
  </nuxt-link>
  <div v-else class="base-list-item">
    <div class="item_content" :class="{ _plain: plain }">
      <div v-if="$slots.head" class="item_head">
        <slot name="head" />
      </div>

      <div class="item_main">
        <slot />
      </div>

      <div class="item_tail">
        <slot name="tail" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BaseListItem',
  components: {},
  props: {
    to: {
      type: String,
      default: null,
    },
    // hide the bottom line
    plain: Boolean,
  }
  // render (h, context) {
  //   return h('div', {
  //     staticClass: 'base-list-item'
  //   }, [
  //     h('div', {
  //       staticClass: 'item_content',
  //     }, [
  //       h('div', {
  //         staticClass: 'item_head',
  //       }, context),
  //       h('div', {
  //         staticClass: 'item_main'
  //       }),
  //       h('div', {
  //         staticClass: 'item_tail'
  //       }),
  //     ])
  //   ])
  // }
}
</script>
