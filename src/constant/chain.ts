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
  btc = '0',
  doge = '3',
  eth = '60',
  trx = '195',
  ckb = '309',
  bsc = '9006',
  matic = '966'
}

export const EvmCoinTypes = [CoinType.eth, CoinType.bsc, CoinType.matic]

export const CoinTypeToChainIdMap: { [key: string]: number } = {
  [CoinType.eth]: ChainId.eth,
  [CoinType.bsc]: ChainId.bsc,
  [CoinType.matic]: ChainId.polygon
}

export const CoinTypeToTorusHostMap: { [key: string]: string } = {
  [CoinType.eth]: isProdData ? 'mainnet' : 'goerli',
  [CoinType.bsc]: isProdData ? 'bsc_mainnet' : 'bsc_testnet',
  [CoinType.matic]: isProdData ? 'matic' : 'mumbai'
}

export const ChainIdToCoinTypeMap: { [key: string]: CoinType } = {
  1: CoinType.eth,
  5: CoinType.eth,
  56: CoinType.bsc,
  97: CoinType.bsc,
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
  coinType: CoinType.bsc,
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

export const BTC: IMainChain = {
  name: 'Bitcoin',
  symbol: 'BTC',
  coinType: CoinType.btc,
  decimals: 8,
  icon: 'bitcoin',
  tokenId: 'btc_btc',
  explorerTrx: 'https://explorer.btc.com/btc/address/'
}

export const CoinTypeToChainMap: { [key: string]: IMainChain } = {
  [CoinType.eth]: ETH,
  [CoinType.bsc]: BSC,
  [CoinType.matic]: Polygon,
  [CoinType.trx]: TRON
}

export interface ICoinTypeInfo {
  text: string,
  value: string,
  coinType: string,
}

export const PARSING_RECORD_SUPPORT_CHAINS: ICoinTypeInfo[] = [{
  text: BTC.symbol,
  value: BTC.symbol.toLowerCase(),
  coinType: BTC.coinType
}, {
  text: ETH.symbol,
  value: ETH.symbol.toLowerCase(),
  coinType: ETH.coinType
}, {
  text: BSC.symbol,
  value: BSC.name.toLowerCase(),
  coinType: BSC.coinType
}, {
  text: 'ADA',
  value: 'ada',
  coinType: '1815'
}, {
  text: 'XRP',
  value: 'xrp',
  coinType: '144'
}, {
  text: 'SOL',
  value: 'sol',
  coinType: '501'
}, {
  text: 'DOGE',
  value: 'doge',
  coinType: '3'
}, {
  text: 'DOT',
  value: 'dot',
  coinType: '354'
}, {
  text: TRON.symbol,
  value: TRON.symbol.toLowerCase(),
  coinType: TRON.coinType
}, {
  text: 'AVAX',
  value: 'avalanche',
  coinType: '9000'
}, {
  text: Polygon.symbol,
  value: Polygon.name.toLowerCase(),
  coinType: Polygon.coinType
}, {
  text: 'LTC',
  value: 'ltc',
  coinType: '2'
}, {
  text: 'XLM',
  value: 'xlm',
  coinType: '148'
}, {
  text: 'NEAR',
  value: 'near',
  coinType: '397'
}, {
  text: 'BCH',
  value: 'bch',
  coinType: '145'
}, {
  text: 'ATOM',
  value: 'atom',
  coinType: '118'
}, {
  text: 'ETC',
  value: 'etc',
  coinType: '61'
}, {
  text: 'XMR',
  value: 'xmr',
  coinType: '128'
}, {
  text: 'VET',
  value: 'vet',
  coinType: '818'
}, {
  text: 'FLOW',
  value: 'flow',
  coinType: '539'
}, {
  text: 'FIL',
  value: 'fil',
  coinType: '461'
}, {
  text: 'BSV',
  value: 'bsv',
  coinType: '236'
}, {
  text: 'EOS',
  value: 'eos',
  coinType: '194'
}, {
  text: 'Celo',
  value: 'celo',
  coinType: '52752'
}, {
  text: CKB.symbol,
  value: CKB.symbol.toLowerCase(),
  coinType: CKB.coinType
}, {
  text: 'DASH',
  value: 'dash',
  coinType: '5'
}, {
  text: 'ICP',
  value: 'dfinity',
  coinType: '223'
}, {
  text: 'HT',
  value: 'heco',
  coinType: '1010'
}, {
  text: 'IOST',
  value: 'iost',
  coinType: '291'
}, {
  text: 'IOTA',
  value: 'iota',
  coinType: '4218'
}, {
  text: 'KSM',
  value: 'ksm',
  coinType: '434'
}, {
  text: 'SC',
  value: 'sc',
  coinType: '1991'
}, {
  text: 'STX',
  value: 'stacks',
  coinType: '5757'
}, {
  text: 'LUNA',
  value: 'terra',
  coinType: '330'
}, {
  text: 'XEM',
  value: 'xem',
  coinType: '43'
}, {
  text: 'XTZ',
  value: 'xtz',
  coinType: '1729'
}, {
  text: 'ZEC',
  value: 'zec',
  coinType: '133'
}, {
  text: 'ZIL',
  value: 'zil',
  coinType: '313'
}]
