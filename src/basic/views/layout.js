/**
 * Layout 컴포넌트
 * 메인 레이아웃과 컨테이너를 관리
 */

/**
 * 메인 컨테이너 생성
 * @returns {HTMLElement} 메인 컨테이너
 */
export function createMainContainer() {
  const mainContainer = document.createElement('div');

  mainContainer.className = 'grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 flex-1 overflow-hidden';

  return mainContainer;
}

/**
 * 선택기 컨테이너 생성
 * @returns {HTMLElement} 선택기 컨테이너
 */
export function createSelectorContainer() {
  const selectorContainer = document.createElement('div');

  selectorContainer.className = 'mb-6 pb-6 border-b border-gray-200';

  return selectorContainer;
}
