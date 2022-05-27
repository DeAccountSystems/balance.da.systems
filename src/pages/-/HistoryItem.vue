<style lang="scss">
@import "src/assets/variables";

.history-item {
  cursor: pointer;

  &:hover {
    background-color: #EFF2F5;
  }
}

.history-item__header {
  display: grid;
  grid-row-gap: 8px;
  font-size: $font-size-16;
  font-weight: 600;
  color: $primary-font-color;
  line-height: 19px;
}

.history-item__header__price-ckb {
  display: inline-flex;
  align-items: center;
  grid-column-gap: 3px;
}

.history-item__header__timestamp {
  font-size: 14px;
  font-weight: 400;
  color: $assist-font-color;
  line-height: 16px;
}

.history-item__header__action_receipt {
  color: $success-font-color;
}

.history-item__header__action_pay {
  color: $error-font-color;
}
</style>

<template>
  <BaseListItem
    class="history-item"
    @click.native="goTrxInfo"
  >
    <template #head>
      <div class="history-item__header">
        <span class="history-item__header__price-ckb">
          <span
            :class="getSymbol(account.action) === '+' ? 'history-item__header__action_receipt' : 'history-item__header__action_pay'">{{ getSymbol(account.action) + ' ' + thousandSplit(fromSatoshi(account.capacity)) + ' CKB' }}</span>
          <Iconfont
            name="arrow-right"
            color="#ACB9D9"
            size="13"
          />
        </span>
        <span class="history-item__header__timestamp">{{ formatDateTime(account.timestamp) }}</span>
      </div>
    </template>
    <template #tail>
      <TrxAction :account="account" />
    </template>
  </BaseListItem>
</template>

<script lang="ts">
import Iconfont from '~/components/icon/Iconfont.vue'
import BaseListItem from '~/components/list/BaseListItem.vue'
import TrxAction from '~/pages/-/TrxAction.vue'
import { formatDateTime, isMobile, fromSatoshi, thousandSplit } from '~/modules/tools'
import { ACTION_TYPE } from '~/constant'
import { defineComponent } from '@nuxtjs/composition-api'
import { CKB } from '~/constant/chain'

export default defineComponent({
  name: 'HistoryItem',
  components: {
    BaseListItem,
    Iconfont,
    TrxAction
  },
  props: {
    account: {
      type: Object,
      default: null
    }
  },
  computed: {
    isMobile
  },
  methods: {
    fromSatoshi,
    thousandSplit,
    formatDateTime,
    getSymbol (action: number) {
      if ([ACTION_TYPE.withdraw, ACTION_TYPE.list, ACTION_TYPE.buyAccount, ACTION_TYPE.dasBalanceRegisterOrRenew, ACTION_TYPE.renewal, ACTION_TYPE.setReverseRecord, ACTION_TYPE.makeOffer, ACTION_TYPE.editOfferAdd, ACTION_TYPE.offerAccepted, ACTION_TYPE.enableSubAccount, ACTION_TYPE.createSubAccount].includes(action)) {
        return '-'
      }
      else if ([ACTION_TYPE.mergeRewards, ACTION_TYPE.delist, ACTION_TYPE.sellAccount, ACTION_TYPE.transferToTransit, ACTION_TYPE.delReverseRecord, ACTION_TYPE.refundOfDeposit, ACTION_TYPE.cancelOffer, ACTION_TYPE.acceptOffer, ACTION_TYPE.editOfferSub, ACTION_TYPE.orderRefund].includes(action)) {
        return '+'
      }
    },
    goTrxInfo () {
      window.open(`${CKB.explorerTrx}${this.account.hash}`, this.isMobile ? '_self' : '_blank')
    }
  }
})
</script>
