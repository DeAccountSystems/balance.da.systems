<template>
  <div
    class="account-input"
    @click.stop.prevent
  >
    <input
      v-model.trim="value"
      v-bind="$attrs"
      class="account-input__input"
      :class="{
        'account-input__input_error': !!addressErrors[0] || !!errorMessages[0],
        'account-input__input__is-account': isDasAccount,
        'account-input__input__account': currentChainParsingRecords.length > 0 && toAddress
      }"
      :type="type"
      v-on="listeners"
      @focus="onFocus"
    >
    <span
      v-if="loading"
      class="account-input__account"
    >
      <span class="account-input__parsing-records__loading-icon">
        <Iconfont name="loading" color="#D5D5D5" />
      </span>
    </span>
    <span
      v-else-if="currentChainParsingRecords.length > 0"
      class="account-input__account"
      @click="switchParsingRecords"
    >
      <span :class="toAddress ? 'account-input__account__container__to-address' : 'account-input__account__container'">
        <span
          v-if="toAddress"
          class="account-input__account__to-address"
        >
          {{ collapseString(toAddress, 3, 3) }}
        </span>
        <DasAvatar :account="value" size="22" />
      </span>
    </span>
    <div
      v-if="showParsingRecords"
      class="account-input__parsing-records"
      :class="{ 'account-input__parsing-records_top': top }"
    >
      <img
        class="account-input__parsing-records__arrow-icon"
        :class="{ 'account-input__parsing-records__arrow-icon_top': top }"
        src="/images/components/account-input-arrow.svg"
        alt="arrow"
      >
      <div class="account-input__parsing-records__label">
        {{ currentChainParsingRecords.length > 1 ? $tt('Multiple results exist, please select') : $tt('Results') }}
      </div>
      <ul class="account-input__parsing-records__list">
        <li
          v-for="(record, index) in currentChainParsingRecords"
          :key="`address${index}`"
          class="account-input__parsing-records__item"
          @click="selectAddress(record)"
        >
          <span
            class="account-input__parsing-records__margin-right-8"
            :class="{ 'account-input__parsing-records__width-24': !!toAddress }"
          >
            <Iconfont
              v-if="toAddress.toUpperCase() === record.value.toUpperCase()"
              name="check"
              color="#22C493"
            />
          </span>
          <div>
            <div class="account-input__parsing-records__address">
              {{ record.value }}
            </div>
            <span
              v-if="record.label"
              class="account-input__parsing-records__tag"
            >
              {{ record.label }}
            </span>
          </div>
        </li>
      </ul>
    </div>
    <div
      v-if="addressErrors[0]"
      class="account-input__error-messages"
    >
      {{ addressErrors[0] }}
    </div>
    <div
      v-else-if="errorMessages[0]"
      class="account-input__error-messages"
    >
      {{ errorMessages[0] }}
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { validate } from 'vee-validate'
import { ValidationResult } from 'vee-validate/dist/types/types'
import { IAccountParsingRecord } from '~/services/Account'
import { BSC, IMainChain, Polygon } from '~/constant/chain'
import Iconfont from '~/components/icon/Iconfont.vue'
import { collapseString, toDottedStyle } from '~/modules/tools'
import { DasAvatar } from 'das-ui-shared'
import { ParsingRecordType } from '~/constant'

export default Vue.extend({
  name: 'AccountInput',
  components: {
    Iconfont,
    DasAvatar,
  },
  inheritAttrs: false,
  props: {
    chain: {
      type: Object as PropType<IMainChain>,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      default: 'text'
    },
    top: {
      type: Boolean,
      default: false
    },
    errorMessages: {
      type: Array as PropType<string[]>,
      default: () => ([])
    }
  },
  data () {
    return {
      value: '',
      loading: false,
      isDasAccount: false,
      parsingRecords: [] as IAccountParsingRecord[],
      currentChainParsingRecords: [] as IAccountParsingRecord[],
      showParsingRecords: false,
      toAddress: '',
      toLabel: '',
      addressErrors: [] as string[]
    }
  },
  computed: {
    listeners (): object {
      const _vm = this
      return {
        ...this.$listeners,
        input () {
          _vm.onInput()
        }
      }
    }
  },
  watch: {
    chain (newVal, oldVal) {
      if (newVal.coinType !== oldVal.coinType) {
        this.onInput()
      }
    }
  },
  mounted () {
    document.addEventListener('click', this.onClose)
  },
  beforeDestroy () {
    document.removeEventListener('click', this.onClose)
  },
  methods: {
    collapseString,
    onClose () {
      this.showParsingRecords = false
    },
    onInput () {
      this.addressErrors = []
      this.parsingRecords = []
      this.currentChainParsingRecords = []
      this.toAddress = ''
      this.toLabel = ''
      this.showParsingRecords = false
      this.isDasAccount = /\.bit$/.test(this.value)
      if (this.isDasAccount && this.value.length > 4) {
        let val = this.value.toLowerCase()
        val = toDottedStyle(val)
        this.getAccountParsingRecords(val)
      }
      else if (this.value.length > 20) {
        validate(this.value, `required|address:${this.chain.symbol}`, {
          name: this.name
        })
          .then((result: ValidationResult) => {
            if (result.valid) {
              this.toAddress = this.value
            }
            else {
              this.addressErrors = result.errors
            }
          })
      }
      this.$emit('input', this.value)
    },
    async getAccountParsingRecords (account: string) {
      try {
        this.loading = true
        const res = await this.$services.account.accountParsingRecords(account)
        if (res.records && res.records.length > 0) {
          this.parsingRecords = res.records
          this.currentChainParsingRecords = this.parsingRecords.filter((record: IAccountParsingRecord) => {
            const type = record.type
            let key = record.key
            if (key === 'bsc') {
              key = BSC.symbol.toLowerCase()
            }
            else if (key === 'polygon') {
              key = Polygon.symbol.toLowerCase()
            }
            return type === ParsingRecordType.address && key === String(this.chain.symbol.toLowerCase())
          })
          if (this.currentChainParsingRecords.length > 0) {
            this.showParsingRecords = true
          }
          else {
            this.addressErrors = [(this.$tt('No {symbol} related parsing records', { symbol: this.chain.symbol }) as string)]
          }
        }
        else {
          this.addressErrors = [(this.$tt('No {symbol} related parsing records', { symbol: this.chain.symbol }) as string)]
        }
      }
      catch (err) {
        console.error(err)
      }
      finally {
        this.loading = false
      }
    },
    selectAddress (record: IAccountParsingRecord) {
      this.toAddress = record.value
      this.toLabel = record.label
      this.showParsingRecords = false
      this.$emit('input', record.value)
    },
    switchParsingRecords () {
      this.showParsingRecords = !this.showParsingRecords
    },
    onFocus () {
      if (this.currentChainParsingRecords.length > 0) {
        this.showParsingRecords = true
      }
    }
  }
})
</script>

