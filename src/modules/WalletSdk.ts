import PWCore, { Address, AddressType, Amount, Builder, IndexerCollector } from '@lay2/pw-core'
import { Context } from '@nuxt/types'
import Vue from 'vue'
import WalletsConnect, { EVENT as WalletConnectEvent } from '~/components/WalletsConnect.vue'
import { WalletNameToChain, WALLETS } from '~/constant'
import {
  BSC,
  BSCTestnetChainId,
  CHAIN_ID,
  CKB,
  ETH,
  EthereumGoerliChainId,
  Polygon,
  PolygonTestnetChainId,
  TRON
} from '~/constant/chain'
import errno from '~/constant/errno'
import DasEthProvider from '~/modules/DasEthProvider'
import DasTronProvider from '~/modules/DasTronProvider'
import { chainIdHexToNumber, isMobileDevices, loadScript, shrinkUnit } from '~/modules/tools'
import { ME_KEYS } from '~/store/me'
import config from '~~/config'
import Web3Utils from 'web3-utils'

interface IMetaMaskJsonRpcResponse {
  id: string | undefined,
  jsonrpc: '2.0',
  method: string,
  result?: string,
  error?: Error,
}

interface ISendTrxParams {
  to: string,
  value: string,
  data: string,
}

const TronNileTestNetNode = 'https://api.nileex.io'
const TronGridNetNodes = ['https://api.trongrid.io', 'https://tron-mainnet.token.im', 'https://trx.mytokenpocket.vip']

interface ICodedError extends Error {
  code: number,
}

function onMetaMaskResponse (resolve: (result?: string) => void, reject: (err: Error) => void) {
  return (err: Error, res: IMetaMaskJsonRpcResponse) => {
    if (err) {
      console.error(err)
      reject(err)
    }
    else if (res.error) {
      console.error(res.error)
      reject(res.error)
    }
    else {
      let signData = (res.result as string)

      let v = Number.parseInt(signData.slice(-2), 16)
      if (v >= 27) {
        v -= 27
      }
      signData =
        '0x' +
        signData.slice(2, -2) +
        v.toString(16).padStart(2, '0')

      resolve(signData)
    }
  }
}

export default class WalletSdk {
  context: Context
  walletsConnectInstance: Vue
  walletConnector: any
  walletLinkWeb3: any
  walletName: string

  constructor (context: Context) {
    this.context = context
  }

  init () {
    const { store } = this.context.app
    this.walletName = store?.state.me.connectedAccount.walletName
    const _loggedIn = store?.state.me.loggedIn
    if (!_loggedIn) {
      return
    }
    switch (this.walletName) {
      case WALLETS.metaMask:
      case WALLETS.bscWallet:
      case WALLETS.polygonWallet:
      case WALLETS.walletConnect:
        if (typeof window.ethereum !== 'undefined') {
          void this.metaMaskConnect()
        }
        else {
          store?.commit(ME_KEYS.setLoggedIn, false)
          this.walletsConnect()
        }
        break
      case WALLETS.coinbaseWallet:
        void this.coinbaseWalletConnect()
        break
      case WALLETS.tronLink:
        window.setTimeout(() => {
          if (typeof window.tronWeb !== 'undefined') {
            void this.tronLinkConnect()
          }
          else {
            store?.commit(ME_KEYS.setLoggedIn, false)
            this.walletsConnect()
          }
        }, 1000)
        break
    }
  }

