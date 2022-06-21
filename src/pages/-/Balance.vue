<template>
  <div>
    <AvailableBalance
      :balance="availableBalance"
      :transitBalance="transitBalance"
    />
    <BaseCard>
      <BaseCardTitle icon="📑" icon-color="#CEEDFF">
        {{ $tt('History') }}
      </BaseCardTitle>

      <MyAccountList
        :accounts="list"
        :total="total"
        :showHeader="false"
        :loading="fetchDataLoading"
        @changePage="onChangePage"
      >
        <template #default="{account}">
          <HistoryItem :account="account" />
        </template>
        <template #notFound>
          <div class="balance__not-found">
            <h3 class="balance__not-found__title">{{ $tt('No records') }}</h3>
          </div>
        </template>
      </MyAccountList>
    </BaseCard>
    <Dialog
      :showing="createCkbAddressDialogShowing"
      :title="$tt('Get your CKB address')"
      @close="onCloseCreateCkbAddressDialog"
    >
      <div class="balance__create-ckb-address__tips">{{ $tt('Before you continue, DAS needs to get your CKB address through a secure ETH/BSC/MATIC signature.') }}</div>
      <div class="balance__create-ckb-address__action">
        <Button
          :loading="createCkbAddressLoading"
          primary
          large
          block
          @click="onCreateCkbAddress"
        >
          {{ $tt('Sign now') }}
        </Button>
      </div>
      <span slot="action" />
    </Dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api'
import { mapGetters, mapState } from 'vuex'
import {
  AddressPrefix,
  pubkeyToAddress,
  AddressType,
  bech32Address
} from '@nervosnetwork/ckb-sdk-utils'
import { fromSatoshi, isBitpieWallet, isSafePalWallet, isMathWallet, thousandSplit } from '~/modules/tools'
import { ICkbAddress, IConnectedAccount, ME_KEYS } from '~/store/me'
import { ITrxHistoryList } from '~/services/Account'
import HistoryItem from '~/pages/-/HistoryItem.vue'
import MyAccountList from '~/pages/-/MyAccountList.vue'
import BaseCard from '~/components/card/BaseCard.vue'
import BaseCardTitle from '~/components/card/BaseCardTitle.vue'
import AvailableBalance from '~/pages/-/AvailableBalance.vue'
import errno from '~/constant/errno'
import config from '~~/config'
import { ACTION_TYPE, CYCLE_CALL_FUNCTION_TIME } from '~/constant'
import * as ethUtil from 'ethereumjs-util'
import secp256k1 from 'secp256k1'
import { Buffer } from 'buffer/'
import { COMMON_KEYS } from '~/store/common'
import Decimal from 'decimal.js'
import { ChainType } from '~/constant/chain'

