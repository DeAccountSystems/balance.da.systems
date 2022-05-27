import { isProdData } from '~~/config'

export enum ChainType {
  ckb,
  eth,
  btc,
  tron,
  fiat,
  bsc = 56,
  polygon = 137
}

// EVM-based Chains https://github.com/satoshilabs/slips/blob/master/slip-0044.md
export enum ChainId {
  eth = isProdData ? 1 : 5,
  bsc = isProdData ? 56 : 97,
  polygon = isProdData ? 137 : 80001
}

// SLIP-0044 : Registered coin types for BIP-0044 https://github.com/ethereum-lists/chains
export enum CoinType {
  btc = 0,
  doge = 3,
  eth = 60,
  trx = 195,
  ckb = 309,
  bnb = 714,
  matic = 966
}

export const EvmCoinTypes = [CoinType.eth, CoinType.bnb, CoinType.matic]

export const CoinTypeToChainIdMap: { [key: string]: number } = {
  [CoinType.eth]: ChainId.eth,
  [CoinType.bnb]: ChainId.bsc,
  [CoinType.matic]: ChainId.polygon
}

export const CoinTypeToTorusHostMap: { [key: string]: string } = {
  [CoinType.eth]: isProdData ? 'mainnet' : 'goerli',
  [CoinType.bnb]: isProdData ? 'bsc_mainnet' : 'bsc_testnet',
  [CoinType.matic]: isProdData ? 'matic' : 'mumbai'
}

export const ChainIdToCoinTypeMap: { [key: string]: number } = {
  1: CoinType.eth,
  5: CoinType.eth,
  56: CoinType.bnb,
  97: CoinType.bnb,
  137: CoinType.matic,
  80001: CoinType.matic
}

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
  coinType: CoinType,
  decimals: number,
  icon: string,
  tokenId: string,
  explorerTrx: string,
}

export const CKB: IMainChain = {
  name: 'Nervos Network',
  symbol: 'CKB',
  coinType: CoinType.ckb,
  decimals: 8,
  icon: 'nervos-network',
  tokenId: 'ckb_ckb',
  explorerTrx: isProdData ? 'https://explorer.nervos.org/transaction/' : 'https://explorer.nervos.org/aggron/transaction/'
}

export const ETH: IMainChain = {
  name: 'Ethereum',
  symbol: 'ETH',
  coinType: CoinType.eth,
  decimals: 18,
  icon: 'ethereum',
  tokenId: 'eth_eth',
  explorerTrx: isProdData ? 'https://etherscan.io/tx/' : 'https://goerli.etherscan.io/tx/'
}

export const TRON: IMainChain = {
  name: 'TRON',
  symbol: 'TRX',
  coinType: CoinType.trx,
  decimals: 6,
  icon: 'tron',
  tokenId: 'tron_trx',
  explorerTrx: isProdData ? 'https://tronscan.org/#/transaction/' : 'https://nile.tronscan.org/#/transaction/'
}

export const BSC: IMainChain = {
  name: 'Binance Smart Chain',
  symbol: 'BNB',
  coinType: CoinType.bnb,
  decimals: 18,
  icon: 'binance-smart-chain',
  tokenId: 'bsc_bnb',
  explorerTrx: isProdData ? 'https://bscscan.com/tx/' : 'https://testnet.bscscan.com/tx/'
}

export const Polygon: IMainChain = {
  name: 'Polygon',
  symbol: 'MATIC',
  coinType: CoinType.matic,
  decimals: 18,
  icon: 'polygon',
  tokenId: 'polygon_matic',
  explorerTrx: isProdData ? 'https://polygonscan.com/tx/' : 'https://mumbai.polygonscan.com/tx/'
}

export const CoinTypeToChainMap: { [key: string]: IMainChain } = {
  [CoinType.eth]: ETH,
  [CoinType.bnb]: BSC,
  [CoinType.matic]: Polygon,
  [CoinType.trx]: TRON
}
