export const supportedLang = ['ko', 'en'] as const;

export const dateName: {[key in string]: ReadonlyArray<string>} = {
    ko: ['일', '월', '화', '수', '목', '금', '토'],
    en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
}