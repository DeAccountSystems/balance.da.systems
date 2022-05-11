<template>
  <div>
    <Dialog
      :showing="showing"
      :title="loggedIn ? $tt('Switch wallet') : $tt('Connect wallet')"
      closeButton
      @close="onClose"
    >
      <div class="wallets-connect__cross-chain-tips">
        {{ $tt('Powerful cross-chain capability is a unique feature of DAS, which means you can register and use DAS in multiple public chain environments. Please select the public chain you are currently using.') }}
      </div>
      <ul class="wallets-connect__select-wallet-list">
        <li
          v-for="(wallet, index) in walletList"
          :key="index"
          class="wallets-connect__select-wallet-list__item"
          :class="wallet.symbol"
          @click="onConnect(wallet)"
        >
          <div class="wallets-connect__select-wallet-list__wallet-info">
            <span class="wallets-connect__select-wallet-list__logo">
              <Iconfont
                :name="wallet.icon"
                size="32"
              />
            </span>
            <div>
              {{ wallet.title }}
              <div
                v-if="wallet.protocol === WalletProtocol.tronLink"
                class="wallets-connect__tronlink__tips"
              >
                {{ $tt('Only supported in imToken, TokenPocket, TronLink') }}
              </div>
            </div>
          </div>
          <span class="wallets-connect__select-wallet-list__arrow">
            <span
              v-if="wallet.name === currentLogin"
              class="wallets-connect__select-wallet-list__loading-icon"
            >
              <Iconfont
                name="loading"
                color="#11142d"
                size="24"
              />
            </span>
            <Iconfont
              v-else
              size="12"
              name="arrow-right"
              color="#11142D"
            />
          </span>
        </li>
      </ul>
      <div class="wallets-connect__select-wallet-list__torus-label">
        {{ $tt('Connect with social.') }}
        <a
          class="wallets-connect__select-wallet-list__torus-faq"
          :href="i18n.locale === LANGUAGE.zhCN ? 'https://talk.did.id/t/twitter-bit/449' : 'https://talk.did.id/t/how-to-register-a-bit-account-using-my-email-twitter-etc/448'"
          target="_blank"
        >{{ $tt('Guide') }}</a>
      </div>
      <div class="wallets-connect__select-wallet-list__torus-container">
        <span
          v-for="(item, index) in torusList"
          :key="index"
          class="wallets-connect__select-wallet-list__torus-item"
          @click="onConnectWithTorus(item)"
        >
          <span
            v-if="item === currentLogin"
            class="wallets-connect__select-wallet-list__loading-icon wallets-connect__select-wallet-list__torus-item__loading"
          >
            <Iconfont
              name="loading"
              color="#A0A1AB"
              size="28"
            />
          </span>
          <Iconfont
            class="wallets-connect__select-wallet-list__torus-item__logo"
            :name="item"
            size="28"
          />
        </span>
      </div>
      <span slot="action" />
    </Dialog>
    <Dialog
      :showing="hardwareWalletTipsShowing"
      :title="$tt('Tips')"
      :actionButtonText="$tt('Understand, Continue')"
      @close="closeHardwareWalletTips"
    >
      <div class="wallets-connect__hardware-wallet__title">
        {{ $tt('DO NOT use .bit with ANY hardware wallet except Ledger!') }}
      </div>
      <div class="wallets-connect__hardware-wallet__content">
        {{ $tt('Since most hardware wallets have incompatibility problems.') }}
      </div>
    </Dialog>
    <Dialog
      :showing="torusLoginSuccessTipsShowing"
      closeButton
      :title="$tt('Connected')"
      :actionButtonText="$tt('OK')"
      @close="closeTorusLoginSuccessTips"
    >
      <div>
        {{ $tt('Your Torus wallet is connected. Now, you can register or manage your .bit account!') }}
        <a
          class="wallets-connect__select-wallet-list__torus-faq"
          :href="i18n.locale === LANGUAGE.zhCN ? 'https://talk.did.id/t/twitter-bit/449' : 'https://talk.did.id/t/how-to-register-a-bit-account-using-my-email-twitter-etc/448'"
          target="_blank"
        >{{ $tt('Guide') }}</a>
      </div>
    </Dialog>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import VueI18n, { IVueI18n } from 'vue-i18n'
import { mapState, Store } from 'vuex'
import Iconfont from '~/components/icon/Iconfont.vue'
import { IAlertOptions } from '~/plugins/alert'
import { WalletProtocol } from '~/constant'
import { IConnectedAccount, ME_KEYS } from '~/store/me'
import config from '~~/config'
import Dialog from '~/components/Dialog.vue'
import { COMMON_KEYS } from '~/store/common'
import { BSC, CoinTypeToChainMap, ETH, EvmCoinTypes, Polygon, TRON } from '~/constant/chain'
import { LANGUAGE } from '~/constant/language'

