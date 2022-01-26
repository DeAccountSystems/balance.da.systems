<template>
  <div class="text-input">
    <div class="text-input__container">
      <input
        v-bind="$attrs"
        :value="value"
        class="text-input__input"
        :class="{
          'text-input__input_error': !!errorMessages[0],
          'text-input__input__suffix': !!suffix
        }"
        :type="type"
        v-on="listeners"/>
      <span class="text-input__suffix">{{ suffix }}</span>
    </div>
    <div
      v-if="errorMessages[0]"
      class="text-input__error-messages">
      {{ errorMessages[0] }}
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'

export default Vue.extend({
  name: 'TextInput',
  inheritAttrs: false,
  model: {
    prop: 'value',
    event: 'input'
  },
  props: {
    value: {
      type: [String, Number],
      default: ''
    },
    type: {
      type: String,
      default: 'text'
    },
    suffix: {
      type: String,
      default: ''
    },
    errorMessages: {
      type: Array as PropType<string[]>,
      default: () => ([])
    }
  },
  computed: {
    listeners (): object {
      const _vm = this
      return {
        ...this.$listeners,
        input (event: Event) {
          _vm.$emit('input', (event.target as HTMLInputElement).value)
        }
      }
    }
  }
})
</script>

<style lang="scss">
@import 'src/assets/variables';

.text-input {
  display: flex;
  flex-direction: column;
}

.text-input__container {
  display: flex;
  position: relative;
}

.text-input__suffix {
  display: inline-block;
  position: absolute;
  right: 24px;
  top: 19px;
}

.text-input__input {
  flex: 1;
  height: 34px;
  padding: 10px 24px 10px 24px;
  border-radius: 12px;
  border: 1px solid $normal-color;
  background: $normal-color;
  color: $primary-font-color;
  caret-color: $focus-color;
  outline: none;
  font-size: 16px;
  line-height: 20px;
  -webkit-appearance: none;

  &:hover {
    border: 1px solid $focus-color;
    background: $white;
    box-shadow: inset 0 0 0 4px rgba(45, 100, 246, 0.1);
  }

  &::placeholder {
    color: #808191;
    font-weight: 400;
  }
}

.text-input__input__suffix {
  padding-right: 72px;
}

.text-input__input_error {
  border: 1px solid $error-color;
  background: $white;
  box-shadow: inset 0 0 0 4px rgba(223, 75, 70, 0.1);

  &:hover {
    border: 1px solid $error-color;
    box-shadow: inset 0 0 0 4px rgba(223, 75, 70, 0.1);
  }
}

.text-input__error-messages {
  margin-top: 4px;
  font-size: 12px;
  font-weight: 600;
  color: $error-font-color;
  line-height: 14px;
  text-align: left;
}
</style>
