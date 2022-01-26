<template>
  <div>
    <Dialog
      :showing="showing"
      :title="loggedIn ? $tt('Switch wallet') : $tt('Connect wallet')"
      closeButton
      @close="onClose"
    >
      <div v-if="!config.isProdData" class="wallets-connect__test-tip">
        <div class="wallets-connect__test-tip__container margin-bottom-12">
          <span class="wallets-connect__test-tip__icon">💡</span>
          {{ $tt('ETH wallets switch to Goerli test network before connecting') }}
        </div>
        <div class="wallets-connect__test-tip__container margin-bottom-12">
          <span class="wallets-connect__test-tip__icon">💡</span>
          {{ $tt('TRON wallets switch to Nile test network before connecting') }}
        </div>
        <div class="wallets-connect__test-tip__container margin-bottom-12">
          <span class="wallets-connect__test-tip__icon">💡</span>
          {{ $tt('BSC wallets switch to Testnet before connecting') }}
        </div>
        <div class="wallets-connect__test-tip__container">
          <span class="wallets-connect__test-tip__icon">💡</span>
          {{ $tt('Polygon wallets switch to Testnet before connecting') }}
        </div>
      </div>
      <div
        v-if="tutorialsShowing"
        class="wallets-connect__tutorials"
      >
        <span class="wallets-connect__tutorials__emoji">💡</span>
        <div>
          <div>{{ $tt('This is a non-wallet environment, so we recommend using it through the wallet App for a better experience.') }}</div>
          <a
            class="wallets-connect__tutorials__link"
            :href="i18n.locale === 'zh-CN' ? 'https://mp.weixin.qq.com/s/m-oIZOKwHkGbu6QkchgtwA' : 'https://dasystems.medium.com/das-is-now-listed-on-tokenpocket-a05bcfdf0484'"
            target="_blank"
          >{{ $tt('Learn how to use') }} →</a>
        </div>
      </div>
      <div class="wallets-connect__cross-chain-tips">{{ $tt('Powerful cross-chain capability is a unique feature of DAS, which means you can register and use DAS in multiple public chain environments. Please select the public chain you are currently using.') }}</div>
      <ul class="wallets-connect__select-wallet-list">
        <li
          v-for="wallet in walletList"
          :key="wallet.name"
          class="wallets-connect__select-wallet-list__item"
          :class="{ [wallet.name]: true, 'wallets-connect__select-wallet-list__no-support': !wallet.supported }"
          @click="onLogin(wallet)"
        >
          <span class="wallets-connect__select-wallet-list__wallet-info">
            <span v-if="wallet.logo">
              <IconImage
                class="wallets-connect__select-wallet-list__logo"
                :url="wallet.logo"
                :alt="wallet.name"
                :size="32"
              />
            </span>
            <span v-else>
              <Iconfont
                class="wallets-connect__select-wallet-list__logo"
                :name="wallet.icon"
                size="32"
              />
            </span>
            {{ wallet.title }}
          </span>
          <span>
            <Iconfont size="12" name="arrow-right" color="#000000" />
          </span>
        </li>
      </ul>
      <span slot="action" />
    </Dialog>
    <Dialog
      :showing="tipsShowing"
      :title="$tt('Tips')"
      :actionButtonText="$tt('Understand, Continue')"
      @close="onCloseTips"
    >
      <div class="wallets-connect__hardware-wallet__title">
        {{ $tt('DO NOT use DAS with ANY hardware wallet!') }}
      </div>
      <div class="wallets-connect__hardware-wallet__content">
        {{ $tt('Since most hardware wallets have incompatibility problems.') }}
      </div>
    </Dialog>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import VueI18n, { IVueI18n } from 'vue-i18n'
import { mapState, Store } from 'vuex'
import config from '~~/config'
import IconImage from '~/components/icon/IconImage.vue'
import Iconfont from '~/components/icon/Iconfont.vue'
import { IAlertOptions } from '~/plugins/alert'
import { WALLETS } from '~/constant'
import { ME_KEYS } from '~/store/me'
import { isMobileDevices } from '~/modules/tools'
import Dialog from '~/components/Dialog.vue'
import { COMMON_KEYS } from '~/store/common'

