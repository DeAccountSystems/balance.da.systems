<template>
  <span
    class="trx-action"
    :class="`trx-action__action${account.action}`"
  >
    {{ getTrxAction(account.action) }}
  </span>
</template>

<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api'
import { ACTION_TYPE } from '~/constant'
import { collapseString, toHashedStyle } from '~/modules/tools'

export default defineComponent({
  name: 'TrxAction',
  props: {
    account: {
      type: Object,
      default: null
    }
  },
  methods: {
    getTrxAction (action: number) {
      let text = ''
      const account = collapseString(toHashedStyle(this.account.account), 4, 8)
      switch (action) {
        case ACTION_TYPE.withdraw:
          text = this.$tt('Send')
          break
        case ACTION_TYPE.mergeRewards:
          text = this.$tt('Rewards')
          break
        case ACTION_TYPE.list:
          text = this.$tt('List {account}', { account: account })
          break
        case ACTION_TYPE.delist:
          text = this.$tt('Delist {account}', { account: account })
          break
        case ACTION_TYPE.buyAccount:
          text = this.$tt('Buy {account}', { account: account })
          break
        case ACTION_TYPE.sellAccount:
          text = this.$tt('Sell {account}', { account: account })
          break
        case ACTION_TYPE.transferToTransit:
          text = this.$tt('Activated')
          break
        case ACTION_TYPE.setReverseRecord:
          text = this.$tt('Set Reverse Record')
          break
        case ACTION_TYPE.delReverseRecord:
          text = this.$tt('Delete Reverse Record')
          break
        case ACTION_TYPE.dasBalanceRegisterOrRenew:
          text = this.$tt('Register or Renew')
          break
        case ACTION_TYPE.renewal:
          text = this.$tt('Renewal for DAS')
          break
        case ACTION_TYPE.makeOffer:
          text = this.$tt('Make offer {account}', { account: account })
          break
        case ACTION_TYPE.editOfferAdd:
        case ACTION_TYPE.editOfferSub:
          text = this.$tt('Edit offer {account}', { account: account })
          break
        case ACTION_TYPE.cancelOffer:
          text = this.$tt('Cancel offer {account}', { account: account })
          break
        case ACTION_TYPE.acceptOffer:
          text = this.$tt('Accept offer {account}', { account: account })
          break
        case ACTION_TYPE.offerAccepted:
          text = this.$tt('Offer accepted {account}', { account: account })
          break
        case ACTION_TYPE.refundOfDeposit:
          text = this.$tt('Refund of frozen CKB')
          break
        case ACTION_TYPE.orderRefund:
          text = this.$tt('Refund')
          break
        case ACTION_TYPE.enableSubAccount:
          text = this.$tt('Enable sub-accounts')
          break
        case ACTION_TYPE.createSubAccount:
          text = this.$tt('Mint sub-accounts')
          break
        case ACTION_TYPE.accountRecycled:
        case ACTION_TYPE.accountRecycledRefund:
        case ACTION_TYPE.accountRecycledCrossRefund:
          text = this.$tt('{account} recycled', { account: account })
          break
        case ACTION_TYPE.subAccountProfit:
          text = this.$tt('From SuperDID')
          break
      }
      return text
    }
  }
})
</script>

<style lang="scss">
@import 'src/assets/variables';

.trx-action {
  padding: 2px 5px;
  background: #d0d0d2;
  border-radius: 6px;
  font-size: $font-size-14;
  font-weight: 400;
  color: #626169;
  line-height: 20px;

  &.trx-action__action0,
  &.trx-action__action6,
  &.trx-action__action12,
  &.trx-action__action18,
  &.trx-action__action24 {
    background: #D1CEFF;
    color: #776DCF;
  }

  &.trx-action__action1,
  &.trx-action__action7,
  &.trx-action__action13,
  &.trx-action__action19,
  &.trx-action__action26 {
    background: #F0DAC3;
    color: #CFA16D;
  }

  &.trx-action__action2,
  &.trx-action__action8,
  &.trx-action__action14,
  &.trx-action__action20 {
    background: #F0C3C3;
    color: #CF6D6D;
  }

  &.trx-action__action3,
  &.trx-action__action9,
  &.trx-action__action15,
  &.trx-action__action21 {
    background: #CEEDFF;
    color: #6DACCF;
  }

  &.trx-action__action4,
  &.trx-action__action10,
  &.trx-action__action16,
  &.trx-action__action22 {
    background: #d0d0d2;
    color: #626169;
  }

  &.trx-action__action5,
  &.trx-action__action11,
  &.trx-action__action17,
  &.trx-action__action23,
  &.trx-action__action100 {
    background: #D1CEFF;
    color: #776DCF;
  }
}
</style>
