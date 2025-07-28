const MAIN_CONTAINER_CLASSES = 'grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 flex-1 overflow-hidden';
const SELECTOR_CONTAINER_CLASSES = 'mb-6 pb-6 border-b border-gray-200';

export function createMainContainer() {
  const mainContainer = document.createElement('div');

  mainContainer.className = MAIN_CONTAINER_CLASSES;

  return mainContainer;
}

export function createSelectorContainer() {
  const selectorContainer = document.createElement('div');

  selectorContainer.className = SELECTOR_CONTAINER_CLASSES;

  return selectorContainer;
}
