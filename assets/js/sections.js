/* Keep the sidebar aligned with the section being read. */
(() => {
  const sections = [...document.querySelectorAll('.portfolio-section')];
  const links = [...document.querySelectorAll('#sidebar a[data-section]')];
  if (!sections.length) return;

  function updateActiveSection() {
    let active = sections[0];
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= 140) active = section;
    }
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
      active = sections[sections.length - 1];
    }
    for (const link of links) {
      const selected = link.dataset.section === active.id;
      link.parentElement.classList.toggle('active', selected);
      if (selected) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
  }

  let scheduled = false;
  window.addEventListener('scroll', () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      updateActiveSection();
      scheduled = false;
    });
  }, { passive: true });
  window.addEventListener('resize', updateActiveSection);
  for (const link of links) {
    link.addEventListener('click', () => {
      if (document.body.hasAttribute('sidebar-display')) {
        document.getElementById('sidebar-trigger')?.click();
      }
      document.getElementById(link.dataset.section)?.focus({ preventScroll: true });
    });
  }
  updateActiveSection();
})();
