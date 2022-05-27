import { ActionTree, MutationTree, GetterTree } from 'vuex'
import { augmentKeys } from '~/modules/tools'
import {
  ChainType,
  CoinType,
  CoinTypeToChainIdMap,
  EvmCoinTypes,
  IMainChain
} from '~/constant/chain'
import { IReverseRecordRes } from '~/services/Account'
import { WalletProtocol } from '~/constant'

export interface IConnectedAccount {
  address: string,
  chain: IMainChain,
  protocol: WalletProtocol,
}

export interface ICkbAddress {
  address: string,
  addressChainId: number,
  ckbAddress: string,
  fullCkbAddress: string,
}

const keys = {
  namespace: 'me',
  // mutations
  setInviter: 'setInviter',
  setChannel: 'setChannel',
  setConnectedAccount: 'setConnectedAccount',
  setCkbAddressList: 'setCkbAddressList',
  setAvailableBalance: 'setAvailableBalance',
  setTransitBalance: 'setTransitBalance',
  setReverseRecord: 'setReverseRecord',
  // actions
  fetchBalance: 'fetchBalance',
  fetchReverseRecord: 'fetchReverseRecord',
  // getters
  computedChainType: 'computedChainType',
  computedChainId: 'computedChainId'
}

export const state = () => ({
  inviter: '',
  channel: '',
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  connectedAccount: {
    address: ''
  } as IConnectedAccount,
  ckbAddressList: [] as ICkbAddress[],
  availableBalance: '0',
  transitBalance: '0',
  reverseRecord: {
    account: '',
    is_valid: false
  },
})

export type MeState = ReturnType<typeof state>

export const mutations: MutationTree<MeState> = {
  [keys.setInviter]: (state, inviter: string) => {
    state.inviter = inviter
  },
  [keys.setChannel]: (state, channel: string) => {
    state.channel = channel
  },
  [keys.setConnectedAccount]: (state, connectedAccount: IConnectedAccount) => {
    state.connectedAccount = {
      ...state.connectedAccount,
      ...connectedAccount
    }
  },
  [keys.setCkbAddressList]: (state, ckbAddress: ICkbAddress) => {
    const res = state.ckbAddressList.find((item) => {
      return item.address === ckbAddress.address && item.addressChainId === ckbAddress.addressChainId
    })
    if (res) {
      if (ckbAddress.ckbAddress) {
        res.ckbAddress = ckbAddress.ckbAddress
      }
      if (ckbAddress.fullCkbAddress) {
        res.fullCkbAddress = ckbAddress.fullCkbAddress
      }
    }
    else {
      state.ckbAddressList.push(ckbAddress)
    }
  },
  [keys.setAvailableBalance]: (state, balance: string) => {
    state.availableBalance = balance
  },
  [keys.setTransitBalance]: (state, balance: string) => {
    state.transitBalance = balance
  },
  [keys.setReverseRecord]: (state, reverseRecord: IReverseRecordRes) => {
    state.reverseRecord = reverseRecord
  }
}

export const actions: ActionTree<MeState, MeState> = {
  async [keys.fetchBalance] ({ state, commit, getters }) {
    try {
      const computedChainType = getters[keys.computedChainType]
      const address = state.ckbAddressList.find((item) => {
        return item.address === state.connectedAccount.address && item.addressChainId === computedChainType
      })

      const res = await this.$services.account.balanceInfo({
        chain_type: computedChainType,
        address: state.connectedAccount.address,
        transfer_address: address ? address.ckbAddress : ''
      })
      if (res) {
        commit(keys.setAvailableBalance, res.das_lock_amount)
        commit(keys.setTransitBalance, res.transfer_address_amount)
      }
    }
    catch (err) {
      console.error(err)
      throw err
    }
  },
  async [keys.fetchReverseRecord] ({ commit, state, getters }) {
    const connectedAccount = state.connectedAccount
    if (!connectedAccount.address) {
      return
    }
    try {
      const res = await this.$services.account.getReverseRecord({
        chain_type: getters[keys.computedChainType],
        address: connectedAccount.address
      })
      if (res) {
        commit(keys.setReverseRecord, res)
      }
    }
    catch (err) {
      console.error(err)
      throw err
    }
  }
}

export const getters: GetterTree<MeState, MeState> = {
  [keys.computedChainType] (state): number | undefined {
    const coinType = state.connectedAccount.chain?.coinType
    let value
    if (EvmCoinTypes.includes(coinType)) {
      value = ChainType.eth
    }
    else if ([CoinType.trx].includes(coinType)) {
      value = ChainType.tron
    }
    return value
  },
  [keys.computedChainId] (state): number | undefined {
    const coinType = state.connectedAccount.chain?.coinType
    return CoinTypeToChainIdMap[coinType]
  }
}

export const ME_KEYS = augmentKeys(keys, keys.namespace)
