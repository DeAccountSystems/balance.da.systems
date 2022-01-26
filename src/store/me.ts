import { ActionTree, MutationTree, GetterTree } from 'vuex'
import { augmentKeys, chainIdHexToNumber } from '~/modules/tools'
import { BSC, ETH, IMainChain, Polygon } from '~/constant/chain'
import { IReverseRecordRes } from '~/services/Account'

export interface IConnectedAccount {
  address: string,
  chain: IMainChain,
  walletName: string,
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
  setLoggedIn: 'setLoggedIn',
  setCkbAddressList: 'setCkbAddressList',
  setAvailableBalance: 'setAvailableBalance',
  setTransitBalance: 'setTransitBalance',
  setReverseRecord: 'setReverseRecord',
  // actions
  fetchBalance: 'fetchBalance',
  fetchReverseRecord: 'fetchReverseRecord',
  // getters
  computedChainId: 'computedChainId',
  computedEvmChainId: 'computedEvmChainId'
}

export const state = () => ({
  inviter: '',
  channel: '',
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  connectedAccount: {
    address: ''
  } as IConnectedAccount,
  loggedIn: false,
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
    state.connectedAccount = connectedAccount
    state.loggedIn = true
  },
  [keys.setLoggedIn]: (state, status: boolean) => {
    state.loggedIn = status
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
      const computedChainId = getters[keys.computedChainId]
      const address = state.ckbAddressList.find((item) => {
        return item.address === state.connectedAccount.address && item.addressChainId === computedChainId
      })

      const res = await this.$services.account.balanceInfo({
        chain_type: computedChainId,
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
        chain_type: getters[keys.computedChainId],
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
  [keys.computedChainId] (state): number {
    const chainId = state.connectedAccount.chain?.chainId
    if ([BSC.chainId, Polygon.chainId].includes(chainId)) {
      return ETH.chainId
    }
    return chainId
  },
  [keys.computedEvmChainId] (): number {
    const { ethereum } = window
    if (typeof ethereum !== 'undefined' && (ethereum.networkVersion || ethereum.chainId)) {
      return chainIdHexToNumber(ethereum.networkVersion || ethereum.chainId)
    }
    else {
      return 0
    }
  }
}

export const ME_KEYS = augmentKeys(keys, keys.namespace)
