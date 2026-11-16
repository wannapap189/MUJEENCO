(() => {
  const INTERVAL = 6000;
  document.querySelectorAll('[data-hero-carousel]').forEach(carousel => {
    const slides = [...carousel.querySelectorAll('[data-hero-slide]')];
    const selectors = [...carousel.querySelectorAll('[data-hero-select]')];
    const controls = carousel.querySelector('.hero-controls');
    const toggle = carousel.querySelector('[data-hero-toggle]');
    const caption = carousel.querySelector('figcaption');
    const number = carousel.querySelector('.hero-current-number');
    const name = carousel.querySelector('.hero-current-name');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let current = 0;
    let playing = !reducedMotion.matches;
    let inView = false;
    let hovered = false;
    let timer;
    let request = 0;

    const canPlay = () => playing && inView && !hovered && !document.hidden;
    function schedule() {
      clearTimeout(timer);
      if (!canPlay()) return;
      timer = setTimeout(() => {
        let next = (current + 1) % slides.length;
        while (selectors[next].disabled && next !== current) next = (next + 1) % slides.length;
        if (next !== current) show(next, false);
      }, INTERVAL);
    }
    function setPlaying(value) {
      playing = value;
      request++;
      carousel.dataset.autoplay = value ? 'playing' : 'paused';
      toggle.setAttribute('aria-label', value ? carousel.dataset.pauseLabel : carousel.dataset.playLabel);
      toggle.title = toggle.getAttribute('aria-label');
      caption.setAttribute('aria-live', value ? 'off' : 'polite');
      schedule();
    }
    async function show(index, manual) {
      if (manual) setPlaying(false);
      clearTimeout(timer);
      const ticket = ++request;
      const image = slides[index].querySelector('img');
      try {
        if (image.decode) await image.decode();
        else if (!image.complete) await new Promise((resolve, reject) => {
          image.addEventListener('load', resolve, {once:true});
          image.addEventListener('error', reject, {once:true});
        });
        if (!image.naturalWidth) throw new Error('Image unavailable');
      } catch {
        selectors[index].disabled = true;
        if (ticket === request) schedule();
        return;
      }
      if (ticket !== request || (!manual && !canPlay())) return;
      current = index;
      slides.forEach((slide, i) => {
        slide.classList.toggle('is-active', i === index);
        slide.setAttribute('aria-hidden', String(i !== index));
        selectors[i].setAttribute('aria-pressed', String(i === index));
      });
      number.textContent = `MUJEEN · ${slides[index].dataset.number}`;
      name.textContent = slides[index].dataset.name;
      schedule();
    }
    selectors.forEach((button, index) => button.addEventListener('click', () => show(index, true)));
    carousel.querySelector('.hero-selectors').addEventListener('keydown', event => {
      const selected = selectors.indexOf(document.activeElement);
      if (selected < 0) return;
      let next;
      if (event.key === 'ArrowRight') next = (selected + 1) % slides.length;
      if (event.key === 'ArrowLeft') next = (selected + slides.length - 1) % slides.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = slides.length - 1;
      if (next === undefined || selectors[next].disabled) return;
      event.preventDefault();
      selectors[next].focus();
      show(next, true);
    });
    toggle.addEventListener('click', () => setPlaying(!playing));
    carousel.addEventListener('focusin', event => {
      if (event.target !== toggle) setPlaying(false);
    });
    carousel.addEventListener('pointerenter', event => {
      if (event.pointerType === 'mouse') { hovered = true; schedule(); }
    });
    carousel.addEventListener('pointerleave', event => {
      if (event.pointerType === 'mouse') { hovered = false; schedule(); }
    });
    document.addEventListener('visibilitychange', schedule);
    reducedMotion.addEventListener('change', event => {
      if (event.matches) setPlaying(false);
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => {
        inView = entries[0].isIntersecting && entries[0].intersectionRatio >= .2;
        schedule();
      }, {threshold:[0,.2]}).observe(carousel);
    } else inView = true;
    controls.hidden = false;
    setPlaying(playing);
  });
})();
