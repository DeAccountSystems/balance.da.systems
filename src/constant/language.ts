export interface ILanguageOption {
  text: string,
  value: string,
  matcher: RegExp,
}

export const LANGUAGE = {
  en: 'en',
  zhCN: 'zh-CN'
}

export const LanguageOptions: ILanguageOption[] = [{
  text: 'EN',
  value: LANGUAGE.en,
  matcher: /en/i
}, {
  text: 'CN',
  value: LANGUAGE.zhCN,
  matcher: /(^zh$|cn|hans)/i
}]
