/* Nota 官网交互：移动菜单、导航高亮、复制 SHA、手风琴 */
(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ---------------- 移动端菜单 ---------------- */
  const navToggle = $('#navToggle');
  const navLinks = $('#navLinks');

  const closeMenu = () => {
    if (!navLinks) return;
    navLinks.classList.remove('open');
    navToggle?.setAttribute('aria-expanded', 'false');
  };

  navToggle?.addEventListener('click', () => {
    const open = navLinks?.classList.toggle('open') ?? false;
    navToggle.setAttribute('aria-expanded', String(open));
  });

  navLinks?.addEventListener('click', (e) => {
    if (e.target instanceof HTMLAnchorElement) closeMenu();
  });

  document.addEventListener('click', (e) => {
    if (!navLinks?.classList.contains('open')) return;
    const target = e.target;
    if (target instanceof Node && (navLinks.contains(target) || navToggle?.contains(target))) return;
    closeMenu();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  /* ---------------- 导航高亮 ---------------- */
  const sectionIds = ['features', 'modes', 'screens', 'download', 'tutorials', 'faq'];
  const sections = sectionIds.map((id) => document.getElementById(id)).filter(Boolean);
  const linkMap = new Map(
    $$('#navLinks a')
      .map((a) => {
        const id = (a.getAttribute('href') || '').replace('#', '');
        return [id, a];
      })
      .filter(([id]) => sectionIds.includes(id)),
  );

  if ('IntersectionObserver' in window && sections.length) {
    const visible = new Map();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          visible.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
        });
        let bestId = '';
        let best = 0;
        visible.forEach((ratio, id) => {
          if (ratio > best) {
            best = ratio;
            bestId = id;
          }
        });
        linkMap.forEach((link, id) => link.classList.toggle('is-active', id === bestId));
      },
      { rootMargin: '-20% 0px -55% 0px', threshold: [0.05, 0.25, 0.5] },
    );
    sections.forEach((s) => observer.observe(s));
  }

  /* ---------------- Toast ---------------- */
  const toastEl = $('#toast');
  let toastTimer = 0;
  const toast = (text) => {
    if (!toastEl) return;
    toastEl.textContent = text;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toastEl.classList.remove('show'), 2200);
  };

  /* ---------------- 复制 SHA-256 ---------------- */
  const copyText = async (text) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      const area = document.createElement('textarea');
      area.value = text;
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand('copy');
      area.remove();
      return ok;
    } catch {
      return false;
    }
  };

  $$('.copy-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const text = btn.getAttribute('data-copy') || '';
      const ok = await copyText(text);
      toast(ok ? 'SHA-256 已复制到剪贴板' : '复制失败，请手动选择复制');
      if (ok) {
        const old = btn.textContent;
        btn.textContent = '已复制 ✓';
        window.setTimeout(() => {
          btn.textContent = old;
        }, 1600);
      }
    });
  });

  /* ---------------- 教程 / FAQ 手风琴：一次只开一个 ---------------- */
  const setupAccordion = (selector) => {
    const items = $$(selector);
    if (!items.length) return;
    items.forEach((item) => {
      item.addEventListener('toggle', () => {
        if (!item.open) return;
        items.forEach((other) => {
          if (other !== item) other.open = false;
        });
      });
    });
  };

  setupAccordion('#tutorialList > details');
  setupAccordion('#faq details.faq-item');

  /* ---------------- 下载链接轻提示 ---------------- */
  $$('a[download]').forEach((a) => {
    a.addEventListener('click', () => {
      const name = a.getAttribute('href')?.split('/').pop() || '安装包';
      toast(`开始下载：${name}`);
    });
  });

  /* ---------------- 首屏年份 ---------------- */
  const year = new Date().getFullYear();
  $$('[data-year]').forEach((el) => {
    el.textContent = String(year);
  });
})();


/* ============================================================
   模式切换 + 试听演示（2026）
   ============================================================ */
(() => {
  'use strict';

  const tabs = Array.from(document.querySelectorAll('.mode-tab'));
  const panels = Array.from(document.querySelectorAll('.mode-panel'));

  const setMode = (mode) => {
    tabs.forEach((tab) => {
      const on = tab.dataset.mode === mode;
      tab.classList.toggle('active', on);
      tab.setAttribute('aria-selected', String(on));
    });
    panels.forEach((panel) => {
      panel.classList.toggle('active', panel.dataset.panel === mode);
    });
  };

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => setMode(tab.dataset.mode || 'third'));
  });

  let audioCtx = null;
  const ensureCtx = () => {
    if (!audioCtx) {
      const Ctor = window.AudioContext || window.webkitAudioContext;
      if (!Ctor) return null;
      audioCtx = new Ctor({ latencyHint: 'interactive' });
    }
    if (audioCtx.state === 'suspended') void audioCtx.resume();
    return audioCtx;
  };

  const playTone = (ctx, midi, start, dur, strength = 0.15) => {
    const freq = 440 * Math.pow(2, (midi - 69) / 12);
    const osc = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    osc2.type = 'sine';
    osc2.frequency.value = freq * 2;
    filter.type = 'lowpass';
    filter.frequency.value = Math.min(5200, freq * 7);
    filter.Q.value = 0.35;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.linearRampToValueAtTime(strength, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc2.start(start);
    osc.stop(start + dur + 0.02);
    osc2.stop(start + dur + 0.02);
  };

  const demo = (mode, statusEl) => {
    const ctx = ensureCtx();
    if (!ctx) {
      statusEl.textContent = '当前浏览器不支持试听';
      return;
    }
    const start = ctx.currentTime + 0.04;
    statusEl.classList.add('is-playing');
    if (mode === 'maj') {
      playTone(ctx, 60, start, 1.15, 0.13);
      playTone(ctx, 64, start, 1.15, 0.12);
      statusEl.textContent = '大三度：C4 + E4（4 个半音）';
    } else if (mode === 'min') {
      playTone(ctx, 60, start, 1.15, 0.13);
      playTone(ctx, 63, start, 1.15, 0.12);
      statusEl.textContent = '小三度：C4 + E♭4（3 个半音）';
    } else if (mode === 'rhythm') {
      const beats = [69, 69, 69, 69];
      beats.forEach((midi, i) => playTone(ctx, midi, start + i * 0.42, 0.32, 0.12));
      statusEl.textContent = '二八节奏：A4 · 80 BPM 示意';
    }
    window.setTimeout(() => statusEl.classList.remove('is-playing'), 2100);
  };

  document.querySelectorAll('.demo-tone').forEach((btn) => {
    btn.addEventListener('click', () => {
      const panel = btn.closest('.mode-panel');
      const status = panel?.querySelector('[data-demo-status]');
      if (status) demo(btn.dataset.demo || '', status);
    });
  });
})();
