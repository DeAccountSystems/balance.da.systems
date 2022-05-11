import BN from 'bn.js'
import Decimal from 'decimal.js'
// @ts-expect-error
import abcCopy from 'abc-copy'
import { SignTypedDataVersion, TypedMessage, TypedDataUtils } from '@metamask/eth-sig-util'
import dayjs, { Dayjs } from 'dayjs'
import { TIME_FORMAT, TOKEN_DECIMAL_PLACES } from '~/constant'
import { CKB } from '~/constant/chain'
import Web3Utils from 'web3-utils'
import Das from 'das-sdk'

/**
 * Used to determine whether it is a mobile terminal
 */
export function isMobile (breakpoint?: any): boolean {
  if (typeof breakpoint !== 'number') breakpoint = 960

  return window.innerWidth < breakpoint
}

/**
 * Enhance the key of the module in vuex, because these modules have namespace, so the outside world must add namespace if they want to use it.
 * @param keys
 * @param namespace
 */
export function augmentKeys<T> (keys: T, namespace: string): T {
  const ret: any = {}
  for (const key in keys) {
    if (!Object.prototype.hasOwnProperty.call(keys, key)) {
      continue
    }

    if (key === 'namespace') {
      ret[key] = keys[key]
    }
    else {
      ret[key] = `${namespace}/${keys[key]}`
    }
  }
  return ret
}

/**
 * shrinkUnit
 * @param value
 * @param shrinkDecimals
 * @param precision
 */
export function shrinkUnit (value: string|number|Decimal, shrinkDecimals: number, precision = 8): string {
  value = value || 0
  const decimalNum = Decimal.div(value, 10 ** shrinkDecimals)
  let decimals = decimalNum.decimalPlaces()

  if (decimals > precision) {
    decimals = precision
  }
  return decimalNum.toFixed(decimals, Decimal.ROUND_DOWN)
}

export function fromSatoshi (satoshi: string): string {
  return shrinkUnit(satoshi, CKB.decimals, TOKEN_DECIMAL_PLACES)
}

/**
 * expandUnit
 * @param value
 * @param decimals
 * @param precision
 */
export function expandUnit (value: string|number|Decimal, decimals: number, precision = 0): string {
  value = value || 0
  return Decimal.mul(value, 10 ** decimals).toFixed(precision, Decimal.ROUND_DOWN)
}

/**
 * Thousands of divisions
 * @param num
 * @param digits
 */
export function thousandSplit (num: number | string | Decimal, digits?: number): string {
  if (digits && digits > 0) {
    if (Decimal.isDecimal(num)) {
      num = (num as Decimal).toFixed(digits).toString()
    }
    else {
      num = new Decimal(num).toFixed(digits).toString()
    }
  }
  const strNum = num + ''
  if (strNum.includes('.')) {
    return (num + '').replace(/(\d)(?=(\d{3})+\.)/g, '$1,')
  }
  else {
    return strNum.replace(/(\d)(?=(?:\d{3})+$)/g, '$1,')
  }
}

/**
 * Copy data to the clipboard
 * @param text
 * @param el
 */
export function copyText (text: string, el?: Element): Promise<void> {
  return abcCopy(text, {
    target: el
  })
}

/**
 * String reduction
 * @param inputString
 * @param head
 * @param tail
 * @param tokenStr
 */
export function collapseString (inputString = '', head = 4, tail = 4, tokenStr = '...'): string {
  if (inputString.length > 12) {
    return inputString.slice(0, head) + tokenStr + inputString.slice(-tail)
  }
  else {
    return inputString
  }
}

/**
 * Handling dayjs format not supported in safari 2019-07-02T13:34:11+0000
 * @param timestamp
 */
export function safariTimestampFormat (timestamp: string | number | Dayjs): string | number | Dayjs {
  if (typeof timestamp === 'string') {
    return timestamp.replace(/\+0000/, 'Z')
  }
  else {
    return timestamp
  }
}

/**
 * Convert the time to the specified time format
 * @param timestamp
 * @param template
 */
