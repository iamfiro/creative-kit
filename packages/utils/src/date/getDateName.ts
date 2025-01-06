import { dateName } from "./date.locale"

/**
 * 날짜를 받아 해당 요일의 이름을 반환합니다
 * @param date 해당 Date 객체
 * @param options lang: 'ko' | 'en'
 * @returns {string} 해당 요일의 이름
 */
export function getDateName(date: Date, options?: { lang: keyof typeof dateName }): string {
    // lang 옵션을 체크하고 없으면 기본값을 설정합니다.
    options = options || { lang: 'ko' }; // 기본값은 ko

    // 지원하지 않는 언어 체크
    if(!dateName[options.lang]) {
        throw new Error('지원하지 않는 언어입니다.')
    };
    
    return dateName[options.lang][date.getDay()];
}