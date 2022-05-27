<template>
  <div class="debug">
    <div class="debug__item">
      page origin: <span class="debug__value">{{ origin }}</span>
    </div>
    <div class="debug__item">
      isMobile: <span class="debug__value">{{ isMobile }}</span>
    </div>
    <div class="debug__item">
      isMobileDevices: <span class="debug__value">{{ isMobileDevices }}</span>
    </div>
    <div class="debug__item">
      computedChainId: <span class="debug__value">{{ computedChainId }}</span>
    </div>
    <div>-----------</div>
    <div class="debug__item">
      ethereumStatic
      <div>isMetaMask: <span class="debug__value">{{ ethereumStatic.isMetaMask }}</span></div>
      <div>isCoinbaseWallet: <span class="debug__value">{{ ethereumStatic.isCoinbaseWallet }}</span></div>
      <div>isImToken: <span class="debug__value">{{ ethereumStatic.isImToken }}</span></div>
      <div>isHbWallet: <span class="debug__value">{{ ethereumStatic.isHbWallet }}</span></div>
      <div>selectedAddress: <span class="debug__value">{{ ethereumStatic.selectedAddress || ethereumStatic.address }}</span></div>
      <div>chainId: <span class="debug__value">{{ chainIdHexToNumber(ethereumStatic.networkVersion || ethereumStatic.chainId) }}</span></div>
    </div>
    <div>-----------</div>
    <div class="debug__item">
      ethereumComputed
      <div>isMetaMask: <span class="debug__value">{{ ethereumComputed.isMetaMask }}</span></div>
      <div>isCoinbaseWallet: <span class="debug__value">{{ ethereumComputed.isCoinbaseWallet }}</span></div>
      <div>isImToken: <span class="debug__value">{{ ethereumComputed.isImToken }}</span></div>
      <div>isHbWallet: <span class="debug__value">{{ ethereumComputed.isHbWallet }}</span></div>
      <div>selectedAddress: <span class="debug__value">{{ ethereumComputed.selectedAddress || ethereumComputed.address }}</span></div>
      <div>chainId: <span class="debug__value">{{ chainIdHexToNumber(ethereumComputed.networkVersion || ethereumComputed.chainId) }}</span></div>
    </div>
    <div class="debug__item">
      userAgent: <span class="debug__value">{{ userAgent }}</span>
    </div>
    <div>-----eip-712------</div>
    <div>
      mmJson: <input v-model="mmJson" /> <button @click="signEIP712" >EIP-712</button>
    </div>
    <div>
      Result: {{ signDataRes }}
    </div>
    <div>
      mmHash: {{ mmHash }}
    </div>
    <div>-----personal_sign------</div>
    <div>
      Hex: <input v-model="hexString" /> <button @click="personalSign" >Personal Sign</button>
    </div>
    <div>
      Result: {{ personalSignRes }}
    </div>
    <div>-----localStorage------</div>
    <div class="debug__item">
      localStorage: {{ localStorageValue }}
      <Button @click="onCopy(localStorageValue)">copy localStorage</Button>
      <Button @click="onClearCache">clear cache</Button>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapGetters, mapState } from 'vuex'
import { chainIdHexToNumber } from 'wallet-sdk-js'
import {
  copyText,
  isMobile,
  isMobileDevices,
  loadScript,
  mmJsonHashAndChainIdHex
} from '~/modules/tools'
import { IConnectedAccount, ME_KEYS } from '~/store/me'
import config from '~~/config'

