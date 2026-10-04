try {
  const theme = localStorage.getItem('logitrack-theme');
  document.documentElement.dataset.theme = ['dark', 'light', 'cyber'].includes(theme) ? theme : 'dark';
} catch { document.documentElement.dataset.theme = 'dark'; }