interface IWallet {
  title: string,
  name: string,
  supported: boolean,
  logo?: string,
  icon?: string,
  link?: string,
}

export const EVENT = {
  abcWalletConnect: 'abcWalletConnect',
  metaMaskConnect: 'metaMaskConnect',
  bscWalletConnect: 'bscWalletConnect',
  polygonWalletConnect: 'polygonWalletConnect',
  walletConnectConnect: 'walletConnectConnect',
  coinbaseWalletConnect: 'coinbaseWalletConnect',
  tronLinkConnect: 'tronLinkConnect',
  close: 'close',
}

export default Vue.extend({
  name: 'WalletsConnect',
  components: {
    Iconfont,
    IconImage,
    Dialog
  },
  model: {
    prop: 'showing',
    event: 'close'
  },
  props: {
    showing: {
      type: Boolean,
      required: false
    },
    i18n: {
      type: Object as PropType<VueI18n & IVueI18n>,
      default: () => (({} as VueI18n & IVueI18n))
    },
    $tt: {
      type: Function as PropType<(key: string, params?: Record<string, string| number>) => string>,
      required: true
    },
    $alert: {
      type: Function as PropType<(options: IAlertOptions) => void>,
      default: () => {}
    },
    $toast: {
      type: Function as PropType<(message: string, duration?: number) => void>,
      default: () => {}
    },
    $store: {
      type: Object as PropType<Store<any>>,
      default: () => ({} as Store<any>)
    },
    $gtag: {
      type: Function as PropType<(type: string, action: string, option: { [key: string]: any }) => void>,
      required: true
    }
  },
  data () {
    return {
      config,
      tutorialsShowing: false
    }
  },
  computed: {
    isMobileDevices,
    ...mapState({
      me: ME_KEYS.namespace,
      common: COMMON_KEYS.namespace
    }),
    loggedIn (): boolean {
      return this.me.loggedIn
    },
    tipsShowing (): boolean {
      return this.common.hardwareWalletTipsShow
    },
    walletList (): IWallet[] {
      const walletConnect: IWallet = {
        title: WALLETS.walletConnect,
        name: WALLETS.walletConnect,
        logo: '/images/components/walletConnect-wallet-logo.png',
        supported: true
      }

      const tronLink: IWallet = {
        title: (this.$tt('Connect Tron environment') as string),
        name: WALLETS.tronLink,
        icon: 'tron',
        supported: true
      }

      const metaMask: IWallet = {
        title: (this.$tt('Connect ETH environment') as string),
        name: WALLETS.metaMask,
        icon: 'ethereum',
        supported: true
      }

      const bscWallet: IWallet = {
        title: (this.$tt('Connect BSC environment') as string),
        name: WALLETS.bscWallet,
        icon: 'binance-smart-chain',
        supported: true
      }

      const polygonWallet: IWallet = {
        title: (this.$tt('Connect Polygon environment') as string),
        name: WALLETS.polygonWallet,
        icon: 'polygon',
        supported: true
      }

      return [metaMask, tronLink, bscWallet, polygonWallet]
    }
  },
  mounted () {
    window.setTimeout(() => {
      const { tronWeb, ethereum } = window
      if (this.isMobileDevices && typeof tronWeb === 'undefined' && typeof ethereum === 'undefined') {
        this.tutorialsShowing = true
      }
    }, 1500)
  },
  methods: {
    onLogin (wallet: IWallet) {
      if (wallet.link) {
        window.open(wallet.link)
        return
      }

      if (!wallet.supported) {
        this.$toast(this.$tt('Coming soon'))
        return
      }

      this.$gtag('event', 'click', {
        event_category: 'connect wallet',
        event_label: wallet.name,
        value: 1
      })

      switch (wallet.name) {
        case WALLETS.abcWallet:
          this.$emit(EVENT.abcWalletConnect)
          break
        case WALLETS.metaMask:
          this.$emit(EVENT.metaMaskConnect)
          break
        case WALLETS.bscWallet:
          this.$emit(EVENT.bscWalletConnect)
          break
        case WALLETS.polygonWallet:
          this.$emit(EVENT.polygonWalletConnect)
          break
        case WALLETS.walletConnect:
          localStorage.removeItem('walletconnect')
          this.$emit(EVENT.walletConnectConnect)
          break
        case WALLETS.coinbaseWallet:
          this.$emit(EVENT.coinbaseWalletConnect)
          break
        case WALLETS.tronLink:
          this.$emit(EVENT.tronLinkConnect)
          break
      }
    },
    onCloseTips () {
      this.$store?.commit(COMMON_KEYS.setHardwareWalletTipsShow, false)
    },
    onClose () {
      this.$emit(EVENT.close, false)
    }
  }
})
</script>