export default Vue.extend({
  name: 'WalletsConnect',
  components: {
    Iconfont,
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
  computed: {
    ...mapState({
      me: ME_KEYS.namespace,
      common: COMMON_KEYS.namespace
    }),
    loggedIn (): boolean {
      return !!this.me.connectedAccount.address
    },
    hardwareWalletTipsShowing (): boolean {
      return this.common.hardwareWalletTipsShow
    },
    torusLoginSuccessTipsShowing (): boolean {
      return !!this.common.torusLoginSuccessTipsShow
    },
    connectedAccount (): IConnectedAccount {
      return this.me.connectedAccount
    }
  },
  data () {
    const torusList = ['google', 'twitter', 'discord', 'facebook', 'torus']

    const walletList = [{
      ...ETH,
      title: (this.$tt('Connect ETH environment') as string),
      protocol: WalletProtocol.metaMask
    }, {
      ...BSC,
      title: (this.$tt('Connect BSC environment') as string),
      protocol: WalletProtocol.metaMask
    }, {
      ...Polygon,
      title: (this.$tt('Connect Polygon environment') as string),
      protocol: WalletProtocol.metaMask
    }, {
      ...TRON,
      title: (this.$tt('Connect Tron environment') as string),
      protocol: WalletProtocol.tronLink
    }]

    return {
      LANGUAGE,
      walletList,
      torusList,
      WalletProtocol,
      config,
      currentLogin: ''
    }
  },
  beforeDestroy () {
    this.currentLogin = ''
  },
  methods: {
    onConnect (wallet: any) {
      if (this.currentLogin) {
        return
      }
      this.$gtag('event', 'click', {
        event_category: 'connect wallet',
        event_label: wallet.symbol,
        value: 1
      })

      this.$emit('connect', {
        chain: CoinTypeToChainMap[wallet.coinType],
        protocol: wallet.protocol
      })
      this.currentLogin = wallet.name
    },
    onConnectWithTorus (social: any) {
      if (this.currentLogin) {
        return
      }
      this.$gtag('event', 'click', {
        event_category: 'connect wallet',
        event_label: WalletProtocol.torus,
        value: 1
      })

      const coinType = this.connectedAccount.chain?.coinType
      let chain
      if (coinType && EvmCoinTypes.includes(coinType)) {
        chain = CoinTypeToChainMap[coinType]
      }

      this.$emit('connect', {
        chain: chain || ETH,
        protocol: WalletProtocol.torus
      })
      this.currentLogin = social
    },
    closeHardwareWalletTips () {
      this.$store?.commit(COMMON_KEYS.setHardwareWalletTipsShow, false)
    },
    closeTorusLoginSuccessTips () {
      this.$store?.commit(COMMON_KEYS.setTorusLoginSuccessTipsShow, false)
    },
    onClose () {
      this.$emit('close', false)
      this.currentLogin = ''
    }
  }
})
</script>

<style lang="scss">
@import "src/assets/variables";

.wallets-connect__cross-chain-tips {
  font-size: 14px;
  font-weight: 400;
  color: $primary-font-color;
  line-height: 16px;
}

.wallets-connect__select-wallet-list {
  margin-top: 32px;
}

.wallets-connect__select-wallet-list__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 16px;
  border-radius: 12px;
  margin-bottom: 8px;
  cursor: pointer;

  &.ETH {
    background: #EFF2FD;

    &:hover {
      background: rgba(239, 242, 253, 0.5);
    }
  }

  &.BNB {
    background: #FEF8E7;

    &:hover {
      background: rgba(254, 248, 231, 0.5);
    }
  }

  &.MATIC {
    background: #F2EDFC;

    &:hover {
      background: rgba(242, 237, 252, 0.5);
    }
  }

  &.TRX {
    background: #FDE6E9;

    &:hover {
      background: rgba(253, 230, 233, 0.5);
    }
  }
}

.wallets-connect__select-wallet-list__logo {
  margin-right: 16px;
}

.wallets-connect__select-wallet-list__wallet-info {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  color: $primary-font-color;
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

.wallets-connect__tronlink__tips {
  margin-top: 4px;
  font-weight: 400;
  font-size: 12px;
  color: $primary-font-color;
}

.wallets-connect__select-wallet-list__arrow {
  display: inline-block;
  min-width: 24px;
  min-height: 24px;
}

.wallets-connect__select-wallet-list__torus-label {
  margin: 32px 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: #5C6063;
  line-height: 16px;
  text-align: center;
}

.wallets-connect__select-wallet-list__torus-faq {
  color: #0E7DFF;
}

.wallets-connect__select-wallet-list__torus-container {
  margin-bottom: 48px;
  padding: 0 16px;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-column-gap: 8px;
  border-radius: 9px;
  border: 1px solid #F3F3F3;

  &:hover {
    background: #F9FBFC;
  }
}

.wallets-connect__select-wallet-list__torus-item {
  position: relative;
  padding-bottom: 100%;
  cursor: pointer;
}

.wallets-connect__select-wallet-list__torus-item__logo {
  position: absolute;
  margin: auto;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}

.wallets-connect__select-wallet-list__loading-icon {
  svg {
    animation: rotate360DegAnimation 0.9s linear infinite;
  }
}

.wallets-connect__select-wallet-list__torus-item__loading {
  position: absolute;
  margin: auto;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  width: 28px;
  height: 28px;
  background: rgb(232 238 244 / 85%);
  border-radius: 50%;
  z-index: 2;
}
</style>
