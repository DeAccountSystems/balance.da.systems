import PW, {
  Provider,
  Address,
  AddressType,
  Platform,
  IndexerCollector,
  Amount,
  Builder
} from '@lay2/pw-core'

class DasEthProvider extends Provider {
  onAddressChanged?: (newAddress: Address) => void

  constructor (onAddressChanged?: (newAddress: Address) => void) {
    super(Platform.eth)
    this.onAddressChanged = onAddressChanged
  }

  async init (): Promise<Provider> {
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.autoRefreshOnNetworkChange = false
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      })
      this.address = new Address(accounts[0], AddressType.eth)

      if (window.ethereum.on) {
        window.ethereum.on('accountsChanged', (newAccounts: string[]) => {
          this.address = new Address(newAccounts[0], AddressType.eth)
          if (this.onAddressChanged) {
            this.onAddressChanged(this.address)
          }
        })
      }

      return this
    }
    else if (window.web3) {
      console.log('[eth-provider] try window.web3')
      const accounts = await new Promise<string[]>((resolve, reject) => {
        window.web3.eth.getAccounts((err: Error, result: string[]) => {
          if (err) {
            reject(err)
          }
          resolve(result)
        })
      })
      this.address = new Address(accounts[0], AddressType.eth)

      return this
    }
    else {
      throw new Error(
        'window.ethereum is undefined, Ethereum environment is required.'
      )
    }
  }

  sign (message: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const from = this.address.addressString

      const handleResult = (result: string): string => {
        let v = Number.parseInt(result.slice(-2), 16)
        if (v >= 27) {
          v -= 27
        }
        result =
          '0x' +
          result.slice(2, -2) +
          v.toString(16).padStart(2, '0')
        return result
      }

      if (typeof window.ethereum !== 'undefined') {
        window.ethereum
          .request({ method: 'personal_sign', params: [from, message] })
          .then((result: string) => {
            resolve(handleResult(result))
          })
          .catch((err: Error) => {
            reject(err)
          })
      }
      else if (window.web3) {
        window.web3.currentProvider.sendAsync(
          { method: 'personal_sign', params: [message, from], from },
          // @ts-expect-error
          (err, result) => {
            if (err) {
              reject(err)
            }
            if (result.error) {
              reject(result.error)
            }
            resolve(handleResult(result.result))
          }
        )
      }
      else {
        reject(
          new Error(
            'window.ethereum/window.web3 is undefined, Ethereum environment is required.'
          )
        )
      }
    })
  }

  close () {
    return true
  }
}

export {
  PW,
  IndexerCollector,
  Address,
  AddressType,
  Amount,
  Builder,
  DasEthProvider
}
