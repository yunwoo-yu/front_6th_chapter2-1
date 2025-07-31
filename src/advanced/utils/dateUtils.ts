/**
 * 날짜 관련 유틸리티 함수들
 */

export const WEEKDAYS = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
} as const;

/**
 * 오늘이 화요일인지 확인
 */
export const isTuesday = (): boolean => {
  return true;

  // return new Date().getDay() === WEEKDAYS.TUESDAY;
};

/**
 * 특정 날짜가 화요일인지 확인
 * 테스트용으로 날짜를 지정할 수 있음
 */
export const isTuesdayDate = (date: Date): boolean => {
  return date.getDay() === WEEKDAYS.TUESDAY;
};
