// Paul Cee — progressive enhancement (site works without JS)
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const BASE = window.PC_BASE || '/';

  // Theme toggle (explicit choice overrides system preference)
  const root = document.documentElement;
  const effective = () => root.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  const syncIcons = () => { if (!root.dataset.theme) root.dataset.theme = effective(); };
  syncIcons();
  $$('[data-theme-toggle]').forEach(b => b.addEventListener('click', () => {
    const next = effective() === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('pc-theme', next); } catch (e) { }
  }));

  // Mega menus: click to open, Escape / outside click to close
  const megas = $$('.has-mega');
  const closeAll = except => megas.forEach(li => { if (li !== except) { li.classList.remove('is-open'); $('button', li).setAttribute('aria-expanded', 'false'); } });
  megas.forEach(li => {
    const btn = $('button', li);
    btn.addEventListener('click', e => { e.stopPropagation(); const open = !li.classList.contains('is-open'); closeAll(li); li.classList.toggle('is-open', open); btn.setAttribute('aria-expanded', String(open)); });
    li.addEventListener('mouseenter', () => { if (matchMedia('(hover: hover)').matches) { closeAll(li); li.classList.add('is-open'); btn.setAttribute('aria-expanded', 'true'); } });
    li.addEventListener('mouseleave', () => { if (matchMedia('(hover: hover)').matches) { li.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); } });
  });
  document.addEventListener('click', e => { if (!e.target.closest('.has-mega')) closeAll(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAll(); });

  // Mobile nav
  const tgl = $('.nav-toggle'), mob = $('#mobile-nav');
  tgl?.addEventListener('click', () => { const open = tgl.getAttribute('aria-expanded') !== 'true'; tgl.setAttribute('aria-expanded', String(open)); tgl.setAttribute('aria-label', open ? 'Close menu' : 'Open menu'); mob.hidden = !open; });

  // YouTube facade: load iframe only on click (performance + privacy)
  document.addEventListener('click', e => {
    const b = e.target.closest('.yt__play'); if (!b) return;
    const box = b.closest('.yt'); const id = box.dataset.yt;
    box.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0" title="YouTube video" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
  });

  // Copy discount code
  document.addEventListener('click', async e => {
    const b = e.target.closest('[data-copy]'); if (!b) return;
    try { await navigator.clipboard.writeText(b.dataset.copy); } catch (err) { }
    b.classList.add('is-copied'); setTimeout(() => b.classList.remove('is-copied'), 1800);
  });

  // Blog grid "show more"
  $$('[data-paginate]').forEach(grid => {
    const step = +grid.dataset.paginate; const cards = $$('.card, .vid', grid); const btn = grid.parentElement.querySelector('[data-load-more]');
    if (cards.length <= step || !btn) return;
    const noun = cards[0].classList.contains('vid') ? 'videos' : 'articles';
    let shown = step; cards.forEach((c, i) => { c.hidden = i >= shown; });
    btn.hidden = false; btn.textContent = `Show more ${noun} (${cards.length - shown} more)`;
    btn.addEventListener('click', () => {
      const first = cards[shown]; shown += step; cards.forEach((c, i) => { c.hidden = i >= shown; });
      first?.querySelector('a, button')?.focus();
      if (shown >= cards.length) btn.hidden = true; else btn.textContent = `Show more ${noun} (${cards.length - shown} more)`;
    });
  });

  // Table of contents: highlight current section
  const toc = $$('.toc a');
  if (toc.length && 'IntersectionObserver' in window) {
    const map = new Map(toc.map(a => [a.getAttribute('href').slice(1), a]));
    const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { toc.forEach(a => a.classList.remove('is-current')); map.get(en.target.id)?.classList.add('is-current'); } }), { rootMargin: '-20% 0px -70% 0px' });
    map.forEach((a, id) => { const h = document.getElementById(id); if (h) io.observe(h); });
  }

  // Search (client-side over a small JSON index)
  const dlg = $('dialog.search'); let index = null;
  const input = $('#q'); const list = $('.search__results');
  const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const render = q => {
    if (!index) return;
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) { list.innerHTML = ''; return; }
    const hits = index.map(x => ({ x, s: terms.reduce((n, t) => n + (x.t.toLowerCase().includes(t) ? (x.k === 'Guide' ? 3 : 2) : x.k.toLowerCase().includes(t) ? 1 : 0), 0) }))
      .filter(h => h.s >= terms.length).sort((a, b) => b.s - a.s || (b.x.d || '').localeCompare(a.x.d || '')).slice(0, 12);
    list.innerHTML = hits.length ? hits.map(({ x }) => `<li><a href="${x.u}"><span class="mono">${esc(x.k)}${x.d ? ' · ' + x.d.slice(0, 4) : ''}</span>${esc(x.t)}</a></li>`).join('') : `<li class="search__empty">No matches — try “manticore settings” or “beach”.</li>`;
  };
  $$('[data-open-search]').forEach(b => b.addEventListener('click', async () => {
    dlg.showModal(); input.focus();
    if (!index) { try { index = await (await fetch(BASE + 'assets/search.json')).json(); render(input.value); } catch (e) { } }
  }));
  input?.addEventListener('input', () => render(input.value));
  document.addEventListener('keydown', e => { if (e.key === '/' && !/input|textarea/i.test(document.activeElement.tagName)) { e.preventDefault(); $('[data-open-search]')?.click(); } });
  dlg?.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
})();
