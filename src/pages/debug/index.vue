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
    <div>-----------</div>
    <div class="debug__item">
      ethereumStatic
      <div>isMetaMask: <span class="debug__value">{{ ethereumStatic.isMetaMask }}</span></div>
      <div>isImToken: <span class="debug__value">{{ ethereumStatic.isImToken }}</span></div>
      <div>isHbWallet: <span class="debug__value">{{ ethereumStatic.isHbWallet }}</span></div>
      <div>selectedAddress: <span class="debug__value">{{ ethereumStatic.selectedAddress }}</span></div>
      <div>networkVersion: <span class="debug__value">{{ ethereumStatic.networkVersion }}</span></div>
      <div>chainId: <span class="debug__value">{{ ethereumStatic.chainId }}</span></div>
    </div>
    <div>-----------</div>
    <div class="debug__item">
      ethereumComputed
      <div>isMetaMask: <span class="debug__value">{{ ethereumComputed.isMetaMask }}</span></div>
      <div>isImToken: <span class="debug__value">{{ ethereumComputed.isImToken }}</span></div>
      <div>isHbWallet: <span class="debug__value">{{ ethereumComputed.isHbWallet }}</span></div>
      <div>selectedAddress: <span class="debug__value">{{ ethereumComputed.selectedAddress }}</span></div>
      <div>networkVersion: <span class="debug__value">{{ ethereumComputed.networkVersion }}</span></div>
      <div>chainId: <span class="debug__value">{{ ethereumComputed.chainId }}</span></div>
    </div>
    <div class="debug__item">
      userAgent: <span class="debug__value">{{ userAgent }}</span>
    </div>
    <div>
      mmJson: <input v-model="mmJson" /> <button @click="sign" >sign</button>
    </div>
    <div>
      Result: {{ signDataRes }}
    </div>
    <div class="debug__item">
      mmHash: {{ mmHash }}
    </div>
    <div>-----------</div>
    <div class="debug__item">
      localStorage: {{ localStorageValue }}
      <Button @click="onCopy(localStorageValue)">copy localStorage</Button>
      <Button @click="onClearCache">clear cache</Button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api'
import { copyText, isMobile, isMobileDevices, loadScript, mmJsonHashAndChainIdHex } from '~/modules/tools'
import config from '~~/config'

export default defineComponent({
  name: 'Debug',
  layout: 'empty',
  data () {
    return {
      ethereumStatic: '',
      mmJson: '',
      mmHash: '',
      signDataRes: '' as (string | Error | undefined)
    }
  },
  computed: {
    isMobile,
    isMobileDevices,
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
      return localStorage.getItem(config.appNmae) || ''
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
    async sign () {
      const _mmJson = JSON.parse(this.mmJson)
      try {
        this.signDataRes = await this.$walletSdk.signData(_mmJson, true)
        this.mmHash = mmJsonHashAndChainIdHex(_mmJson, _mmJson.domain.chainId)
      }
      catch (err) {
        window.alert(err)
      }
    },
    onCopy (value: string) {
      copyText(value).then(() => {
        this.$toast('👌 ' + this.$tt('Copied'))
      })
    },
    onClearCache () {
      localStorage.removeItem(config.appNmae)
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
