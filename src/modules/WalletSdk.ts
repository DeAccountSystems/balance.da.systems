import { Context } from '@nuxt/types'
import Vue from 'vue'
import Wallets, { chainIdHexToNumber } from 'wallet-sdk-js'
import { TranslateResult } from 'vue-i18n'
import debounce from 'lodash.debounce'
import WalletsConnect from '~/components/WalletsConnect.vue'
import { WalletProtocol } from '~/constant'
import {
  ChainId,
  ChainIdToCoinTypeMap,
  CKB,
  CoinType,
  CoinTypeToChainIdMap,
  CoinTypeToChainMap,
  CoinTypeToTorusHostMap,
  EvmCoinTypes
} from '~/constant/chain'
import errno from '~/constant/errno'
import { isMobileDevices, shrinkUnit, sleep } from '~/modules/tools'
import { ME_KEYS } from '~/store/me'
import { ckbNode, isProdData } from '~~/config'
import { COMMON_KEYS } from '~/store/common'

interface ISendTrxParams {
  to: string,
  value: string,
  data: string,
}

export default class WalletSdk {
  context: Context
  walletsConnectInstance: Vue
  protocol: WalletProtocol
  coinType: CoinType
  chainId: ChainId
  wallet: Wallets
  torusWallet: any

  constructor (context: Context) {
    this.context = context
    if (!this.walletsConnectInstance) {
      this.walletsConnectInstance = new WalletsConnect({
        propsData: {
          showing: false,
          i18n: this.context.app.i18n,
          $tt: this.context.app.$tt,
          $alert: this.context.app.$alert,
          $toast: this.context.app.$toast,
          $store: this.context.app.store,
          $gtag: this.context.app.$gtag
        }
      })

      this.walletsConnectInstance.$on('close', () => {
        this.closeWalletsConnect()
      })
      this.walletsConnectInstance.$on('connect', (params: any) => {
        this.protocol = params.protocol
        this.coinType = params.chain.coinType
        this.onConnect(true)
      })
      const _div = document.createElement('div')
      document.body.appendChild(_div)
      this.walletsConnectInstance.$mount(_div)
    }
  }

  reloadPage = debounce(function () {
    window.location.reload()
  }, 1000)

  getAccountFailedAlert () {
    const { $tt, $alert } = this.context.app
    $alert({
      title: $tt('Error'),
      message: $tt('Failed to get an account')
    })
  }

  removeProviderAllListeners (provider: any) {
    provider.removeAllListeners('accountsChanged')
    provider.removeAllListeners('chainChanged')
    provider.removeAllListeners('message')
  }

  evmChainIdErrorAlert (coinType: CoinType) {
    const { $tt, $alert } = this.context.app
    let message: TranslateResult = ''
    switch (coinType) {
      case CoinType.eth:
        message = isProdData ? $tt('Please switch your wallet to the Ethereum main network before connecting') : $tt('Please switch your wallet to the Goerli test network before connecting')
        break
      case CoinType.bnb:
        message = isProdData ? $tt('Please switch your wallet to the BSC main network before connecting') : $tt('Please switch your wallet to the BSC Testnet before connecting')
        break
      case CoinType.matic:
        message = isProdData ? $tt('Please switch your wallet to the Polygon Mainnet before connecting') : $tt('Please switch your wallet to the Polygon Testnet before connecting')
        break
    }

    if (message) {
      $alert({
        title: $tt('Error'),
        message: message as string
      })
    }
  }

  evmProviderListenEvents (provider: any) {
    const { store } = this.context.app
    provider.on('accountsChanged', (accounts: string[]) => {
      const connectedAccount = store?.state.me.connectedAccount
      const address = connectedAccount.address
      const account = accounts && accounts[0]

      if (account && account.toLowerCase() === address.toLowerCase()) {
        return
      }

      if (account) {
        store?.commit(ME_KEYS.setConnectedAccount, {
          address: account
        })
      }
      this.reloadPage()
    })

    provider.on('chainChanged', (chainId: string) => {
      const _chainId = chainIdHexToNumber(chainId)
      const _coinType = ChainIdToCoinTypeMap[_chainId]

      if (_chainId !== CoinTypeToChainIdMap[_coinType]) {
        this.evmChainIdErrorAlert(_coinType)
      }

      if (_coinType) {
        const chain = CoinTypeToChainMap[_coinType]
        store?.commit(ME_KEYS.setConnectedAccount, {
          chain
        })
        this.chainId = _chainId
        this.coinType = _coinType
      }
    })
  }

