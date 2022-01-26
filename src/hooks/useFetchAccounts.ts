import { reactive, UnwrapRef } from '@nuxtjs/composition-api'

export function useFetchAccounts (service: () => Promise<any>): UnwrapRef<{accounts: any[], loading: boolean }> {
  const ret = reactive({
    accounts: [],
    loading: true,
  })

  void service().then(res => {
    ret.accounts = res.list
    ret.loading = false
  })

  return ret
}
