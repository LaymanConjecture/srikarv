(() => {
  const toggle = document.querySelector('.theme-toggle');
  function setTheme(dark) {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    toggle.setAttribute('aria-pressed', String(dark));
  }
  setTheme(document.documentElement.dataset.theme === 'dark');
  toggle.addEventListener('click', () => {
    const dark = document.documentElement.dataset.theme !== 'dark';
    setTheme(dark);
    try { localStorage.setItem('srikar-theme', dark ? 'dark' : 'light'); } catch {}
  });
  addEventListener('storage', event => { if(event.key === 'srikar-theme') setTheme(event.newValue === 'dark'); });
})();
