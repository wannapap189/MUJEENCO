// Keep existing bookmarks working after brand and collection content move.
(() => {
  const destinations = {
    '#brand-film': 'index.html#brand-film',
    '#meaning': 'collection/index.html#meaning',
    '#deities': 'collection/index.html#meaning'
  };
  const followLegacyLink = () => {
    const destination = destinations[window.location.hash];
    if (destination) window.location.replace(new URL(destination, window.location.href).href);
  };
  followLegacyLink();
  window.addEventListener('hashchange', followLegacyLink);
})();