  async onConnect (ignoreNoLoginPage = false) {
    const { $tt, $alert, store } = this.context.app
    // no login page
    // const noLoginPage = []
    // if (!ignoreNoLoginPage && noLoginPage.includes(this.context.route.name as string)) {
    //   this.walletsConnectResetCurrentLogin()
    //   return
    // }

    try {
      if (typeof this.protocol === 'undefined') {
        this.protocol = store?.state.me.connectedAccount.protocol
      }
      if (typeof this.coinType === 'undefined') {
        this.coinType = store?.state.me.connectedAccount.chain?.coinType
      }
      this.chainId = CoinTypeToChainIdMap[this.coinType]

      let provider
      if (this.protocol === WalletProtocol.metaMask) {
        if (this.torusWallet) {
          this.torusWallet.hideTorusButton()
        }
        await sleep(1000)
        const { ethereum } = window
        if (typeof ethereum !== 'undefined') {
          provider = ethereum
        }
        else if (isMobileDevices()) {
          this.walletsConnectResetCurrentLogin()
          this.getAccountFailedAlert()
          return
        }
        else {
          this.walletsConnectResetCurrentLogin()
          $alert({
            title: $tt('Tips'),
            message: ($tt('Please install MetaMask!') as string)
          })
          return
        }
      }
      else if (this.protocol === WalletProtocol.torus) {
        const Torus = await import('@toruslabs/torus-embed')
        this.torusWallet = new Torus.default({
          buttonPosition: 'bottom-right'
        })
        try {
          const host = CoinTypeToTorusHostMap[this.coinType]
          if (!this.torusWallet.isLoggedIn) {
            await this.torusWallet.init({
              showTorusButton: true,
              network: {
                host
              }
            })
            await this.torusWallet.login()
          }
          provider = this.torusWallet.ethereum
        }
        catch (err: any) {
          console.error(err)
          this.torusWallet.hideTorusButton()
          if (err.message !== 'User cancelled login') {
            this.getAccountFailedAlert()
          }
          this.walletsConnectResetCurrentLogin()
          return
        }
      }
      else if (this.protocol === WalletProtocol.tronLink) {
        if (this.torusWallet) {
          this.torusWallet.hideTorusButton()
        }
        await sleep(1000)
        const { tronWeb } = window
        if (typeof tronWeb !== 'undefined') {
          if (tronWeb.ready) {
            provider = tronWeb
          }
          else {
            this.walletsConnectResetCurrentLogin()
            $alert({
              title: $tt('Tips'),
              message: $tt('Please try again after unlocking your TronLink wallet')
            })
            return
          }
        }
        else if (isMobileDevices()) {
          this.walletsConnectResetCurrentLogin()
          this.getAccountFailedAlert()
          return
        }
        else {
          this.walletsConnectResetCurrentLogin()
          $alert({
            title: $tt('Tips'),
            message: $tt('Please install TronLink!')
          })
          return
        }
      }

      if (typeof provider !== 'undefined' && typeof this.coinType !== 'undefined' && this.protocol) {
        this.wallet = new Wallets({
          provider,
          coinType: this.coinType,
          // @ts-expect-error
          chainId: this.chainId,
          walletProtocol: this.protocol
        })
        const res = await this.wallet.connect()
        if (!res || !res.address) {
          this.getAccountFailedAlert()
          this.walletsConnect()
          this.walletsConnectResetCurrentLogin()
          return
        }
        else if (this.protocol === WalletProtocol.metaMask) {
          this.removeProviderAllListeners(provider)
          if (res.chainId && String(res.chainId) !== String(this.chainId)) {
            try {
              await this.wallet.metaMaskSwitchChain(this.chainId)
              store?.commit(ME_KEYS.setConnectedAccount, {
                address: res.address,
                protocol: this.protocol,
                chain: CoinTypeToChainMap[this.coinType]
              })
              this.reloadPage()
              return
            }
            catch (err) {
              console.error(err)
            }
          }
          this.evmProviderListenEvents(provider)
        }
        else if (this.protocol === WalletProtocol.torus) {
          this.removeProviderAllListeners(provider)
          this.evmProviderListenEvents(provider)
        }
        else if (this.protocol === WalletProtocol.tronLink) {
          this.removeProviderAllListeners(provider)
          const _tath = this
          window.addEventListener('message', function (e) {
            if (e.data.message && (e.data.message.action === 'setAccount' || e.data.message.action === 'setNode')) {
              _tath.reloadPage()
            }
          })
        }

        if (EvmCoinTypes.includes(this.coinType) && res.chainId !== CoinTypeToChainIdMap[this.coinType]) {
          this.evmChainIdErrorAlert(this.coinType)
          this.walletsConnectResetCurrentLogin()
          return
        }

        const connectedAccount = store?.state.me.connectedAccount
        const address = connectedAccount.address
        store?.commit(ME_KEYS.setConnectedAccount, {
          address: res.address,
          protocol: this.protocol,
          chain: CoinTypeToChainMap[this.coinType]
        })
        this.walletsConnectResetCurrentLogin()
        this.closeWalletsConnect()
        this.torusLoginSuccessTips()
        if (this.torusWallet && this.protocol !== WalletProtocol.torus) {
          this.torusWallet.hideTorusButton()
        }
        if (res.address !== address) {
          this.reloadPage()
        }
        else {
          return true
        }
      }
      else {
        this.walletsConnect()
        this.walletsConnectResetCurrentLogin()
      }
    }
    catch (err: any) {
      console.error(err)
      this.walletsConnectResetCurrentLogin()
      // imtoken wallet error handling
      if (err.message?.includes(errno.imTokenUserCanceled)) {
        this.reloadPage()
      }
      else if (![errno.metaMaskUserRejectedAccountAccess, errno.metaMaskUserDeniedMessageSignature].includes(err.code)) {
        if (err.code === errno.metaMaskWalletRequestPermissions) {
          $alert({
            title: $tt('Tips'),
            message: $tt('Other requests for the wallet are not processed, please try again after processing')
          })
        }
        else {
          $alert({
            title: $tt('Error'),
            message: err.code ? `${err.code}: ${err.message}` : err
          })
        }
      }
    }
  }

