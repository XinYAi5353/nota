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
  const sectionIds = ['features', 'screens', 'download', 'tutorials', 'faq'];
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
