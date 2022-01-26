<template>
  <div>
    <Dialog
      :showing="showing"
      :title="'💳 ' + $tt('Send') + ' CKB'"
      closeButton
      @close="onCloseWithdrawDialog"
    >
      <ValidationObserver
        ref="withdrawForm"
        tag="form"
        @submit.prevent="onWithdrawConfirm"
      >
        <label class="available-balance-withdraw__label">
          {{ $tt('Send to') }}
        </label>
        <AccountInput
          :chain="CKB"
          :name="$tt('Send to')"
          :placeholder="$tt('DAS or {symbol} address', { symbol: CKB.symbol })"
          :errorMessages="sendToCKBAddressError"
          @input="onInputSendTo"
        />
        <label class="available-balance-withdraw__label available-balance-withdraw__label__balance">
          <span>{{ $tt('Amount') }}</span>
          <span
            class="available-balance-withdraw__balance"
            @click="onFillBalance"
          >
            {{ $tt('Balance: ') }}
            <span class="available-balance-withdraw__balance__value">{{ thousandSplit(availableBalance) }}</span>
            <span> CKB</span>
          </span>
        </label>
        <ValidationProvider
          v-slot="{ errors }"
          :name="$tt('Amount')"
          :rules="`required|minAmount:116,CKB|maxAmount:${availableBalance},CKB`"
        >
          <TextInput
            v-model.number="amount"
            type="number"
            inputmode="numeric"
            inputType="numberDecimal"
            suffix="CKB"
            step="0.00000001"
            :placeholder="$tt('At least 116 CKB')"
            :errorMessages="errors"
          />
        </ValidationProvider>
        <div class="available-balance-withdraw__action">
          <Button
            primary
            large
            block
            :loading="withdrawConfirmLoading"
            type="submit"
          >
            {{ $tt('Send') }}
          </Button>
        </div>
      </ValidationObserver>
      <span slot="action" />
    </Dialog>
    <Dialog
      :showing="transactionSubmittedDialogShowing"
      class="available-balance-withdraw__transaction-submitted"
      :actionButtonText="$tt('Got it')"
      close-button
      @close="onCloseTransactionSubmittedDialog"
    >
      <div class="available-balance-withdraw__transaction-submitted__icon">📡️</div>
      <div class="available-balance-withdraw__transaction-submitted__title">{{ $tt('Transaction pending') }}</div>
      <div class="available-balance-withdraw__transaction-submitted__tips">
        {{ $tt('Your Balance will be changed in 3 minutes.') }}
      </div>
    </Dialog>
    <Dialog
      :showing="sendTipsShowing"
      :title="$tt('Tips')"
      class="available-balance-withdraw__tips"
      close-button
      @close="onCloseSendTipsDialog"
    >
      <div class="available-balance-withdraw__tips__content">
        {{ $tt('DAS is a smart contract that runs on the Nervos. Due to the underlying logic of the contract, the remaining amount is too low (less than 116 CKB) to send a transaction. Do you want to send all {availableBalance} CKB?', { availableBalance: thousandSplit(availableBalance) }) }}
      </div>
      <template #action>
        <div class="available-balance-withdraw__tips__action">
          <Button
            primary
            block
            large
            @click="onSendAll"
          >
            {{ $tt('Send all') }}
          </Button>
          <Button
            large
            block
            @click="onCloseSendTipsDialog"
          >
            {{ $tt('Cancel') }}
          </Button>
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api'
import { mapGetters, mapState } from 'vuex'
import { expandUnit, fromSatoshi, mmJsonHashAndChainIdHex, sleep, thousandSplit } from '~/modules/tools'
import { IConnectedAccount, ME_KEYS } from '~/store/me'
import { validate, ValidationObserver, ValidationProvider } from 'vee-validate'
import { CKB, LOCK_SCRIPT_TYPE } from '~/constant/chain'
import errno from '~/constant/errno'
import TextInput from '~/components/form/TextInput.vue'
import AccountInput from '~/components/form/AccountInput.vue'

