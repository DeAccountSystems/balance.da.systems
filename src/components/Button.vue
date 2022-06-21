<template>
  <button
    v-bind="$attrs"
    class="button"
    :class="{
      button__block: block,
      button__type__primary: primary,
      button__type__solid: solid,
      button__type__link: to || href,
      button__size__small: small,
      button__size__middle: middle,
      button__size__large: large
    }"
    :disabled="disabled || loading"
    v-on="$listeners"
  >
    <span
      v-if="loading"
      class="button__loading-icon"
      :class="{'button__loading-icon__margin-right-8': !!$slots.default}"
    >
      <Iconfont name="loading" color="#D5D5D5" />
    </span>
    <nuxt-link
      v-if="to"
      class="button__link"
      :to="to"
    >
      <slot />
    </nuxt-link>
    <a
      v-else-if="href"
      class="button__link"
      :href="href"
      :target="target"
    >
      <slot />
    </a>
    <slot v-else />
  </button>
</template>

<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api'
import Iconfont from '~/components/icon/Iconfont.vue'

export default defineComponent({
  name: 'Button',
  components: {
    Iconfont
  },
  inheritAttrs: false,
  props: {
    block: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    primary: {
      type: Boolean,
      default: false
    },
    solid: {
      type: Boolean,
      default: false
    },
    small: {
      type: Boolean,
      default: false
    },
    middle: {
      type: Boolean,
      default: false
    },
    large: {
      type: Boolean,
      default: false
    },
    to: {
      type: String,
      default: ''
    },
    href: {
      type: String,
      default: ''
    },
    target: {
      type: String,
      default: '_self'
    },
    disabled: Boolean,
  }
})
</script>

<style lang="scss">
@import 'src/assets/variables';

.button {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50px;
  padding: 0 14px;
  font-size: 14px;
  font-weight: 600;
  color: $primary-font-color;
  border-radius: 12px;
  outline: none;
  cursor: pointer;
  border: 1px solid #D2D9E1;
  box-shadow: none;
  background-color: $white;

  &:disabled {
    cursor: no-drop;
    color: rgba(0, 0, 0, 0.2);
    border: 1px solid #D2D9E1;
    box-shadow: none !important;
  }

  &:hover {
    box-shadow: 0 6px 6px 0 rgba(0, 0, 0, 0.04);
  }

  .button__link {
    padding: 17px 14px;
    color: unset;
  }
}

.button__block {
  width: 100%;
}

.button__type__primary {
  border: 0;
  color: $white;
  background-color: $primary-font-color;

  &:disabled {
    border: 0;
    cursor: no-drop;
    color: rgba(255, 255, 255, 0.6);
    background-color: #A0A1AB;
    box-shadow: none !important;
  }

  &:hover {
    box-shadow: 0 6px 6px 0 rgba(0, 0, 0, 0.2);
  }
}

.button__type__solid {
  padding: 0 12px;
  border: 2px solid #000000;

  &:disabled {
    cursor: no-drop;
    color: rgba(0, 0, 0, 0.2);
    border: 2px solid #D2D9E1;
    box-shadow: none !important;
  }

  &:hover {
    box-shadow: 0 6px 6px 0 rgba(0, 0, 0, 0.2);
  }
}

.button__type__link {
  padding: 0;
}

.button__size__small {
  height: 30px;
  border-radius: 8px;

  .button__link {
    padding: 7px 14px;
    color: unset;
  }
}

.button__size__middle {
  height: 38px;

  .button__link {
    padding: 11px 14px;
    color: unset;
  }
}

.button__size__large {
  height: 60px;
  font-size: 16px;
  border-radius: 16px;

  .button__link {
    padding: 21px 14px;
    color: unset;
  }
}

.button__loading-icon {
  svg {
    animation: rotate360DegAnimation 0.9s linear infinite;
  }
}

.button__loading-icon__margin-right-8 {
  margin-right: 8px;
}
</style>
