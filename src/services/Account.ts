import { TypedMessage } from '@metamask/eth-sig-util'
import { BasicService } from '~/services/BasicService'
import { LOCK_SCRIPT_TYPE } from '~/constant/chain'
import { DEFAULT_PAGE_SIZE, ParsingRecordType } from '~/constant'

export interface ITrxHistoryParams {
  chainType: number,
  address: string,
  page: number,
  size?: number,
}

export interface ITrxHistoryList {
  account: string,
  action: number,
  block_number: number,
  hash: string,
  timestamp: number,
  capacity: string,
}

export interface ITrxHistoryRes {
  list: ITrxHistoryList[],
  total: number,
}

export interface IAccountParsingRecord {
  type: ParsingRecordType | string,
  key: string,
  label: string,
  value: string,
  ttl: string,
}

export interface IAccountParsingRecords {
  records: IAccountParsingRecord[],
}

export interface IWaitSignMsgList {
  sign_type: LOCK_SCRIPT_TYPE,
  sign_msg: string,
}

interface IAvailableBalanceWithdrawParams {
  evm_chain_id: number,
  chain_type: number,
  address: string,
  receiver_chain_type: number,
  receiver_address: string,
  amount: string,
  withdraw_all: boolean,
}

export interface MsgToBeSignedRes {
  sign_key: string,
  sign_list: IWaitSignMsgList[],
  mm_json: TypedMessage<any>,
}

interface ITransitBalanceTransferParams {
  chain_type: number,
  address: string,
  transfer_address: string,
}

interface ITransitBalanceTransferRes extends MsgToBeSignedRes {}

interface ITrxSendParams extends MsgToBeSignedRes {}

interface IBalanceInfoParams {
  chain_type: number,
  address: string,
  transfer_address: string,
}

interface IBalanceInfoRes {
  transfer_address_amount: string,
  das_lock_amount: string,
}

export interface IReverseRecordRes {
  account: string,
  is_valid: boolean,
}

export default class Account extends BasicService {
  /**
   * my transaction records
   * @param chainType
   * @param address
   * @param page
   * @param size
   */
  myTrxHistory ({
    chainType,
    address,
    page,
    size = DEFAULT_PAGE_SIZE
  }: ITrxHistoryParams): Promise<ITrxHistoryRes> {
    return this.axios.post('/transaction/list', {
      chain_type: chainType,
      address,
      page,
      size
    })
  }

  /**
   * Get account parsing records
   * @param accountName
   */
  accountParsingRecords (accountName: string): Promise<IAccountParsingRecords> {
    return this.axios.post('/account/records', {
      account: accountName
    })
  }

  /**
   * available balance withdraw
   * @param evm_chain_id
   * @param chain_type
   * @param address
   * @param receiver_chain_type
   * @param receiver_address
   * @param withdraw_all
   * @param amount
   */
  availableBalanceWithdraw ({
    evm_chain_id,
    chain_type,
    address,
    receiver_chain_type,
    receiver_address,
    withdraw_all,
    amount
  }: IAvailableBalanceWithdrawParams): Promise<MsgToBeSignedRes> {
    return this.axios.post('/balance/withdraw', {
      evm_chain_id,
      chain_type,
      address,
      receiver_chain_type,
      receiver_address,
      withdraw_all,
      amount
    })
  }

  /**
   * transit balance has been transferred to available balance
   * @param chain_type
   * @param address
   * @param transfer_address
   */
  transitBalanceTransfer ({
    chain_type,
    address,
    transfer_address
  }: ITransitBalanceTransferParams): Promise<ITransitBalanceTransferRes> {
    return this.axios.post('/balance/transfer', {
      chain_type,
      address,
      transfer_address
    })
  }

  /**
   * balance info
   * @param transfer_address
   * @param chain_type
   * @param address
   */
  balanceInfo ({
    chain_type,
    address,
    transfer_address
  }: IBalanceInfoParams): Promise<IBalanceInfoRes> {
    return this.axios.post('/balance/info', {
      chain_type,
      address,
      transfer_address
    })
  }

  /**
   * get reverse record
   * @param chain_type
   * @param address
   */
  getReverseRecord ({
    chain_type,
    address
  }: {
    chain_type: number,
    address: string,
  }): Promise<IReverseRecordRes> {
    return this.axios.post('/reverse/latest', {
      chain_type,
      address
    })
  }

  /**
   * send transaction
   * @param sign_key
   * @param sign_list
   * @param mm_json
   */
  sendTransaction ({
    sign_key,
    sign_list,
    mm_json
  }: ITrxSendParams): Promise<{ hash: string }> {
    return this.axios.post('/transaction/send', {
      sign_key,
      sign_list,
      mm_json
    })
  }
}