  walletsConnect () {
    // no login page
    const noLoginPage = ['explorer-account-account', 'debug', 'me-award-ranking', 'me-invitation-link-account']
    if (noLoginPage.includes(this.context.route.name as string)) {
      return
    }

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

      this.walletsConnectInstance.$on(WalletConnectEvent.close, () => {
        this.closeWalletsConnect()
      })
      this.walletsConnectInstance.$on(WalletConnectEvent.bscWalletConnect, () => {
        this.walletName = WALLETS.bscWallet
        void this.metaMaskConnect()
      })
      this.walletsConnectInstance.$on(WalletConnectEvent.polygonWalletConnect, () => {
        this.walletName = WALLETS.polygonWallet
        void this.metaMaskConnect()
      })
      this.walletsConnectInstance.$on(WalletConnectEvent.metaMaskConnect, () => {
        this.walletName = WALLETS.metaMask
        void this.metaMaskConnect()
      })
      this.walletsConnectInstance.$on(WalletConnectEvent.walletConnectConnect, () => {
        this.walletName = WALLETS.walletConnect
        void this.walletConnectConnect()
      })
      this.walletsConnectInstance.$on(WalletConnectEvent.coinbaseWalletConnect, () => {
        this.walletName = WALLETS.coinbaseWallet
        void this.coinbaseWalletConnect()
      })
      this.walletsConnectInstance.$on(WalletConnectEvent.tronLinkConnect, () => {
        this.walletName = WALLETS.tronLink
        void this.tronLinkConnect()
      })

      const _div = document.createElement('div')
      document.body.appendChild(_div)
      this.walletsConnectInstance.$mount(_div)
    }