export function formatDateTime (timestamp: string | number | Dayjs, template = TIME_FORMAT.fullDateTime): string {
  timestamp = safariTimestampFormat(timestamp)
  return dayjs(timestamp).format(template)
}

/**
 * load script
 * @param src
 * @param id
 */
export function loadScript (src: string, id: string): Promise<any> {
  const script = 'script'
  const firstScript: HTMLScriptElement = document.getElementsByTagName(script)[0]
  if (document.getElementById(id)) {
    return Promise.resolve()
  }
  const scriptElement: HTMLScriptElement = document.createElement(script)
  scriptElement.id = id
  scriptElement.src = src
  firstScript.parentNode?.insertBefore(scriptElement, firstScript)

  return new Promise((resolve, reject) => {
    scriptElement.onload = resolve
    scriptElement.onerror = reject
  })
}

/**
 * get all user agent
 */
export function getAllUserAgent () {
  const ua: string = window.navigator.userAgent.toLowerCase()

  const wechat = ua.includes('micromessenger')
  const android = ua.includes('android')
  const ios = ua.includes('iphone')
  const ipados = ua.includes('ipad')

  return {
    // app user agent
    wechat,
    weibo: ua.includes('weibo'),
    abcwallet: ua.includes('abcwallet'),
    mathwallet: ua.includes('mdsapp'),
    tokenpocket: ua.includes('tokenpocket'),
    bitpie: ua.includes('bitpie'),
    // platform user agent
    android,
    ios,
    ipados,
    mobile: android || ios,
    windows: ua.includes('windows'),
    ubuntu: ua.includes('ubuntu'),
    mac: ua.includes('mac'),
    messenger: !wechat && (
      ua.includes('messenger') ||
      ua.includes('fbav') ||
      ua.includes('fban') ||
      window.location.href.includes('fb_iframe_origin')
    )
  }
}

/**
 * detects if the given user agent is supported
 * @param uaList
 */
export function isUASupported (uaList: string[]): boolean {
  const uaMap = getAllUserAgent()
  return uaList.some(ua => (uaMap as any)[ua])
}

/**
 * detect if the visitor is coming from mobile
 */
export function isMobileDevices (): boolean {
  return isUASupported(['wechat', 'android', 'ios'])
}

/**
 * check if the current access environment is a SafePal wallet environment
 */
export function isSafePalWallet (): boolean {
  const { ethereum } = window
  return !!(ethereum?.isSafePal)
}

/**
 * check if the current access environment is a Bitpie wallet environment
 */
export function isBitpieWallet (): boolean {
  return isUASupported(['bitpie'])
}

/**
 * check if the current access environment is a MathWallet environment
 */
export function isMathWallet (): boolean {
  return isUASupported(['mathwallet'])
}

/**
 * string initial capitalization
 * @param value
 */
export function capitalize (value: string): string {
  if (value) {
    return value.replace(/^\S/, s => s.toUpperCase())
  }
  else {
    return ''
  }
}

/**
 * sleep for a fixed time
 * @param ms
 */
export function sleep (ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * get mmJson hash and chainId hex
 * @param typedData
 * @param chainId
 */
export function mmJsonHashAndChainIdHex (typedData: TypedMessage<any>, chainId: number): string {
  const mmHash = TypedDataUtils.eip712Hash(typedData, SignTypedDataVersion.V4).toString('hex')
  const chainIdHex = new BN(chainId).toString(16, 16)
  return mmHash + chainIdHex
}

/**
 * convert a hexadecimal chainId to decimal
 * @param chainId
 */
export function chainIdHexToNumber (chainId: string | number): number {
  const _chainId = Web3Utils.isHexStrict(chainId) ? Web3Utils.hexToNumber(chainId) : chainId
  return Number(_chainId)
}

export function toDottedStyle (inputAccount: string): string {
  return Das.toDottedStyle(inputAccount)
}

export function toHashedStyle (inputAccount: string): string {
  return Das.toHashedStyle(inputAccount)
}
