import Axios, { AxiosInstance } from 'axios'
import { Context } from '@nuxt/types'
import { servicesApi } from '~~/config'
import { onFulfilled, onRejected } from './interceptors'

export class BasicService {
  axios: AxiosInstance

  constructor (context: Context) {
    this.axios = Axios.create({
      baseURL: servicesApi,
      withCredentials: true
    })
    this.axios.interceptors.response.use(onFulfilled(context), onRejected)
  }
}
