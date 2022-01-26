<template>
  <BaseCard class="available-balance">
    <h2 class="available-balance__title">
      {{ $tt('DAS Balance') }}
    </h2>
    <div
      v-if="transitBalance !== '0'"
      class="available-balance__transit_balance"
    >
      <span class="available-balance__transit_balance__container">
        <span>{{ $tt('To be activated: {balance} CKB', { balance: thousandSplit(transitBalance) }) }}</span>
        <a
          class="available-balance__transit_balance__faq"
          :href="$i18n.locale === 'zh-CN' ? 'https://talk.da.systems/t/bestdas-com/115#ckb-10' : `https://talk.da.systems/t/faq-bestdas-com/116#why-does-the-ckb-i-deposited-needs-to-be-activated-and-is-the-activation-process-secure-10`"
          :target="isMobile ? '_self' : '_blank'"
        >
          <Iconfont name="help" size="14" color="#929BB1" />
        </a>
      </span>
      <Button
        small
        :loading="onTransferLoading"
        @click="onTransfer"
      >
        {{ $tt('Activate') }}
      </Button>
    </div>
    <div class="available-balance__ckb">{{ thousandSplit(balance, FIAT_DECIMAL_PLACES) }} CKB</div>
    <div class="available-balance__usd">${{ thousandSplit(balanceUSD) }}</div>
    <div class="available-balance__actions">
      <Button
        middle
        primary
        block
        @click="onDeposit"
      >
        {{ $tt('Receive') }}
      </Button>
      <Button
        middle
        block
        @click="onShowWithdraw"
      >
        {{ $tt('Send') }}
      </Button>
    </div>
    <AvailableBalanceWithdraw
      v-model="withdrawDialogShowing"
    />
    <Dialog
      :showing="transferSubmittedDialogShowing"
      class="transit-balance__transfer"
      :actionButtonText="$tt('Got it')"
      close-button
      @close="onCloseTransferSubmittedDialog"
    >
      <div class="transit-balance__transfer__icon">📡</div>
      <div class="transit-balance__transfer__title">{{ $tt('Transaction pending') }}</div>
      <div class="transit-balance__transfer__tips">
        {{ $tt('Your Balance will be updated in 3 minutes.') }}
      </div>
    </Dialog>
    <Dialog
      :showing="depositDialogShowing"
      :title="'💳 ' + $tt('Receive') + ' CKB'"
      :actionButtonText="$tt('Close')"
      close-button
      @close="onCloseDepositDialog"
    >
      <div class="transit-balance__deposit__container">
        <QrcodeVue
          id="receiptAddressId"
          class="transit-balance__deposit__qrcode"
          :value="receiptFullAddress"
          size="138"
          level="Q"
        />
        <!--        <div>-->
        <!--          <span class="transit-balance__deposit__recommend-address-label">-->
        <!--            {{ $tt('Recommended Address') }}-->
        <!--          </span>-->
        <!--        </div>-->
        <div
          class="transit-balance__receipt-address"
          @click="onCopyAddress(receiptFullAddress)"
        >
          {{ receiptFullAddress }}
          <Iconfont
            class="connected-status__avatar"
            name="copy"
            color="#6F7684"
            size="15"
          />
        </div>
      </div>
      <div class="transit-balance__deposit__alternate-address">
        <div class="transit-balance__deposit__buy-ckb">
          <span>*</span>
          <div>
            {{ $tt('Huobi Exchange cannot withdraw CKB to this address. Please use other exchanges or wallets to transfer to CKB.') }}
          </div>
        </div>
        <div class="transit-balance__deposit__buy-ckb">
          <span>*</span>
          <div>
            {{ $tt('No CKB?') }}
            <a
              class="transit-balance__deposit__tips__link"
              :href="$i18n.locale === 'zh-CN' ? 'https://www.binance.com/zh-CN/trade/CKB_USDT?ref=25821015' : 'https://www.binance.com/en/trade/CKB_USDT?ref=25821015'" target="_self">
              {{ $tt('Buy CKB') }}
            </a>
          </div>
        </div>
        <div class="transit-balance__deposit__tips">
          <span class="transit-balance__deposit__tag">*</span>
          <i18n
            tag="div"
            path="充值警告"
            :i18nkey="$tt('充值警告')">
            <template slot="link">
              <a
                class="transit-balance__deposit__tips__link"
                :href="$i18n.locale === 'zh-CN' ? 'https://talk.da.systems/t/bestdas-com/115#350-ckb-7' : 'https://talk.da.systems/t/faq-bestdas-com/116#why-is-it-recommended-to-deposit-at-least-350-ckb-6'"
                :target="isMobile ? '_self' : '_blank'"
              >
                {{ $tt('Why?') }}
              </a>
            </template>
          </i18n>
        </div>
      </div>
      <!--      <div class="transit-balance__deposit__alternate-address">-->
      <!--        <div>-->
      <!--          <span class="transit-balance__deposit__alternate-address-label">{{ $tt('Alternate Address') }}</span>-->
      <!--          <div class="transit-balance__deposit__alternate-address__tips">{{ $tt('If the recommended address is not available in your wallet/exchange, please use the alternate address.') }}</div>-->
      <!--        </div>-->
      <!--        <div class="transit-balance__deposit__alternate-address__context" @click="onCopyAddress(receiptAddress)">-->
      <!--          {{ receiptAddress }}-->
      <!--          <Iconfont-->
      <!--            class="connected-status__avatar"-->
      <!--            name="copy"-->
      <!--            color="#6F7684"-->
      <!--            size="15"-->
      <!--          />-->
      <!--        </div>-->
      <!--      </div>-->
      <span slot="action" />
    </Dialog>
  </BaseCard>
