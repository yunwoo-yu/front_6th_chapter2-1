const MAIN_CONTAINER_CLASSES = 'grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 flex-1 overflow-hidden';

export function createMainContainer() {
  const mainContainer = document.createElement('div');

  mainContainer.className = MAIN_CONTAINER_CLASSES;

  return mainContainer;
}