  walletsConnect () {
    if (this.walletsConnectInstance) {
      ;(this.walletsConnectInstance as any).showing = true
    }
  }

  closeWalletsConnect () {
    if (this.walletsConnectInstance) {
      ;(this.walletsConnectInstance as any).showing = false
    }
  }

  walletsConnectResetCurrentLogin () {
    if (this.walletsConnectInstance) {
      ;(this.walletsConnectInstance as any).currentLogin = ''
    }
  }

  torusLoginSuccessTips () {
    const { store } = this.context.app
    const torusLoginSuccessTipsShow = store?.state.common.torusLoginSuccessTipsShow
    if (this.protocol === WalletProtocol.torus && torusLoginSuccessTipsShow === undefined) {
      store?.commit(COMMON_KEYS.setTorusLoginSuccessTipsShow, true)
    }
  }

  async signData (data: string | object, isEIP712?: boolean): Promise<string | undefined> {
    const res = await this.onConnect(true)
    if (!res) {
      return
    }
    try {
      const res = await this.wallet.signData(data, isEIP712)
      return res
    }
    catch (err) {
      console.error(err)
      throw err
    }
  }

  async sendTrx (data: ISendTrxParams, isPortalWallet?: boolean): Promise<string | undefined> {
    const res = await this.onConnect(true)
    if (!res) {
      return
    }
    try {
      if (isPortalWallet) {
        const res = await this.metaMaskSendCKBTrx(data)
        return res
      }
      else {
        const res = await this.wallet.sendTrx(data)
        return res
      }
    }
    catch (err) {
      console.error(err)
      throw err
    }
  }

  async ethSign (data: string): Promise<string | undefined> {
    const res = await this.onConnect(true)
    if (!res) {
      return
    }
    try {
      const res = await this.wallet.ethSign(data)
      return res
    }
    catch (err) {
      console.error(err)
      throw err
    }
  }

  async metaMaskSendCKBTrx ({ to, value, data }: ISendTrxParams): Promise<string | undefined> {
    const res = await this.onConnect(true)
    if (!res) {
      return
    }
    try {
      const res = await import('~/modules/DasEthProvider')
      const pwcore = await new res.PW(ckbNode).init(
        new res.DasEthProvider(),
        new res.IndexerCollector(ckbNode)
      )

      const hash = await pwcore.send(
        new res.Address(to, res.AddressType.ckb),
        new res.Amount(shrinkUnit(value, CKB.decimals)),
        {
          data,
          witnessArgs: res.Builder.WITNESS_ARGS.RawSecp256k1
        }
      )
      return hash
    }
    catch (err) {
      console.error(err)
      throw err
    }
  }
}
