/**
 * Manual 컴포넌트
 * 이용 안내 모달을 표시
 */

/**
 * Manual 토글 버튼 HTML 렌더링
 * @returns {string} Manual 토글 버튼 HTML
 */
function renderManualToggleButton() {
  return `
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      ></path>
    </svg>
  `;
}

/**
 * Manual 패널 HTML 렌더링
 * @returns {string} Manual 패널 HTML
 */
function renderManualPanel() {
  return `
    <button
      class="absolute top-4 right-4 text-gray-500 hover:text-black"
      onclick="document.querySelector('.fixed.inset-0').classList.add('hidden'); this.parentElement.classList.add('translate-x-full')"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
    </button>
    <h2 class="text-xl font-bold mb-4">📖 이용 안내</h2>
    <div class="mb-6">
      <h3 class="text-base font-bold mb-3">💰 할인 정책</h3>
      <div class="space-y-3">
        <div class="bg-gray-100 rounded-lg p-3">
          <p class="font-semibold text-sm mb-1">개별 상품</p>
          <p class="text-gray-700 text-xs pl-2">
            • 키보드 10개↑: 10%<br />
            • 마우스 10개↑: 15%<br />
            • 모니터암 10개↑: 20%<br />
            • 스피커 10개↑: 25%
          </p>
        </div>
        <div class="bg-gray-100 rounded-lg p-3">
          <p class="font-semibold text-sm mb-1">전체 수량</p>
          <p class="text-gray-700 text-xs pl-2">• 30개 이상: 25%</p>
        </div>
        <div class="bg-gray-100 rounded-lg p-3">
          <p class="font-semibold text-sm mb-1">특별 할인</p>
          <p class="text-gray-700 text-xs pl-2">
            • 화요일: +10%<br />
            • ⚡번개세일: 20%<br />
            • 💝추천할인: 5%
          </p>
        </div>
      </div>
    </div>
    <div class="mb-6">
      <h3 class="text-base font-bold mb-3">🎁 포인트 적립</h3>
      <div class="space-y-3">
        <div class="bg-gray-100 rounded-lg p-3">
          <p class="font-semibold text-sm mb-1">기본</p>
          <p class="text-gray-700 text-xs pl-2">• 구매액의 0.1%</p>
        </div>
        <div class="bg-gray-100 rounded-lg p-3">
          <p class="font-semibold text-sm mb-1">추가</p>
          <p class="text-gray-700 text-xs pl-2">
            • 화요일: 2배<br />
            • 키보드+마우스: +50p<br />
            • 풀세트: +100p<br />
            • 10개↑: +20p / 20개↑: +50p / 30개↑: +100p
          </p>
        </div>
      </div>
    </div>
    <div class="border-t border-gray-200 pt-4 mt-4">
      <p class="text-xs font-bold mb-1">💡 TIP</p>
      <p class="text-2xs text-gray-600 leading-relaxed">
        • 화요일 대량구매 = MAX 혜택<br />
        • ⚡+💝 중복 가능<br />
        • 상품4 = 품절
      </p>
    </div>
  `;
}

/**
 * Manual 토글 버튼 생성
 * @returns {HTMLElement} Manual 토글 버튼
 */
export function createManualToggleButton() {
  const manualToggleButton = document.createElement('button');

  manualToggleButton.className =
    'fixed top-4 right-4 bg-black text-white p-3 rounded-full hover:bg-gray-900 transition-colors z-50';
  manualToggleButton.innerHTML = renderManualToggleButton();

  return manualToggleButton;
}

/**
 * Manual 오버레이 생성
 * @returns {HTMLElement} Manual 오버레이
 */
export function createManualOverlay() {
  const manualOverlay = document.createElement('div');

  manualOverlay.className = 'fixed inset-0 bg-black/50 z-40 hidden transition-opacity duration-300';

  return manualOverlay;
}

/**
 * Manual 패널 생성
 * @returns {HTMLElement} Manual 패널
 */
export function createManualPanel() {
  const manualPanel = document.createElement('div');

  manualPanel.className =
    'fixed right-0 top-0 h-full w-80 bg-white shadow-2xl p-6 overflow-y-auto z-50 transform translate-x-full transition-transform duration-300';
  manualPanel.innerHTML = renderManualPanel();

  return manualPanel;
}

/**
 * Manual 모달 토글
 */
export function toggleManualModal() {
  const overlay = document.querySelector('.fixed.inset-0');
  const panel = document.querySelector('.fixed.right-0.top-0');

  if (overlay && panel) {
    overlay.classList.toggle('hidden');
    panel.classList.toggle('translate-x-full');
  }
}

/**
 * Manual 모달 닫기
 */
export function closeManualModal() {
  const overlay = document.querySelector('.fixed.inset-0');
  const panel = document.querySelector('.fixed.right-0.top-0');

  if (overlay && panel) {
    overlay.classList.add('hidden');
    panel.classList.add('translate-x-full');
  }
}