</template>

<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api'
import { mapGetters, mapState } from 'vuex'
import { copyText, isMobile, sleep, thousandSplit } from '~/modules/tools'
import { ICkbAddress, IConnectedAccount, ME_KEYS } from '~/store/me'
import BaseCard from '~/components/card/BaseCard.vue'
import Iconfont from '~/components/icon/Iconfont.vue'
import AvailableBalanceWithdraw from './AvailableBalanceWithdraw.vue'
import Decimal from 'decimal.js'
import { FIAT_DECIMAL_PLACES } from '~/constant'
import { IToken } from '~/services/Common'
import { CKB, LOCK_SCRIPT_TYPE } from '~/constant/chain'
import { COMMON_KEYS } from '~/store/common'
import QrcodeVue from 'qrcode.vue'
import Button from '~/components/Button.vue'
import errno from '~/constant/errno'

export default defineComponent({
  name: 'AvailableBalance',
  components: {
    Iconfont,
    QrcodeVue,
    BaseCard,
    AvailableBalanceWithdraw,
    Button,
  },
  props: {
    balance: {
      type: String,
      required: true,
      default: '0'
    },
    transitBalance: {
      type: String,
      required: true,
      default: '0'
    }
  },
  data () {
    return {
      FIAT_DECIMAL_PLACES,
      withdrawDialogShowing: false,
      transferSubmittedDialogShowing: false,
      onTransferLoading: false,
      depositDialogShowing: false,
    }
  },
  computed: {
    isMobile,
    ...mapState({
      me: ME_KEYS.namespace,
      common: COMMON_KEYS.namespace,
    }),
    ...mapGetters({
      computedChainId: ME_KEYS.computedChainId
    }),
    connectedAccount (): IConnectedAccount {
      return this.me.connectedAccount
    },
    ckbAddressList (): ICkbAddress[] {
      return this.me.ckbAddressList
    },
    balanceUSD (): string {
      const res = this.common.tokens.find((token: IToken) => {
        return CKB.tokenId === token.token_id
      })
      if (res && res.price) {
        return new Decimal(this.balance).times(res.price).toFixed(FIAT_DECIMAL_PLACES)
      }
      else {
        return '0'
      }
    },
    receiptAddress (): string {
      const res = this.ckbAddressList.find((item) => {
        return item.address === this.connectedAccount.address && item.addressChainId === this.computedChainId
      })
      if (res) {
        return res.ckbAddress
      }
      else {
        return ''
      }
    },
    receiptFullAddress (): string {
      const res = this.ckbAddressList.find((item) => {
        return item.address === this.connectedAccount.address && item.addressChainId === this.computedChainId
      })
      if (res) {
        return res.fullCkbAddress
      }
      else {
        return ''
      }
    }
  },
  methods: {
    thousandSplit,
    onShowWithdraw () {
      this.withdrawDialogShowing = true
    },
    onCloseTransferSubmittedDialog () {
      this.transferSubmittedDialogShowing = false
    },
    onDeposit () {
      this.depositDialogShowing = true
    },
    onCloseDepositDialog () {
      this.depositDialogShowing = false
    },
    onCopyAddress (address: string) {
      copyText(address).then(() => {
        this.$toast('👌 ' + this.$tt('Copied'))
      })
    },
    async onTransfer () {
      this.onTransferLoading = true
      const addresses = this.ckbAddressList.find((item) => {
        return item.address === this.connectedAccount.address && item.addressChainId === this.computedChainId
      })

      try {
        const res = await this.$services.account.transitBalanceTransfer({
          transfer_address: (addresses as ICkbAddress).ckbAddress,
          chain_type: this.computedChainId,
          address: this.connectedAccount.address
        })

        if (!res) {
          this.onTransferLoading = false
          return
        }

        for (const item of res.sign_list) {
          if (item.sign_msg) {
            if (item.sign_type === LOCK_SCRIPT_TYPE.ckb) {
              const { ethereum } = window
              if (ethereum.isImToken || ethereum.isHbWallet) {
                this.$alert({
                  title: this.$tt('Tips'),
                  message: this.$tt('Due to wallet compatibility issues, the current wallet cannot activate this part of the funds, please change to another wallet to activate it. Your funds are secure and can still only be controlled by your private key.')
                })
                this.onTransferLoading = false
                return
              }
              else {
                const signDataRes = await this.$walletSdk.ethSign(item.sign_msg)
                item.sign_msg = (signDataRes as string)
              }
            }
            else {
              const signDataRes = await this.$walletSdk.signData(item.sign_msg)
              item.sign_msg = (signDataRes as string)
            }
            // sometimes metamask need a duration to receive next signing request
            await sleep(1000)
          }
        }

        await this.$services.account.sendTransaction(res)
        this.transferSubmittedDialogShowing = true
      }
      catch (err: any) {
        this.onTransferLoading = false
        console.error(err)
        if (![errno.metaMaskUserRejectedAccountAccess, errno.metaMaskUserDeniedMessageSignature].includes(err.code) && err !== errno.tronLinkConfirmationDeclinedByUser && err.message !== errno.walletConnectUserRejectedTheTransaction) {
          if (err.code === errno.metaMaskWalletRequestPermissions) {
            this.$alert({
              title: this.$tt('Tips'),
              message: this.$tt('Other requests for the wallet are not processed, please try again after processing')
            })
          }
          else if (err.code === errno.apiErrorCodeInsufficientBalance) {
            this.$alert({
              title: this.$tt('Insufficient balance'),
              message: this.$tt('Insufficient balance. Please check your balance.The minimum amount to be activated is 350 CKB. DAS is a decentralized marketplace and interaction with the contract requires a balance of at least 350 CKB.')
            })
          }
          else if (err.code === errno.apiErrorCodeNotEnoughChange) {
            this.$alert({
              title: this.$tt('Tips'),
              message: this.$tt('DAS is a smart contract that runs on the Nervos. Due to the underlying logic of the contract, the remaining amount is too low (less than 116 CKB) to send a transaction. ')
            })
          }
          else if (err.code === errno.apiErrorCodeRejectedOutPoint) {
            this.$alert({
              title: this.$tt('Tips'),
              message: this.$tt('Frequent operations. There are still transactions being processed in your wallet address, please try again after 30s.')
            })
          }
          else {
            this.$alert({
              title: this.$tt('Error'),
              message: err.code ? `${err.code}: ${err.message}` : err
            })
          }
        }
      }
    }
  }
})
</script>

