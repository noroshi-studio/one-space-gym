/* Content is visible before JS. Motion adds an entrance once; it never hides read text. */
(() => {
  'use strict';
  document.documentElement.classList.add('js');
  const intro = document.querySelector('.site-intro');
  if (intro) {
    if (document.documentElement.classList.contains('skip-site-intro')) {
      intro.remove();
    } else {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const finish = () => { if (intro.isConnected) intro.remove(); };
      intro.querySelector('.site-intro__skip')?.addEventListener('click', finish);
      intro.addEventListener('animationend', (event) => { if (event.target === intro) finish(); });
      window.addEventListener('pageshow', (event) => { if (event.persisted) finish(); }, { once: true });
      window.setTimeout(finish, reduceMotion ? 1200 : 3100);
    }
  }
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#main-navigation');
  if (toggle && nav) {
    const label = toggle.querySelector('.menu-label');
    const setOpen = (open, returnFocus = false) => {
      toggle.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
      label.textContent = open ? '閉じる' : 'メニュー';
      if (returnFocus) toggle.focus();
    };
    toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
    nav.addEventListener('click', (event) => {
      const link = event.target.closest('a');
      if (!link || !nav.classList.contains('is-open')) return;
      setOpen(false);
      const url = new URL(link.href);
      if (url.pathname === location.pathname && url.hash) {
        const target = document.getElementById(url.hash.slice(1));
        if (target) { target.setAttribute('tabindex', '-1'); target.focus({ preventScroll: true }); }
      }
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && nav.classList.contains('is-open')) setOpen(false, true);
    });
    document.addEventListener('click', (event) => {
      if (!event.target.closest('.site-header') && nav.classList.contains('is-open')) setOpen(false);
    });
    window.matchMedia('(min-width: 901px)').addEventListener('change', () => setOpen(false));
  }
  const dialog = document.querySelector('.gallery-dialog');
  if (dialog && typeof dialog.showModal === 'function') {
    let opener = null;
    document.querySelectorAll('.gallery-open').forEach(link => {
      link.addEventListener('click', event => {
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        opener = link;
        const source = link.querySelector('img');
        const image = dialog.querySelector('img');
        image.src = source.currentSrc || source.src;
        image.alt = source.alt;
        dialog.querySelector('.dialog-caption').textContent = link.closest('figure').querySelector('figcaption p')?.textContent || source.alt;
        dialog.showModal();
      });
    });
    dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    });
    dialog.addEventListener('close', () => { if (opener) opener.focus({preventScroll:true}); });
  }
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-entering');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08 });
    document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
    reducedMotion.addEventListener('change', (event) => {
      if (event.matches) {
        observer.disconnect();
        document.querySelectorAll('.is-entering').forEach((element) => element.classList.remove('is-entering'));
      }
    });
  }
})();