    ;(this.walletsConnectInstance as any).showing = true
  }

  closeWalletsConnect () {
    if (this.walletsConnectInstance) {
      ;(this.walletsConnectInstance as any).showing = false
    }
  }

  async signData (data: string | object, isEIP712?: boolean): Promise<string | undefined> {
    const { store } = this.context.app
    const _walletName = store?.state.me.connectedAccount.walletName
    switch (_walletName) {
      case WALLETS.metaMask:
      case WALLETS.bscWallet:
      case WALLETS.polygonWallet:
        return await this.metaMaskSignData(data, isEIP712)
      case WALLETS.walletConnect:
        return await this.walletConnectSignData(data, isEIP712)
      case WALLETS.coinbaseWallet:
        return await this.coinbaseWalletSignData(data)
      case WALLETS.tronLink:
        return await this.tronLinkSignData(data)
      case undefined:
        store?.commit(ME_KEYS.setLoggedIn, false)
        this.walletsConnect()
        break
    }
  }

  async sendTrx (data: ISendTrxParams, isPortalWallet?: boolean): Promise<Error | string | undefined> {
    const { store } = this.context.app
    const _walletName = store?.state.me.connectedAccount.walletName
    switch (_walletName) {
      case WALLETS.bscWallet:
      case WALLETS.polygonWallet:
      case WALLETS.metaMask:
        if (isPortalWallet) {
          return await this.metaMaskSendCKBTrx(data)
        }
        else {
          return await this.metaMaskSendTrx(data)
        }
      case WALLETS.walletConnect:
        if (isPortalWallet) {
          return await this.walletConnectSendCKBTrx(data)
        }
        else {
          return await this.walletConnectSendTrx(data)
        }
      case WALLETS.coinbaseWallet:
        return await this.coinbaseWalletSendTrx(data)
      case WALLETS.tronLink:
        if (isPortalWallet) {
          return await this.tronLinkSendCKBTrx(data)
        }
        else {
          return await this.tronLinkSendTrx(data)
        }
    }
  }

  refreshPageAfterLogin (): (address: string) => void {
    const { store } = this.context.app
    const oldAddress = store?.state.me.connectedAccount.address
    return function (address: string) {
      if (oldAddress.toUpperCase() !== address.toUpperCase()) {
        window.location.reload()
      }
    }
  }

  async metaMaskConnect () {
    const { ethereum } = window
    const { $tt, $alert, store } = this.context.app
    if (typeof ethereum !== 'undefined') {
      const _refreshPageAfterLogin = this.refreshPageAfterLogin()
      try {
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
        if (accounts && !accounts[0]) {
          $alert({
            title: $tt('Error'),
            message: $tt('Failed to get an account') as string
          })
          store?.commit(ME_KEYS.setLoggedIn, false)
          this.walletsConnect()
          return
        }

        ethereum.on('accountsChanged', (accounts: string[]) => {
          if (accounts.length === 0) {
            store?.commit(ME_KEYS.setConnectedAccount, {
              address: ''
            })
            store?.commit(ME_KEYS.setLoggedIn, false)
          }
          window.location.reload()
        })

        ethereum.on('chainChanged', () => {
          window.location.reload()
        })

        const chainId = chainIdHexToNumber(ethereum.networkVersion || ethereum.chainId)

        if (config.isProdData) {
          if ([CHAIN_ID.eth, CHAIN_ID.bsc, CHAIN_ID.polygon].includes(chainId)) {
            const _walletName = store?.state.me.connectedAccount.walletName
            if (_walletName && this.walletName !== _walletName && _walletName !== WALLETS.tronLink) {
              if (this.walletName === WALLETS.metaMask) {
                $alert({
                  title: $tt('Error'),
                  message: ($tt('Please switch your wallet to the Ethereum main network before connecting') as string)
                })
              }
              else if (this.walletName === WALLETS.bscWallet) {
                $alert({
                  title: $tt('Error'),
                  message: ($tt('Please switch your wallet to the BSC main network before connecting') as string)
                })
              }
              else if (this.walletName === WALLETS.polygonWallet) {
                $alert({
                  title: $tt('Error'),
                  message: ($tt('Please switch your wallet to the Polygon Mainnet before connecting') as string)
                })
              }
              return
            }
          }
          else {
            if (this.walletName === WALLETS.metaMask) {
              $alert({
                title: $tt('Error'),
                message: ($tt('Please switch your wallet to the Ethereum main network before connecting') as string)
              })
            }
            else if (this.walletName === WALLETS.bscWallet) {
              $alert({
                title: $tt('Error'),
                message: ($tt('Please switch your wallet to the BSC main network before connecting') as string)
              })
            }
            else if (this.walletName === WALLETS.polygonWallet) {
              $alert({
                title: $tt('Error'),
                message: ($tt('Please switch your wallet to the Polygon Mainnet before connecting') as string)
              })
            }
            return
          }
        }
        else {
          if ([EthereumGoerliChainId, BSCTestnetChainId, PolygonTestnetChainId].includes(chainId)) {
            const _walletName = store?.state.me.connectedAccount.walletName
            if (_walletName && this.walletName !== _walletName && _walletName !== WALLETS.tronLink) {
              if (this.walletName === WALLETS.metaMask) {
                $alert({
                  title: $tt('Tips'),
                  message: ($tt('Please switch your wallet to the Goerli test network before connecting') as string)
                })
              }
              else if (this.walletName === WALLETS.bscWallet) {
                $alert({
                  title: $tt('Tips'),
                  message: ($tt('Please switch your wallet to the BSC Testnet before connecting') as string)
                })
              }
              else if (this.walletName === WALLETS.polygonWallet) {
                $alert({
                  title: $tt('Error'),
                  message: ($tt('Please switch your wallet to the Polygon Testnet before connecting') as string)
                })
              }
              return
            }
          }
          else {
            if (this.walletName === WALLETS.metaMask) {
              $alert({
                title: $tt('Tips'),
                message: ($tt('Please switch your wallet to the Goerli test network before connecting') as string)
              })
            }
            else if (this.walletName === WALLETS.bscWallet) {
              $alert({
                title: $tt('Tips'),
                message: ($tt('Please switch your wallet to the BSC Testnet before connecting') as string)
              })
            }
            else if (this.walletName === WALLETS.polygonWallet) {
              $alert({
                title: $tt('Error'),
                message: ($tt('Please switch your wallet to the Polygon Testnet before connecting') as string)
              })
            }
            return
          }
        }

        let chain = null

        if (chainId === CHAIN_ID.eth || chainId === EthereumGoerliChainId) {
          chain = ETH
          this.walletName = WALLETS.metaMask
        }
        else if (chainId === CHAIN_ID.bsc || chainId === BSCTestnetChainId) {
          chain = BSC
          this.walletName = WALLETS.bscWallet
        }
        else if (chainId === CHAIN_ID.polygon || chainId === PolygonTestnetChainId) {
          chain = Polygon
          this.walletName = WALLETS.polygonWallet
        }

        store?.commit(ME_KEYS.setConnectedAccount, {
          address: accounts[0],
          chain,
          walletName: this.walletName
        })
        this.closeWalletsConnect()
        _refreshPageAfterLogin(accounts[0])
      }
      catch (err: any) {
        console.error(err)
        // imtoken wallet error handling
        if (err.message?.includes(errno.imTokenUserCanceled)) {
          window.location.reload()
        }
        else {
          this.handleMetaMaskConnectError(err)
        }
      }
    }
    else if (isMobileDevices()) {
      $alert({
        title: $tt('Tips'),
        message: ($tt('Failed to get account, please switch your wallet to {chain} environment', { chain: this.walletName && WalletNameToChain[this.walletName].name }) as string)
      })
    }
    else {
      $alert({
        title: $tt('Error'),
        message: ($tt('Please install MetaMask!') as string)
      })
    }
  }

  handleMetaMaskConnectError (err: ICodedError): void {
    console.error(err)

    const { $tt, $alert } = this.context.app

    if (![errno.metaMaskUserRejectedAccountAccess, errno.metaMaskUserDeniedMessageSignature].includes(err.code)) {
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

  async walletConnectConnect () {
    const { $tt, $alert, store } = this.context.app
    const _refreshPageAfterLogin = this.refreshPageAfterLogin()
    await loadScript('/js/walletconnect-client.min.js', 'walletconnect-client')
    await loadScript('/js/walletconnect-qrcode-modal.min.js', 'walletconnect-qrcode-modal')
    const { WalletConnect, WalletConnectQRCodeModal } = window

    const onConnected = function (this: WalletSdk, accounts: string[], chainId: string): void {
      if (config.isProdData) {
        if (Number(chainId) !== CHAIN_ID.eth) {
          $alert({
            title: $tt('Tips'),
            message: ($tt('Please switch your wallet to the Ethereum main network before connecting') as string)
          })
          setTimeout(() => {
            localStorage.removeItem('walletconnect')
          }, 500)
          return
        }
      }
      else if (Number(chainId) !== EthereumGoerliChainId) {
        $alert({
          title: $tt('Tips'),
          message: ($tt('Please switch your wallet to the Goerli test network before connecting') as string)
        })
        setTimeout(() => {
          localStorage.removeItem('walletconnect')
        }, 500)
        return
      }

      if (!accounts?.[0]) {
        $alert({
          title: $tt('Error'),
          message: $tt('Failed to get an account') as string
        })
        store?.commit(ME_KEYS.setLoggedIn, false)
        this.walletsConnect()
        return
      }

      store?.commit(ME_KEYS.setConnectedAccount, {
        address: accounts[0],
        chain: ETH,
        walletName: this.walletName
      })
      this.closeWalletsConnect()
      _refreshPageAfterLogin(accounts[0])
    }

    try {
      // eslint-disable-next-line new-cap
      this.walletConnector = new WalletConnect.default({
        bridge: 'https://bridge.walletconnect.org',
        qrcodeModal: WalletConnectQRCodeModal.default
      })

      if (!this.walletConnector.connected) {
        this.walletConnector.on('connect', (error: Error, payload: any) => {
          if (error) {
            $alert({
              title: $tt('Error'),
              message: error.message
            })
            return
          }
          const { accounts, chainId } = payload.params[0]

          onConnected.call(this, accounts, chainId)
        })
        await this.walletConnector.createSession()
      }
      else {
        const { accounts, chainId } = this.walletConnector

        onConnected.call(this, accounts, chainId)
      }
    }
    catch (err: any) {
      this.handleMetaMaskConnectError(err)
    }
  }

  async coinbaseWalletConnect () {
    const { store } = this.context.app
    const { Web3 } = window
    const { WalletLink } = await import('walletlink')
    const walletLink = new WalletLink({
      appName: config.appNmae,
      appLogoUrl: `${config.domain}/favicon.ico`,
      darkMode: false
    })
    const walletLinkEthereum = walletLink.makeWeb3Provider('https://mainnet.infura.io/v3/ff0db0391cc74735a160f2d7acae5ad4', CHAIN_ID.eth)
    this.walletLinkWeb3 = new Web3(walletLinkEthereum)
    const _refreshPageAfterLogin = this.refreshPageAfterLogin()
    try {
      const accounts = await walletLinkEthereum.enable()
      store?.commit(ME_KEYS.setConnectedAccount, {
        address: accounts[0],
        chain: ETH,
        walletName: this.walletName
      })
      this.closeWalletsConnect()
      _refreshPageAfterLogin(accounts[0])
    }
    catch (err: any) {
      this.handleMetaMaskConnectError(err)
    }
  }

  tronLinkConnect (): Promise<void> {
    return new Promise((resolve, reject) => {
      window.setTimeout(() => {
        const { tronWeb } = window
        const {
          $tt,
          $alert,
          store
        } = this.context.app

        if (typeof tronWeb !== 'undefined') {
          const _refreshPageAfterLogin = this.refreshPageAfterLogin()
          const account = tronWeb.defaultAddress.base58
          const nodeHost = tronWeb.fullNode.host

          window.addEventListener('message', function (e) {
            if (e.data.message && (e.data.message.action === 'setAccount' || e.data.message.action === 'setNode')) {
              window.location.reload()
            }
          })

          if (!account) {
            if (nodeHost === 'http://127.0.0.1') {
              const msg = $tt('Please try again after unlocking your TronLink wallet')
              $alert({
                title: $tt('Tips'),
                message: msg
              })

              reject(new Error(msg))
            }
            else {
              const msg = $tt('Failed to get an account')
              $alert({
                title: $tt('Error'),
                message: msg
              })
              store?.commit(ME_KEYS.setLoggedIn, false)

              this.walletsConnect()

              reject(new Error(msg))
            }

            return
          }

          // if (config.isProdData) {
          //   if (!TronGridNetNodes.includes(nodeHost)) {
          //     $alert({
          //       title: $tt('Tips'),
          //       message: ($tt('Please switch your wallet to the TronGrid network before connecting') as string)
          //     })
          //     return
          //   }
          // }
          // else {
          //   if (nodeHost !== TronNileTestNetNode) {
          //     $alert({
          //       title: $tt('Tips'),
          //       message: ($tt('Please switch your wallet to the Nile test network before connecting') as string)
          //     })
          //     return
          //   }
          // }

          store?.commit(ME_KEYS.setConnectedAccount, {
            address: account,
            chain: TRON,
            walletName: this.walletName
          })
          this.closeWalletsConnect()
          _refreshPageAfterLogin(account)

          resolve()
        }
        else if (isMobileDevices()) {
          const msg = $tt('Failed to get account, please switch your wallet to {chain} environment', { chain: 'Tron' })

          $alert({
            title: $tt('Tips'),
            message: msg
          })

          reject(new Error(msg))
        }
        else {
          const msg = $tt('Please install TronLink!')

          $alert({
            title: $tt('Error'),
            message: msg
          })

          reject(new Error(msg))
        }
      }, 500)
    })
  }

  async metaMaskSignData (data: string | object, isEIP712?: boolean): Promise<string | undefined> {
    await this.metaMaskConnect()
    const { store } = this.context.app
    const _signAccount = store?.state.me.connectedAccount.address
    return await new Promise((resolve, reject) => {
      const { ethereum } = window

      this.throwIfChainIdMismatch(chainIdHexToNumber(ethereum.networkVersion || ethereum.chainId), true)

      if (isEIP712) {
        ethereum.sendAsync({
          method: 'eth_signTypedData_v4',
          params: [_signAccount, JSON.stringify(data)],
          from: _signAccount
        }, onMetaMaskResponse(resolve, reject))
      }
      else {
        ethereum.sendAsync({
          method: 'personal_sign',
          params: [data, _signAccount]
        }, onMetaMaskResponse(resolve, reject))
      }
    })
  }

  async ethSign (data: string): Promise<Error | string | undefined> {
    await this.metaMaskConnect()
    const { store } = this.context.app
    const _signAccount = store?.state.me.connectedAccount.address
    return await new Promise((resolve, reject) => {
      const { ethereum } = window
      this.throwIfChainIdMismatch(chainIdHexToNumber(ethereum.networkVersion || ethereum.chainId), true)

      ethereum.sendAsync({
        method: 'eth_sign',
        params: [_signAccount, data]
      }, onMetaMaskResponse(resolve, reject))
    })
  }

  async walletConnectSignData (data: string | object, isEIP712?: boolean): Promise<string | undefined> {
    await this.walletConnectConnect()
    const { store } = this.context.app
    const _signAccount = store?.state.me.connectedAccount.address
    return await new Promise((resolve, reject) => {
      const { chainId } = this.walletConnector
      const error: any = new Error('metaMaskUserDeniedMessageSignature')
      error.code = errno.metaMaskUserDeniedMessageSignature
      if (config.isProdData) {
        if (Number(chainId) !== CHAIN_ID.eth) {
          reject(error)
          return
        }
      }
      else if (Number(chainId) !== EthereumGoerliChainId) {
        reject(error)
        return
      }

      if (isEIP712) {
        this.walletConnector
          .signTypedData([
            _signAccount,
            JSON.stringify(data)
          ])
          .then((result: string) => {
            resolve(result)
          })
          .catch((err: any) => {
            console.error(err)
            if (err.message === 'MetaMask Typed Message Signature: User denied message signature.' || err.message === 'MetaMask Personal Message Signature: User denied message signature.') {
              err.code = errno.metaMaskUserDeniedMessageSignature
            }
            reject(err)
          })
      }
      else {
        this.walletConnector
          .signPersonalMessage([data, _signAccount])
          .then((result: string) => {
            resolve(result)
          })
          .catch((err: any) => {
            console.error(err)
            if (err.message === 'MetaMask Typed Message Signature: User denied message signature.' || err.message === 'MetaMask Personal Message Signature: User denied message signature.') {
              err.code = errno.metaMaskUserDeniedMessageSignature
            }
            reject(err)
          })
      }
    })
  }

  async coinbaseWalletSignData (data: string | object): Promise<string | undefined> {
    await this.coinbaseWalletConnect()
    const { store } = this.context.app
    const _signAccount = store?.state.me.connectedAccount.address
    return await new Promise((resolve, reject) => {
      this.walletLinkWeb3.currentProvider.sendAsync({
        method: 'personal_sign',
        params: [data, _signAccount]
      }, onMetaMaskResponse(resolve, reject))
    })
  }

  async tronLinkSignData (data: string | object): Promise<string | undefined> {
    await this.tronLinkConnect()

    return await new Promise((resolve, reject) => {
      const { tronWeb } = window
      const nodeHost = tronWeb.fullNode.host

      // if (config.isProdData) {
      //   if (!TronGridNetNodes.includes(nodeHost)) {
      //     reject(errno.tronLinkConfirmationDeclinedByUser)
      //     return
      //   }
      // }
      // else {
      //   if (nodeHost !== TronNileTestNetNode) {
      //     reject(errno.tronLinkConfirmationDeclinedByUser)
      //     return
      //   }
      // }

      tronWeb.trx.sign(data)
        .then((res: any) => {
          resolve(res)
        }).catch((err: Error) => {
          console.error(err)
          reject(err)
        })
    })
  }

  async metaMaskSendTrx ({ to, value, data }: ISendTrxParams): Promise<Error | string | undefined> {
    await this.metaMaskConnect()
    const { ethereum } = window
    const { $tt, store } = this.context.app
    const _from = store?.state.me.connectedAccount.address
    const _data = Web3Utils.utf8ToHex(data)
    const _value = Web3Utils.numberToHex(value)
    return await new Promise((resolve, reject) => {
      const error: any = new Error('metaMaskUserRejectedAccountAccess')
      error.code = errno.metaMaskUserRejectedAccountAccess
      if (config.isProdData) {
        if (![CHAIN_ID.eth, CHAIN_ID.bsc, CHAIN_ID.polygon].includes(chainIdHexToNumber(ethereum.networkVersion || ethereum.chainId))) {
          reject(error)
          return
        }
      }
      else if (![EthereumGoerliChainId, BSCTestnetChainId, PolygonTestnetChainId].includes(chainIdHexToNumber(ethereum.networkVersion || ethereum.chainId))) {
        reject(error)
        return
      }

      // if (!_data || _data === '0x') {
      //   reject(new Error($tt('Parameter error, missing order ID, please refresh the page and try again.')))
      //   return
      // }

      ethereum.sendAsync({
        method: 'eth_sendTransaction',
        params: [{
          from: _from,
          to,
          value: _value,
          data: _data,
          gas: Web3Utils.numberToHex('25000')
        }]
      }, onMetaMaskResponse(resolve, reject))
    })
  }

  async metaMaskSendCKBTrx ({ to, value, data }: ISendTrxParams): Promise<Error | string | undefined> {
    await this.metaMaskConnect()

    const { ethereum } = window
    const error: any = new Error('metaMaskUserRejectedAccountAccess')
    error.code = errno.metaMaskUserRejectedAccountAccess
    if (config.isProdData) {
      if (![CHAIN_ID.eth, CHAIN_ID.bsc, CHAIN_ID.polygon].includes(chainIdHexToNumber(ethereum.networkVersion || ethereum.chainId))) {
        throw error
      }
    }
    else if (![EthereumGoerliChainId, BSCTestnetChainId, PolygonTestnetChainId].includes(chainIdHexToNumber(ethereum.networkVersion || ethereum.chainId))) {
      throw error
    }

    return await this.sendWithPwWallet({ to, value, data }, CHAIN_ID.eth)
  }

  async sendWithPwWallet ({ to, value, data }: ISendTrxParams, chain: CHAIN_ID): Promise<string> {
    try {
      const pwcore = await new PWCore(config.ckbNode).init(
        chain === CHAIN_ID.tron ? new DasTronProvider() : new DasEthProvider(),
        new IndexerCollector(config.ckbNode)
      )

      return await pwcore.send(
        new Address(to, AddressType.ckb),
        new Amount(shrinkUnit(value, CKB.decimals)),
        {
          data,
          witnessArgs: Builder.WITNESS_ARGS.RawSecp256k1
        }
      )
    }
    catch (err) {
      console.error(err)
      throw err
    }
  }

  async walletConnectSendTrx ({ to, value, data }: ISendTrxParams): Promise<Error | string | undefined> {
    await this.walletConnectConnect()
    const { store } = this.context.app
    const _from = store?.state.me.connectedAccount.address
    const _data = Web3Utils.utf8ToHex(data)
    const _value = Web3Utils.numberToHex(value)
    return await new Promise((resolve, reject) => {
      const { chainId } = this.walletConnector

      this.throwIfChainIdMismatch(chainId)

      this.walletConnector.sendTransaction({
        from: _from,
        to,
        value: _value,
        data: _data
      })
        .then((res: string) => {
          resolve(res)
        })
        .catch((err: Error) => {
          console.error(err)
          reject(err)
        })
    })
  }

  async walletConnectSendCKBTrx ({ to, value, data }: ISendTrxParams): Promise<Error | string | undefined> {
    await this.walletConnectConnect()
    const { chainId } = this.walletConnector

    this.throwIfChainIdMismatch(chainId)

    return await this.sendWithPwWallet({ to, value, data }, CHAIN_ID.eth)
  }

  throwIfChainIdMismatch (chainId: number, isSignMsg?: boolean): void {
    let error: ICodedError

    if (isSignMsg) {
      error = new Error('metaMaskUserDeniedMessageSignature') as ICodedError
      error.code = errno.metaMaskUserDeniedMessageSignature
    }
    else {
      error = new Error('metaMaskUserRejectedAccountAccess') as ICodedError
      error.code = errno.metaMaskUserRejectedAccountAccess
    }

    if (config.isProdData) {
      if (![CHAIN_ID.eth, CHAIN_ID.bsc, CHAIN_ID.polygon].includes(chainId)) {
        throw error
      }
    }
    else if (![EthereumGoerliChainId, BSCTestnetChainId, PolygonTestnetChainId].includes(chainId)) {
      throw error
    }
  }

  async coinbaseWalletSendTrx ({ to, value, data }: ISendTrxParams): Promise<Error | string | undefined> {
    await this.coinbaseWalletConnect()
    const { store } = this.context.app
    const _from = store?.state.me.connectedAccount.address
    const _data = Web3Utils.utf8ToHex(data)
    const _value = Web3Utils.numberToHex(value)
    return await new Promise((resolve, reject) => {
      this.walletLinkWeb3.currentProvider.sendAsync({
        method: 'eth_sendTransaction',
        params: [{
          from: _from,
          to,
          value: _value,
          data: _data
        }]
      }, onMetaMaskResponse(resolve, reject))
    })
  }

  async tronLinkSendTrx ({ to, value, data }: ISendTrxParams): Promise<Error | string | undefined> {
    await this.tronLinkConnect()

    const { tronWeb } = window
    const { store } = this.context.app
    const _from = store?.state.me.connectedAccount.address

    // eslint-disable-next-line no-async-promise-executor,@typescript-eslint/no-misused-promises
    return await new Promise(async (resolve, reject) => {
      const nodeHost = tronWeb.fullNode.host

      // if (config.isProdData) {
      //   if (!TronGridNetNodes.includes(nodeHost)) {
      //     reject(errno.tronLinkConfirmationDeclinedByUser)
      //     return
      //   }
      // }
      // else {
      //   if (nodeHost !== TronNileTestNetNode) {
      //     reject(errno.tronLinkConfirmationDeclinedByUser)
      //     return
      //   }
      // }

      try {
        let tx = await tronWeb.transactionBuilder.sendTrx(to, value, _from)
        tx = await tronWeb.transactionBuilder.addUpdateData(tx, data)
        const signedTx = await tronWeb.trx.sign(tx)
        const ret = await tronWeb.trx.sendRawTransaction(signedTx)
        resolve(ret.txid)
      }
      catch (err: any) {
        console.error(err)
        reject(err)
      }
    })
  }

  async tronLinkSendCKBTrx ({ to, value, data }: ISendTrxParams): Promise<Error | string | undefined> {
    await this.tronLinkConnect()

    const { tronWeb } = window
    const nodeHost = tronWeb.fullNode.host

    // if (config.isProdData) {
    //   if (!TronGridNetNodes.includes(nodeHost)) {
    //     throw errno.tronLinkConfirmationDeclinedByUser
    //   }
    // }
    // else {
    //   if (nodeHost !== TronNileTestNetNode) {
    //     throw errno.tronLinkConfirmationDeclinedByUser
    //   }
    // }

    return await this.sendWithPwWallet({ to, value, data }, CHAIN_ID.tron)
  }
}
