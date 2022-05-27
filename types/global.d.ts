// eslint-disable-next-line @typescript-eslint/naming-convention
interface Window {
  i18n: any,
  eruda: any,
  ethereum: any,
  Web3: any,
  web3?: any,
  tronWeb: any,
  WalletConnect: any,
  WalletConnectQRCodeModal: any,
}

// polyfill EventTarget for input event
interface EventTarget {
  value: string,
}