export default Vue.extend({
  name: 'Debug',
  layout: 'empty',
  data () {
    return {
      ethereumStatic: '',
      mmJson: '{"types":{"EIP712Domain":[{"name":"chainId","type":"uint256"},{"name":"name","type":"string"},{"name":"verifyingContract","type":"address"},{"name":"version","type":"string"}],"Action":[{"name":"action","type":"string"},{"name":"params","type":"string"}],"Cell":[{"name":"capacity","type":"string"},{"name":"lock","type":"string"},{"name":"type","type":"string"},{"name":"data","type":"string"},{"name":"extraData","type":"string"}],"Transaction":[{"name":"DAS_MESSAGE","type":"string"},{"name":"inputsCapacity","type":"string"},{"name":"outputsCapacity","type":"string"},{"name":"fee","type":"string"},{"name":"action","type":"Action"},{"name":"inputs","type":"Cell[]"},{"name":"outputs","type":"Cell[]"},{"name":"digest","type":"bytes32"}]},"primaryType":"Transaction","domain":{"chainId":5,"name":"da.systems","verifyingContract":"0x0000000000000000000000000000000020210722","version":"1"},"message":{"DAS_MESSAGE":"TRANSFER FROM 0x54366bcd1e73baf55449377bd23123274803236e(906.74221046 CKB) TO ckt1qyqvsej8jggu4hmr45g4h8d9pfkpd0fayfksz44t9q(764.13228446 CKB), 0x54366bcd1e73baf55449377bd23123274803236e(142.609826 CKB)","inputsCapacity":"906.74221046 CKB","outputsCapacity":"906.74211046 CKB","fee":"0.0001 CKB","digest":"0x29cd28dbeb470adb17548563ceb4988953fec7b499e716c16381e5ae4b04021f","action":{"action":"transfer","params":"0x00"},"inputs":[],"outputs":[]}}',
      mmHash: '',
      signDataRes: '' as (string | Error | undefined),
      hexString: '0xtest',
      personalSignRes: ''
    }
  },
  computed: {
    isMobile,
    isMobileDevices,
    ...mapState({
      me: ME_KEYS.namespace
    }),
    ...mapGetters({
      computedChainId: ME_KEYS.computedChainId
    }),
    connectedAccount (): IConnectedAccount {
      return this.me.connectedAccount
    },
    ethereumComputed (): string {
      console.log('--------ethereumComputed---------')
      console.log(window.ethereum)
      console.log('-----------------')
      return window.ethereum || {}
    },
    userAgent (): string {
      return window.navigator.userAgent
    },
    origin (): string {
      return window.location.origin
    },
    localStorageValue (): string {
      return localStorage.getItem(config.appNmae + 'v2') || ''
    }
  },
  beforeMount () {
    loadScript('//cdn.jsdelivr.net/npm/eruda', 'eruda').then(() => {
      window.eruda.init()
      this.ethereumStatic = window.ethereum || {}
      console.log('--------beforeMount---------')
      console.log(this.ethereumStatic)
      console.log('-----------------')

      setTimeout(() => {
        console.log('--------setTimeout---------')
        console.log(window.ethereum)
        console.log('-----------------')
      }, 10000)
    })
  },
  methods: {
    chainIdHexToNumber,
    async signEIP712 () {
      const _mmJson = JSON.parse(this.mmJson)
      _mmJson.domain.chainId = this.computedChainId
      try {
        const { ethereum } = window
        const res = await ethereum.request({
          method: 'eth_signTypedData_v4',
          params: [this.connectedAccount.address, JSON.stringify(_mmJson)],
          from: this.connectedAccount.address
        })
        this.signDataRes = res
        this.mmHash = mmJsonHashAndChainIdHex(_mmJson, _mmJson.domain.chainId)
      }
      catch (err) {
        console.error(err)
        window.alert(err)
      }
    },
    async personalSign () {
      try {
        const { ethereum } = window
        const res = await ethereum.request({
          method: 'personal_sign',
          params: [this.hexString, this.connectedAccount.address]
        })
        if (res) {
          this.personalSignRes = res
        }
      }
      catch (err) {
        console.error(err)
        window.alert(err)
      }
    },
    onCopy (value: string) {
      copyText(value).then(() => {
        this.$toast('👌 ' + this.$tt('Copied'))
      })
    },
    onClearCache () {
      localStorage.removeItem(config.appNmae + 'v2')
      window.location.href = config.domain
    }
  }
})
</script>

<style lang="scss">
@import 'src/assets/variables';

.debug {
  flex: 1;
  padding: 12px 12px 0 12px;
  word-break: break-all;
}

.debug__item {
  margin-bottom: 12px;
}

.debug__value {
  color: $error-color
}
</style>
