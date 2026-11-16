(() => {
  const isMedia = target => target instanceof Element && target.closest('img, picture, video');
  document.addEventListener('contextmenu', event => {
    if (isMedia(event.target)) event.preventDefault();
  }, true);
  document.addEventListener('dragstart', event => {
    if (isMedia(event.target)) event.preventDefault();
  }, true);
})();
