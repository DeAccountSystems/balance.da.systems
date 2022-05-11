export const CYCLE_CALL_FUNCTION_TIME = 5000

export const TOAST_DURATION_TIME = 1500

// number of decimal places to keep for token amount
export const TOKEN_DECIMAL_PLACES = 8

// number of decimal places to retain the amount
export const FIAT_DECIMAL_PLACES = 2

export const TIME_FORMAT = {
  fullDateTime: 'YYYY-MM-DD HH:mm:ss',
  fullDate: 'YYYY-MM-DD',
  MMDDHHMM: 'MM-DD HH:mm'
}

export const DEFAULT_PAGE_SIZE = 20

export enum WalletProtocol {
  metaMask = 'metaMask',
  tronLink = 'tronLink',
  torus = 'torus',
  uniSign = 'uniSign',
  walletConnect = 'walletConnect'
}

export enum ACTION_TYPE {
  withdraw, // withdraw
  mergeRewards, // merge rewards
  list, // list account
  editPrice, // edit price
  delist, // delist account
  buyAccount, // buy account
  sellAccount, // sell account
  transferToTransit, // activate balance
  setReverseRecord, // set reverse record
  editReverseRecord, // edit reverse record
  delReverseRecord, // delet reverse record
  dasBalanceRegisterOrRenew, // das balance register or renew
  editRecords, // modify parsing records
  transferAccount, // modify owner
  editManager, // modify manager
  renewal, // DAS renewal
  makeOffer, // make offer
  editOfferAdd, // edit quote
  cancelOffer, // cancel offer
  acceptOffer, // accept offer
  offerAccepted, // offer accepted
  editOfferSub, // edit to reduce the offer
  orderRefund, // order refund
  enableSubAccount, // enable sub account
  createSubAccount, // create sub account
  refundOfDeposit = 100, // refund of deposit
}

export enum ParsingRecordType {
  address = 'address',
  profile = 'profile',
  dweb = 'dweb',
  customKey = 'custom_key'
}
