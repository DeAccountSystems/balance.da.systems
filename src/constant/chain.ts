import config from '~~/config'

export enum CHAIN_ID {
  ckb,
  eth,
  btc,
  tron,
  fiat,
  bsc = 56,
  polygon = 137
}

export const EthereumGoerliChainId = 5
export const BSCTestnetChainId = 97
export const PolygonTestnetChainId = 80001

export enum LOCK_SCRIPT_TYPE {
  ckb,
  none,
  eth= 3,
  tron,
  eip712,
  btc,
}

export interface IMainChain {
  name: string,
  symbol: string,
  chainId: CHAIN_ID,
  decimals: number,
  icon: string,
  tokenId: string,
  lockScriptType: LOCK_SCRIPT_TYPE,
  explorerAddress: string,
  explorerTrx: string,
}

export const CKB: IMainChain = {
  name: 'Nervos Network',
  symbol: 'CKB',
  chainId: CHAIN_ID.ckb,
  decimals: 8,
  icon: 'nervos-network',
  tokenId: 'ckb_ckb',
  lockScriptType: LOCK_SCRIPT_TYPE.ckb,
  explorerAddress: config.isProdData ? 'https://explorer.nervos.org/address/' : 'https://explorer.nervos.org/aggron/address/',
  explorerTrx: config.isProdData ? 'https://explorer.nervos.org/transaction/' : 'https://explorer.nervos.org/aggron/transaction/'
}

export const ETH: IMainChain = {
  name: 'Ethereum',
  symbol: 'ETH',
  chainId: CHAIN_ID.eth,
  decimals: 18,
  icon: 'ethereum',
  tokenId: 'eth_eth',
  lockScriptType: LOCK_SCRIPT_TYPE.eth,
  explorerAddress: config.isProdData ? 'https://etherscan.io/address/' : 'https://goerli.etherscan.io/address/',
  explorerTrx: config.isProdData ? 'https://etherscan.io/tx/' : 'https://goerli.etherscan.io/tx/'
}

export const TRON: IMainChain = {
  name: 'TRON',
  symbol: 'TRX',
  chainId: CHAIN_ID.tron,
  decimals: 6,
  icon: 'tron',
  tokenId: 'tron_trx',
  lockScriptType: LOCK_SCRIPT_TYPE.tron,
  explorerAddress: config.isProdData ? 'https://tronscan.org/#/address/' : 'https://nile.tronscan.org/#/address/',
  explorerTrx: config.isProdData ? 'https://tronscan.org/#/transaction/' : 'https://nile.tronscan.org/#/transaction/'
}

export const BTC: IMainChain = {
  name: 'Bitcoin',
  symbol: 'BTC',
  chainId: CHAIN_ID.btc,
  decimals: 8,
  icon: 'bitcoin',
  tokenId: 'btc_btc',
  lockScriptType: LOCK_SCRIPT_TYPE.btc,
  explorerAddress: 'https://explorer.btc.com/btc/address/',
  explorerTrx: 'https://explorer.btc.com/btc/address/'
}

export const BSC: IMainChain = {
  name: 'Binance Smart Chain',
  symbol: 'BNB',
  chainId: CHAIN_ID.bsc,
  decimals: 18,
  icon: 'binance-smart-chain',
  tokenId: 'bsc_bnb',
  lockScriptType: LOCK_SCRIPT_TYPE.eth,
  explorerAddress: config.isProdData ? 'https://bscscan.com/address/' : 'https://testnet.bscscan.com/address/',
  explorerTrx: config.isProdData ? 'https://bscscan.com/tx/' : 'https://testnet.bscscan.com/tx/'
}

export const Polygon: IMainChain = {
  name: 'Polygon',
  symbol: 'MATIC',
  chainId: CHAIN_ID.polygon,
  decimals: 18,
  icon: 'polygon',
  tokenId: 'polygon_matic',
  lockScriptType: LOCK_SCRIPT_TYPE.eth,
  explorerAddress: config.isProdData ? 'https://polygonscan.com/address/' : 'https://mumbai.polygonscan.com/address/',
  explorerTrx: config.isProdData ? 'https://polygonscan.com/tx/' : 'https://mumbai.polygonscan.com/tx/'
}
