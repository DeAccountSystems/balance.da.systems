import { BasicService } from '~/services/BasicService'

export interface IToken {
  chain_type: number,
  contract: string,
  decimals: number,
  name: string,
  price: string,
  symbol: string,
  token_id: string,
}

export interface IConfig {
  sale_cell_capacity: number, // CKB that requires pledge for uploading account
  min_sell_price: number, // minimum price for sale
}

export default class Common extends BasicService {
  /**
   * get token list
   */
  tokens (): Promise<{ token_list: IToken[] }> {
    return this.axios.post('/token/list')
  }

  /**
   * get config info
   */
  config (): Promise<IConfig> {
    return this.axios.post('/config/info')
  }
}