<style lang="scss">
@import 'src/assets/variables';

.wallets-connect__test-tip {
  margin-bottom: 18px;
  padding: 10px;
  color: $error-font-color;
  font-weight: bold;
  background: rgba(223, 74, 70, 0.1);
  border-radius: 10px;
}

.wallets-connect__test-tip__container {
  display: flex;

  &.margin-bottom-12 {
    margin-bottom: 12px;
  }
}

.wallets-connect__test-tip__icon {
  margin-right: 4px;
}

.wallets-connect__cross-chain-tips {
  color: #636D85;
}

.wallets-connect__select-wallet-list {
  margin: 16px 0;
  max-height: 318px;
  overflow-y: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
    width: 0 !important;
  }
}

.wallets-connect__select-wallet-list__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 16px;
  border-radius: 12px;
  margin-bottom: 8px;
  cursor: pointer;

  &.MetaMask {
    background: #FFFFFF linear-gradient(270deg, #E8EEFF 0%, #CDD5FF 100%);

    &:hover {
      background: #FFFFFF linear-gradient(270deg, #E8EEFF 0%, #CDD5FF 50%);
    }
  }

  &.bscWallet {
    background: #FFFFFF linear-gradient(270deg, #FDF8F1 0%, #FFEBC1 100%);

    &:hover {
      background: #FFFFFF linear-gradient(270deg, #FDF8F1 0%, #FFEBC1 50%);
    }
  }

  &.TronLink {
    background: #FFFFFF linear-gradient(270deg, #F8FDF1 0%, #FFCED4 100%);

    &:hover {
      background: #FFFFFF linear-gradient(270deg, #F8FDF1 0%, #FFCED4 50%);
    }
  }

  &.WalletConnect {
    background: #FFFFFF linear-gradient(270deg, #E3FFF7 0%, #CEEDFF 100%);

    &:hover {
      background: #FFFFFF linear-gradient(270deg, #E3FFF7 0%, #CEEDFF 50%);
    }
  }

  &.polygonWallet {
    background: #FFFFFF linear-gradient(270deg, #F9E8FF 0%, #E7CDFF 100%);

    &:hover {
      background: #FFFFFF linear-gradient(270deg, #F9E8FF 0%, #E7CDFF 50%);
    }
  }
}

.wallets-connect__select-wallet-list__no-support {
  filter: grayscale(100%);
  cursor: no-drop;
  color: $assist-font-color;
}

.wallets-connect__select-wallet-list__logo {
  margin-right: 12px;
}

.wallets-connect__select-wallet-list__wallet-info {
  display: flex;
  align-items: center;
  font-size: $font-size-18;
  font-weight: bold;
  line-height: 21px;
}

.wallets-connect__tutorials {
  margin-bottom: 18px;
  padding: 16px 12px;
  display: flex;
  font-size: 16px;
  font-weight: 600;
  color: $primary-font-color;
  line-height: 22px;
  background: #F6F7F9;
  border-radius: 16px;
}

.wallets-connect__tutorials__emoji {
  margin-right: 8px;
}

.wallets-connect__tutorials__link {
  display: inline-block;
  font-size: 14px;
  font-weight: 600;
  color: $link-font-color;
  line-height: 20px;
  margin-top: 12px;
}

.wallets-connect__hardware-wallet__title {
  color: $error-font-color;
  text-align: center;
  font-weight: 600;
  margin-bottom: 12px;
}

.wallets-connect__hardware-wallet__content {
  text-align: center;
}
</style>
