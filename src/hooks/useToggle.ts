import { Ref, ref } from '@nuxtjs/composition-api'

export function useToggle (): { value: Ref<boolean>, toggle: Function, show: Function, hide: Function } {
  const value = ref(false)

  return {
    value,
    toggle () {
      value.value = !value.value
    },
    show () {
      value.value = true
    },
    hide () {
      value.value = false
    }
  }
}
