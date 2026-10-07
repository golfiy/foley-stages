(() => {
  const root = document.documentElement;
  const params = new URLSearchParams(location.search);
  const SHOT = params.has('shot');
  const stages = [...document.querySelectorAll('[data-stage]')];
  const byName = Object.fromEntries(stages.map((el) => [el.dataset.stage, el]));
  const panel = document.getElementById('demo');

  let forced = null;      // name of a stage pinned from ?shot= or the demo panel
  let lastPointer = 'mouse';

  /* ---------- state ---------- */
  function setActive(el) {
    stages.forEach((s) => s.classList.toggle('is-active', s === el));
  }
  function clear(el) {
    if (el) el.classList.remove('is-active');
    else stages.forEach((s) => s.classList.remove('is-active'));
  }
  const hasVisibleFocus = (el) => !!el.querySelector(':focus-visible');

  /* ---------- mouse / pen ---------- */
  stages.forEach((el) => {
    el.addEventListener('pointerenter', (e) => {
      if (forced || e.pointerType === 'touch') return;
      setActive(el);
    });
    el.addEventListener('pointerleave', (e) => {
      if (forced || e.pointerType === 'touch') return;
      if (!hasVisibleFocus(el)) clear(el);
    });

    /* keyboard: Tab into a column opens it, Tab out closes it */
    el.addEventListener('focusin', (e) => {
      if (forced) return;
      if (e.target.matches(':focus-visible')) setActive(el);
    });
    el.addEventListener('focusout', (e) => {
      if (forced) return;
      if (!el.contains(e.relatedTarget) && !el.matches(':hover')) clear(el);
    });

    /* touch: first tap opens, taps on links inside an open column navigate */
    el.addEventListener('click', (e) => {
      if (forced || lastPointer !== 'touch') return;
      if (!el.classList.contains('is-active')) {
        e.preventDefault();
        setActive(el);
      }
    });
  });

  document.addEventListener('pointerdown', (e) => {
    lastPointer = e.pointerType || 'mouse';
    if (forced || lastPointer !== 'touch') return;
    if (!e.target.closest('[data-stage]')) clear();
  }, true);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !forced) {
      const open = stages.find((s) => s.classList.contains('is-active'));
      clear();
      if (open && open.contains(document.activeElement)) document.activeElement.blur();
    }
  });

  /* ---------- product cards scale to the column ---------- */
  const DESIGN_W = 419.33;
  const bodies = [...document.querySelectorAll('.stage-body')];
  function fit(body, width = body.clientWidth) {
    const product = body.querySelector('.product');
    if (product && width) product.style.setProperty('--z', Math.min(1, width / DESIGN_W).toFixed(4));
  }
  bodies.forEach((b) => fit(b));
  const ro = new ResizeObserver((entries) => entries.forEach((e) => fit(e.target, e.contentRect.width)));
  bodies.forEach((b) => ro.observe(b));

  /* ---------- review modes ---------- */
  function pin(name) {
    forced = name && byName[name] ? name : null;
    if (forced) setActive(byName[forced]); else clear();
    syncPanel();
  }

  const slow = Math.max(1, parseFloat(params.get('slow')) || 1);
  root.style.setProperty('--slow', slow);

  if (SHOT) {
    root.classList.add('shot');
    pin(params.get('shot'));
  }

  /* ---------- demo panel ---------- */
  function syncPanel() {
    if (!panel) return;
    const cur = { state: forced || 'auto', slow: String(parseFloat(getComputedStyle(root).getPropertyValue('--slow')) || 1) };
    panel.querySelectorAll('.seg').forEach((seg) => {
      seg.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === cur[seg.dataset.key])));
    });
  }

  panel.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    const key = b.closest('.seg').dataset.key;
    if (key === 'state') pin(b.dataset.v === 'auto' ? null : b.dataset.v);
    if (key === 'slow') { root.style.setProperty('--slow', b.dataset.v); syncPanel(); }
  });

  document.addEventListener('keydown', (e) => {
    if (e.target.closest('input, textarea')) return;
    if (e.key === '.') { panel.hidden = !panel.hidden; syncPanel(); }
    else if (e.key === 'Escape') panel.hidden = true;
  });
  if (params.has('panel')) panel.hidden = false;
  syncPanel();
})();