export default defineComponent({
  name: 'AvailableBalanceWithdraw',
  components: {
    ValidationObserver,
    ValidationProvider,
    AccountInput,
    TextInput
  },
  model: {
    prop: 'showing',
    event: 'close'
  },
  props: {
    showing: {
      type: Boolean,
      required: false
    }
  },
  data () {
    return {
      CKB,
      transactionSubmittedDialogShowing: false,
      sendToCKBAddress: '',
      amount: '',
      withdrawConfirmLoading: false,
      sendTipsShowing: false,
      sendToCKBAddressError: [] as string[]
    }
  },
  computed: {
    ...mapState({
      me: ME_KEYS.namespace
    }),
    ...mapGetters({
      computedChainId: ME_KEYS.computedChainId,
      computedEvmChainId: ME_KEYS.computedEvmChainId
    }),
    connectedAccount (): IConnectedAccount {
      return this.me.connectedAccount
    },
    availableBalance (): string {
      return fromSatoshi(this.me.availableBalance)
    }
  },
  methods: {
    thousandSplit,
    onSendAll () {
      this.onFillBalance()
      this.onWithdrawConfirm()
      this.onCloseSendTipsDialog()
    },
    onFillBalance () {
      this.amount = this.availableBalance
    },
    onInputSendTo (value: string) {
      this.sendToCKBAddressError = []
      if (value) {
        this.sendToCKBAddress = value
      }
    },
    onCloseWithdrawDialog () {
      this.$emit('close', false)
    },
    onCloseSendTipsDialog () {
      this.sendTipsShowing = false
    },
    onCloseTransactionSubmittedDialog () {
      this.transactionSubmittedDialogShowing = false
    },
    async onWithdrawConfirm () {
      this.sendToCKBAddressError = []
      const verifiedCkbAddress = await validate(this.sendToCKBAddress, `required|address:${CKB.symbol}`, { name: 'Address' })
      const verified = await (this.$refs.withdrawForm as HTMLFormElement).validate()
      if (!verified || !verifiedCkbAddress.valid) {
        this.sendToCKBAddressError = verifiedCkbAddress.errors
        return
      }

      this.withdrawConfirmLoading = true

      try {
        const res = await this.$services.account.availableBalanceWithdraw({
          chain_type: this.computedChainId,
          evm_chain_id: this.computedEvmChainId,
          address: this.connectedAccount.address,
          receiver_chain_type: CKB.chainId,
          receiver_address: this.sendToCKBAddress,
          amount: expandUnit(this.amount, CKB.decimals),
          withdraw_all: String(this.amount) === this.availableBalance
        })

        if (!res) {
          return
        }

        for (const item of res.sign_list) {
          if (item.sign_msg) {
            if (item.sign_type === LOCK_SCRIPT_TYPE.eip712) {
              const mmJson = JSON.parse(JSON.stringify(res.mm_json))
              mmJson.message.digest = item.sign_msg
              const signDataRes = await this.$walletSdk.signData(mmJson, true)
              item.sign_msg = signDataRes + mmJsonHashAndChainIdHex(mmJson, mmJson.domain.chainId)
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

        this.onCloseWithdrawDialog()
        this.transactionSubmittedDialogShowing = true
      }
      catch (err: any) {
        console.error(err)
        if (![errno.metaMaskUserRejectedAccountAccess, errno.metaMaskUserDeniedMessageSignature].includes(err.code) && err !== errno.tronLinkConfirmationDeclinedByUser && err.message !== errno.walletConnectUserRejectedTheTransaction) {
          if (err.code === errno.metaMaskWalletRequestPermissions) {
            this.$alert({
              title: this.$tt('Tips'),
              message: this.$tt('Other requests for the wallet are not processed, please try again after processing')
            })
          }
          else if (err.code === errno.apiErrorCodeNotSupportFullAddress) {
            this.$alert({
              title: this.$tt('Tips'),
              message: this.$tt('CKB address in long address format is not supported.')
            })
          }
          else if (err.code === errno.apiErrorCodeRejectedOutPoint) {
            this.$alert({
              title: this.$tt('Tips'),
              message: this.$tt('Frequent operations. There are still transactions being processed in your wallet address, please try again after 30s.')
            })
          }
          else if (err.code === errno.apiErrorCodeInsufficientBalance) {
            this.$alert({
              title: this.$tt('Insufficient balance'),
              message: this.$tt('Insufficient balance. Please check your balance.')
            })
          }
          else if (err.code === errno.apiErrorCodeNotEnoughChange) {
            this.sendTipsShowing = true
          }
          else {
            this.$alert({
              title: this.$tt('Error'),
              message: err.code ? `${err.code}: ${err.message}` : err
            })
          }
        }
      }
      finally {
        this.withdrawConfirmLoading = false
      }
    }
  }
})
</script>

<style lang="scss">
@import "src/assets/variables";

.available-balance-withdraw__label {
  margin-top: 22px;
  margin-bottom: 8px;
  display: block;
  font-size: $font-size-14;
  font-weight: 600;
  color: $primary-font-color;
  line-height: 16px;
}

.available-balance-withdraw__action {
  padding: 82px 0 24px 0;
}

.available-balance-withdraw__transaction-submitted {
  text-align: center;
}

.available-balance-withdraw__transaction-submitted__icon {
  font-size: 64px;
}

.available-balance-withdraw__transaction-submitted__title {
  margin-top: 12px;
  margin-bottom: 8px;
  font-size: 24px;
}

.available-balance-withdraw__transaction-submitted__tips {
  margin-bottom: 16px;
  font-size: $font-size-14;
  font-weight: 400;
  color: $assist-font-color;
  line-height: 16px;
}

.available-balance-withdraw__label__balance {
  display: flex;
  justify-content: space-between;
}

.available-balance-withdraw__balance {
  display: flex;
  cursor: pointer;
  font-weight: 400;
}

.available-balance-withdraw__balance__value {
  display: inline-block;
  color: $link-font-color;
  margin-right: 4px;
  font-weight: 600;
}

.available-balance-withdraw__tips__action {
  display: grid;
  padding: 24px;
  grid-auto-flow: column;
  grid-column-gap: 24px;
  grid-template-columns: 1fr 1fr;
}

.available-balance-withdraw__tips__content {
  display: inline-block;
  line-height: 17px;
}
</style>
