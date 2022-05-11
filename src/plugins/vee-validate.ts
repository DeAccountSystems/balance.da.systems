import { Context } from '@nuxt/types'
import { extend, setInteractionMode } from 'vee-validate'
import { max, min_value, max_value, required, integer } from 'vee-validate/dist/rules'
import { formatsByName } from '@ensdomains/address-encoder'
import { BSC, CKB, ETH, Polygon } from '~/constant/chain'
import { isValidAdaAddress } from '~/modules/ADAValidator'
import { $tt } from '~/plugins/i18n'
import { thousandSplit } from '~/modules/tools'
import config from '~~/config'

setInteractionMode('lazy')

export default function ({ app }: Context) {
  // field required
  extend('required', {
    ...required,
    message: (fieldName): string => {
      return $tt('Invalid {fieldName}', { fieldName })
    }
  })

  // select required
  extend('selectRequired', {
    ...required,
    message: (fieldName): string => {
      return $tt('Please select {fieldName}', { fieldName })
    }
  })

  // maximum string length
  extend('max', {
    ...max,
    message: (fieldName, args: any): string => {
      return $tt('{fieldName} must not exceed {length} characters', {
        fieldName,
        length: args.length
      })
    }
  })

  // minimum amount
  extend('minAmount', {
    ...min_value,
    params: ['min', 'unit'],
    message: (fieldName, args: any): string => {
      return $tt('{fieldName} must be greater than or equal to {min} {unit}', {
        fieldName,
        min: thousandSplit(args.min),
        unit: args.unit,
      })
    }
  })

  // maximum amount
  extend('maxAmount', {
    ...max_value,
    params: ['max', 'unit'],
    message: (fieldName, args: any): string => {
      return $tt('{fieldName} must be less than or equal to {max} {unit}', {
        fieldName,
        max: thousandSplit(args.max),
        unit: args.unit
      })
    }
  })

  // positive integers
  extend('positiveIntegers', {
    validate (value: string) {
      return parseInt(value) === Number(value) && Number(value) > 0
    },
    message: (fieldName): string => {
      return $tt('{fieldName} must be a positive integer', { fieldName })
    }
  })

  // check address format
  extend('address', {
    params: ['key'],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    message: (fieldName, args: any): string => {
      // @ts-ignore
      return $tt('{chain} address format is wrong', { chain: args.key.toUpperCase() })
    },
    validate (value: string, args: any): boolean {
      try {
        let symbol = args.key.toUpperCase()
        if ([BSC.symbol, 'BSC', 'HECO', Polygon.symbol, 'POLYGON'].includes(symbol)) {
          symbol = ETH.symbol
        }
        if (symbol === 'EOS') {
          return /^[1-5a-z.]{0,11}[1-5a-z]$/.test(value)
        }
        if (symbol === 'ADA') {
          return isValidAdaAddress(value)
        }
        if (symbol === CKB.symbol) {
          if (config.isProdData) {
            return /^ckb1[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{42,}$/i.test(value)
          }
          else {
            return /^ckt1[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{42,}$/i.test(value)
          }
        }
        if (symbol === ETH.symbol) {
          return /^0x[0-9a-fA-F]{40}$/i.test(value)
        }
        if (!formatsByName[symbol]) {
          return true
        }
        formatsByName[symbol].decoder(value)
        return true
      }
      catch (err) {
        console.error(err)
        return false
      }
    }
  })

  // object key
  extend('objectkey', {
    validate (value: string) {
      return /^[a-z0-9_]+$/g.test(value)
    },
    message: (fieldName): string => {
      return $tt('{fieldName} can only contain lowercase letters, numbers and underscores', { fieldName })
    }
  })

  // integer
  extend('integer', {
    ...integer,
    message: (fieldName): string => {
      return $tt('{fieldName} must be an integer', { fieldName: fieldName })
    },
  })
}