<style lang="scss">
@import 'src/assets/variables';

.account-input {
  position: relative;
  display: flex;
  flex-direction: column;
}

.account-input__input {
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

.account-input__input__is-account {
  padding: 11px 48px 11px 24px;
}

.account-input__input__account {
  padding: 11px 108px 11px 24px;
}

.account-input__input_error {
  border: 1px solid $error-color;
  background: $white;
  box-shadow: inset 0 0 0 4px rgba(223, 75, 70, 0.1);

  &:hover {
    border: 1px solid $error-color;
    box-shadow: inset 0 0 0 4px rgba(223, 75, 70, 0.1);
  }
}

.account-input__error-messages {
  margin-top: 4px;
  height: 14px;
  font-size: 12px;
  font-weight: 600;
  color: $error-font-color;
  line-height: 14px;
  text-align: left;
}

.account-input__account {
  position: absolute;
  display: flex;
  align-items: center;
  top: 0;
  right: 16px;
  cursor: pointer;
  height: 58px;
}

.account-input__account__container__to-address {
  display: flex;
  align-items: center;
  padding: 5px 1px 5px 8px;
  height: 16px;
  font-size: 12px;
  font-weight: 600;
  background: rgba(35, 38, 75, 0.06);
  border-radius: 16px;
  overflow: hidden;
  color: $primary-font-color;
}

.account-input__account__container {
  display: flex;
  align-items: center;
  padding: 1px;
  background: $white;
  border-radius: 16px;
  background: rgba(35, 38, 75, 0.06);
}

.account-input__account__to-address {
  margin-right: 6px;
}

.account-input__parsing-records {
  position: absolute;
  left: 0;
  right: 0;
  top: 64px;
  padding: 8px 0 12px 0;
  box-shadow: 0 22px 14px 0 rgb(0 0 0 / 7%);
  border: 1px solid #DBDEEB;
  border-radius: 6px;
  background: $white;
  word-break: break-all;
  font-weight: 600;
  text-align: left;
  z-index: 10;
}

.account-input__parsing-records_top {
  top: unset;
  bottom: 64px;
}

.account-input__parsing-records__list {
  padding: 0 12px;
  max-height: 200px;
  overflow-y: scroll;
}

.account-input__parsing-records__label {
  padding: 0 12px;
  display: inline-block;
  color: #717391;
  line-height: 20px;
}

.account-input__parsing-records__item {
  margin-top: 8px;
  padding: 8px;
  display: flex;
  border-radius: 4px;
  background: #e9ebf8;
  cursor: pointer;

  &:hover {
    background: rgba(233, 235, 248, 0.5)
  }
}

.account-input__parsing-records__margin-right-8 {
  margin-right: 8px;
}

.account-input__parsing-records__width-24 {
  display: inline-block;
  min-width: 24px;
}

.account-input__parsing-records__address {
  color: $primary-font-color;
  line-height: 20px;
}

.account-input__parsing-records__tag {
  display: inline-block;
  margin-top: 4px;
  padding: 1px 4px;
  background: #FFFFFF;
  border-radius: 4px;
  border: 1px solid #E6E9F7;
  color: #2471FE;
  line-height: 20px;
}

.account-input__parsing-records__arrow-icon {
  position: absolute;
  top: -10px;
  right: 8px;
  display: flex;
  width: 36px;
}

.account-input__parsing-records__arrow-icon_top {
  top: unset;
  bottom: -10px;
  transform: rotate(180deg);
}

.account-input__parsing-records__loading-icon {
  svg {
    animation: rotate360DegAnimation 0.9s linear infinite;
  }
}
</style>