export default defineComponent({
  name: 'Balance',
  components: {
    BaseCard,
    BaseCardTitle,
    MyAccountList,
    HistoryItem,
    AvailableBalance,
  },
  data () {
    return {
      list: [] as ITrxHistoryList[],
      total: 0,
      fetchDataLoading: false,
      page: 1,
      createCkbAddressDialogShowing: false,
      createCkbAddressLoading: false,
      getBalanceInfoTimerId: 0
    }
  },
  computed: {
    isBitpieWallet,
    isSafePalWallet,
    isMathWallet,
    ...mapState({
      me: ME_KEYS.namespace,
      common: COMMON_KEYS.namespace,
    }),
    ...mapGetters({
      computedChainType: ME_KEYS.computedChainType
    }),
    connectedAccount (): IConnectedAccount {
      return this.me.connectedAccount
    },
    ckbAddressList (): ICkbAddress[] {
      return this.me.ckbAddressList
    },
    loggedIn (): boolean {
      return !!this.me.connectedAccount.address
    },
    availableBalance (): string {
      return fromSatoshi(this.me.availableBalance)
    },
    transitBalance (): string {
      return fromSatoshi(this.me.transitBalance)
    },
    frozenCKB (): string {
      return this.common.config.sale_cell_capacity
    }
  },
  mounted () {
    this.init()
    this.$store.dispatch(COMMON_KEYS.fetchConfig)
  },
  beforeDestroy () {
    window.clearTimeout(this.getBalanceInfoTimerId)
  },
  methods: {
    thousandSplit,
    async init () {
      if (this.loggedIn) {
        this.getMyTrxHistory()
        const res = this.ckbAddressList.find((item) => {
          return item.address === this.connectedAccount.address && item.addressChainId === this.computedChainType
        })
        if (res && res.fullCkbAddress) {
          this.getBalanceInfo()
        }
        else {
          if (this.computedChainType === ChainType.tron) {
            const _fullCkbAddress = await this.getTronFullAddress()
            this.$store.commit(ME_KEYS.setCkbAddressList, {
              address: this.connectedAccount.address,
              addressChainId: this.computedChainType,
              ckbAddress: '',
              fullCkbAddress: _fullCkbAddress
            })
            this.getBalanceInfo()
          }
          else {
            this.createCkbAddressDialogShowing = true
          }
        }
      }
    },
    onCloseCreateCkbAddressDialog () {
      this.createCkbAddressDialogShowing = false
    },
    onChangePage (page: number) {
      this.page = page
      this.getMyTrxHistory()
    },
    async getMyTrxHistory () {
      this.fetchDataLoading = true
      if (!this.computedChainType || !this.connectedAccount.address) {
        return
      }
      try {
        const res = await this.$services.account.myTrxHistory({
          chainType: this.computedChainType,
          address: this.connectedAccount.address,
          page: this.page
        })
        if (res && res.list) {
          const _list: ITrxHistoryList[] = []
          res.list.forEach((item:ITrxHistoryList) => {
            if (item.action === ACTION_TYPE.sellAccount) {
              _list.push({
                ...item,
                capacity: new Decimal(item.capacity).sub(this.frozenCKB).toString()
              })
              _list.push({
                ...item,
                action: ACTION_TYPE.refundOfDeposit,
                capacity: this.frozenCKB
              })
            }
            else {
              _list.push(item)
            }
          })
          this.list = _list
          this.total = res.total
        }
      }
      catch (err) {
        console.error(err)
      }
      finally {
        this.fetchDataLoading = false
      }
    },
    async getBalanceInfo () {
      window.clearTimeout(this.getBalanceInfoTimerId)
      try {
        await this.$store.dispatch(ME_KEYS.fetchBalance)
        this.getBalanceInfoTimerId = window.setTimeout(() => {
          this.getBalanceInfo()
        }, CYCLE_CALL_FUNCTION_TIME * 3)
      }
      catch (err) {
        console.error(err)
      }
    },
    getPublicKeyFor (msg: string, signature: string): Buffer {
      const msgBuf = Buffer.from(msg)
      // @ts-ignore
      const msgHash = ethUtil.hashPersonalMessage(msgBuf)
      const sigParams = ethUtil.fromRpcSig(signature)
      // @ts-ignore
      return ethUtil.ecrecover(msgHash, sigParams.v, sigParams.r, sigParams.s)
    },
    getEthFullAddress () {
      let address = this.connectedAccount.address && this.connectedAccount.address.toLocaleLowerCase()
      address = address.substr(2)
      const script = {
        args: '0x03' + address + '03' + address,
        code_hash: config.isProdData ? '0x9376c3b5811942960a846691e16e477cf43d7c7fa654067c9948dfcd09a32137' : '0x326df166e3f0a900a0aee043e31a4dea0f01ea3307e6e235f09d1b4220b75fbd',
        hash_type: 'type'
      }
      return bech32Address(script.args, {
        prefix: config.isProdData ? AddressPrefix.Mainnet : AddressPrefix.Testnet,
        type: script.hash_type === 'type' ? AddressType.TypeCodeHash : AddressType.DataCodeHash,
        codeHashOrCodeHashIndex: script.code_hash
      })
    },
    getTronFullAddress () {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const { tronWeb } = window
          if (typeof tronWeb !== 'undefined') {
            try {
              let address = tronWeb.defaultAddress.hex && tronWeb.defaultAddress.hex.toLocaleLowerCase()
              address = address.substr(2)
              const script = {
                args: '0x04' + address + '04' + address,
                code_hash: config.isProdData ? '0x9376c3b5811942960a846691e16e477cf43d7c7fa654067c9948dfcd09a32137' : '0x326df166e3f0a900a0aee043e31a4dea0f01ea3307e6e235f09d1b4220b75fbd',
                hash_type: 'type'
              }
              const _fulladdress = bech32Address(script.args, {
                prefix: config.isProdData ? AddressPrefix.Mainnet : AddressPrefix.Testnet,
                type: script.hash_type === 'type' ? AddressType.TypeCodeHash : AddressType.DataCodeHash,
                codeHashOrCodeHashIndex: script.code_hash
              })
              resolve(_fulladdress)
            }
            catch (err) {
              console.error(err)
            }
          }
        }, 3000)
      })
    },
    async onCreateCkbAddress () {
      if (this.isSafePalWallet) {
        this.$alert({
          title: this.$tt('Tips'),
          message: this.$tt('The wallet does not support EIP-712 signature algorithm. Please use another wallet App and try again.')
        })
        return
      }
      this.createCkbAddressLoading = true
      try {
        let msg = '0x Generate a CKB receiving address'

        if (this.isBitpieWallet || this.isSafePalWallet || this.isMathWallet) {
          msg = 'Generate a CKB receiving address'
        }

        const signDataRes = await this.$walletSdk.signData(msg)
        if (typeof signDataRes === 'string') {
          let pubKeyRecovered = this.getPublicKeyFor(msg, signDataRes)
          if (pubKeyRecovered.length === 64) {
            pubKeyRecovered = Buffer.concat([Buffer.from([4]), pubKeyRecovered], 65)
          }
          const output = new Uint8Array(33)
          secp256k1.publicKeyConvert(pubKeyRecovered, true, output)
          const pubKey = Buffer.from(output).toString('hex')

          const ckbAddress = pubkeyToAddress('0x' + pubKey, {
            type: AddressType.HashIdx,
            prefix: config.isProdData ? AddressPrefix.Mainnet : AddressPrefix.Testnet
          })

          this.$store.commit(ME_KEYS.setCkbAddressList, {
            address: this.connectedAccount.address,
            addressChainId: this.computedChainType,
            ckbAddress,
            fullCkbAddress: this.getEthFullAddress()
          })

          this.getBalanceInfo()
          this.onCloseCreateCkbAddressDialog()
        }
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
          else {
            this.$alert({
              title: this.$tt('Error'),
              message: err.code ? `${err.code}: ${err.message}` : err
            })
          }
        }
      }
      finally {
        this.createCkbAddressLoading = false
      }
    }
  }
})
</script>

<style lang="scss">
@import "src/assets/variables";

.balance__not-found {
  margin: 0 22px;
  padding: 60px 0;
  text-align: center;
  box-shadow: 0px -1px 0px 0px #eff2f5;
}

.balance__not-found__title {
  margin-bottom: 8px;
  font-size: $font-size-24;
  font-weight: 600;
  color: $primary-font-color;
  line-height: 29px;
}

.balance__create-ckb-address__tips {
  font-size: 16px;
  font-weight: 400;
  color: $primary-font-color;
  line-height: 24px;
}

.balance__create-ckb-address__action {
  padding: 34px 0 24px 0;
}
</style>