<style lang="scss">
@import "src/assets/variables";

.available-balance {
  padding: 16px;
}

.available-balance__title {
  padding-bottom: 6px;
  display: inline-grid;
  grid-auto-flow: column;
  grid-column-gap: 10px;
  align-items: center;
  font-size: $font-size-24;
  font-weight: bold;
  color: $primary-font-color;
  line-height: 29px;
}

.available-balance__ckb {
  font-size: $font-size-36;
  font-family: $barlow-medium;
  font-weight: 600;
  color: $success-font-color;
  line-height: 43px;
  margin: 8px 0 4px 0;
}

.available-balance__usd {
  margin-bottom: 33px;
  font-size: $font-size-16;
  color: $assist-font-color;
  line-height: 19px;
}

.available-balance__actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-column-gap: 16px;
}

.transit-balance__transfer {
  text-align: center;
}

.transit-balance__transfer__icon {
  font-size: 64px;
}

.transit-balance__transfer__title {
  margin-top: 12px;
  margin-bottom: 8px;
  font-size: 24px;
}

.transit-balance__transfer__tips {
  margin-bottom: 16px;
  font-size: $font-size-14;
  font-weight: 400;
  color: $assist-font-color;
  line-height: 16px;
}

.transit-balance__deposit__tips {
  display: inline-grid;
  grid-auto-flow: column;
  grid-column-gap: 2px;
  grid-template-columns: 7px auto;
  text-align: left;
  color: $error-font-color;
}

