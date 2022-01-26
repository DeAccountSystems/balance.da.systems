export default {
  success: 0,
  serverError: 500,
  networkError: -1,
  // api error
  apiErrorCodeTokenInvalid: 10004,
  apiErrorCodeTokenExpired: 10005,
  apiErrorCodeLoginRateLimit: 10006,
  apiErrorCodeAccountNotExist: 11000,
  apiErrorCodeAccountNotOnSale: 11004,
  apiErrorCodeNotSupportFullAddress: 11005,
  apiErrorCodeInsufficientBalance: 11007,
  apiErrorCodeCannotBuyOwnedAccount: 11009,
  apiErrorCodeRejectedOutPoint: 11011,
  apiErrorCodeNotEnoughChange: 11014,
  apiErrorCodeSystemUpgrade: 30019,
  // MetaMask
  metaMaskUserDeniedMessageSignature: 4001,
  metaMaskWalletRequestPermissions: -32002,
  metaMaskUserRejectedAccountAccess: -32603,
  // WalletConnect
  walletConnectUserRejectedTheTransaction: 'User rejected the transaction',
  walletConnectInsufficientFundsForTransfer: 'insufficient funds for transfer',
  // TronLink
  tronLinkConfirmationDeclinedByUser: 'Confirmation declined by user',
  tronLinkInsufficientBalance: 'class org.tron.core.exception.ContractValidateException : Validate TransferContract error, no OwnerAccount.',
  // imToken
  imTokenUserCanceled: 'user_canceled',
  // Portal Wallet
  portalWalletInsufficientBalance: 'input capacity not enough'
}
