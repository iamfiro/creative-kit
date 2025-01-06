interface FormatPrettyDateReturn {
    year: number;
    month: number;
    day: number;
    hours: number;
    minutes: number;
    seconds: number;
}

/**
 * 기존 Date 함수를 쉽게 접근할 수 있도록 변환하는 함수
 * @param date {Date} Date 객체
 * @returns {FormatPrettyDateReturn} 변환된 Date 객체
 */
export function formatPrettyDate(date: Date): FormatPrettyDateReturn {
    const {getFullYear, getMonth, getDate, getHours, getMinutes, getSeconds} = date;
    
    return {
        year: getFullYear(),
        month: getMonth() + 1,
        day: getDate(),
        hours: getHours(),
        minutes: getMinutes(),
        seconds: getSeconds()
    }
}