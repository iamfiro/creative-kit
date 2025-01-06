import { dateName } from "./date.locale"

/**
 * 날짜를 받아 해당 요일의 이름을 반환합니다
 * @param date 해당 Date 객체
 * @param options lang: 'ko' | 'en'
 * @returns {string} 해당 요일의 이름
 */
export function getDateName(date: Date, options?: { lang: 'ko' | 'en' }): string {
    // lang 옵션을 체크하고 없으면 기본값을 설정합니다.
    if(typeof options === 'undefined') { options = { lang: 'ko' } };
    
    return dateName[options.lang][date.getDay()];
}