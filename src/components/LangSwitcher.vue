<template>
  <div>
    <template v-if="button">
      <Button
        v-for="option in LanguageOptions"
        v-show="computedLanguage.value !== option.value"
        :key="option.value"
        solid
        :block="block"
        @click="switchLanguage(option)"
      >
        <Iconfont
          class="lang-switcher__icon"
          name="language"
          size="19"
          color="#11142D"
        />
        {{ option.text }}
      </Button>
    </template>
    <span v-else class="lang-switcher">
      <span
        v-for="option in LanguageOptions"
        v-show="computedLanguage.value !== option.value"
        :key="option.value"
        class="lang-switcher__item"
        @click="switchLanguage(option)"
      >
        <Iconfont
          class="lang-switcher__icon"
          name="language"
          size="19"
          color="#11142D"
        />
        {{ option.text }}
      </span>
    </span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api'
import { mapGetters } from 'vuex'
import { ILanguageOption, LanguageOptions } from '~/constant/language'
import { COMMON_KEYS } from '~/store/common'
import Iconfont from '~/components/icon/Iconfont.vue'

export default defineComponent({
  name: 'LangSwitcher',
  components: { Iconfont },
  props: {
    button: {
      type: Boolean,
      default: false
    },
    block: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      LanguageOptions
    }
  },
  computed: {
    ...mapGetters({
      computedLanguage: COMMON_KEYS.computedLanguage
    })
  },
  methods: {
    switchLanguage (option: ILanguageOption) {
      this.$store.commit(COMMON_KEYS.setLanguage, option)
      this.$i18n.locale = option.value
      window.localStorage.setItem('lang', option.value)
      window.location.reload()
    }
  }
})
</script>

<style lang="scss">
@import 'src/assets/variables';

.lang-switcher {
  display: flex;
  color: $primary-font-color;
  line-height: 19px;
  font-weight: 600;
  cursor: pointer;
}

.lang-switcher__item {
  padding: 10px 11px;
  display: inline-flex;
  align-items: center;

  &:hover {
    background: rgba(7, 58, 141, 0.08);
    border-radius: 8px;
  }
}

.lang-switcher__icon {
  margin-right: 4px;
}
</style>