.transit-balance__deposit__tag {
  color: $primary-font-color;
}

.transit-balance__deposit__tips__link {
  color: $link-font-color;
}

.transit-balance__deposit__container {
  margin: 10px 0 8px 0;
  padding: 24px 0 8px 0;
  display: grid;
  grid-row-gap: 16px;
  text-align: center;
  background: #EFF2F5;
  border-radius: 8px;
}

.transit-balance__receipt-address {
  margin: 0 30px;
  font-size: 14px;
  font-weight: 600;
  color: $primary-font-color;
  line-height: 16px;
  word-break: break-all;
  cursor: pointer;

  &:hover {
    opacity: 0.5;
  }
}

.transit-balance__deposit__alternate-address__context {
  cursor: pointer;

  &:hover {
    opacity: 0.5;
  }
}

.transit-balance__deposit__buy-ckb {
  margin-bottom: 10px;
  display: inline-grid;
  grid-auto-flow: column;
  grid-column-gap: 2px;
  grid-template-columns: 7px auto;
  text-align: left;
}

.available-balance__transit_balance {
  margin-top: 22px;
  display: grid;
  grid-auto-flow: column;
  grid-column-gap: 8px;
  padding: 2px 2px 2px 9px;
  border-radius: 6px;
  align-items: center;
  font-size: $font-size-14;
  font-weight: 600;
  color: $error-color;
  line-height: 20px;
  background: rgba(223, 75, 70, 0.1);
}

.transit-balance__deposit__qrcode {
  > canvas {
    padding: 4px;
    background: #FFFFFF;
    border-radius: 8px;
  }
}

.transit-balance__deposit__recommend-address-label {
  display: inline-block;
  background: #22C493;
  border-radius: 6px;
  padding: 2px 4px;
  color: #FFFFFF;
}

.transit-balance__deposit__alternate-address-label {
  display: inline-block;
  background: #EFF2F5;
  border-radius: 6px;
  padding: 2px 4px;
  color: #6F7684;
}

.transit-balance__deposit__alternate-address {
  background: #FFFFFF;
  border-radius: 6px;
  border: 1px solid rgba(186, 200, 209, 0.24);
  margin: 24px 0;
  text-align: left;
  padding: 24px 14px;
  word-break: break-word;
  font-size: 14px;
  font-weight: 400;
  color: #11142D;
  line-height: 16px;
}

.transit-balance__deposit__alternate-address__tips {
  margin: 8px 0 10px 0;
  font-size: 14px;
  font-weight: 400;
  color: #6F7684;
  line-height: 20px;
  word-break: break-word;
}

.available-balance__transit_balance__container {
  display: inline-flex;
}

.available-balance__transit_balance__faq {
  display: inline-flex;
  margin-top: 3px;
  margin-left: 6px;
}
</style>
