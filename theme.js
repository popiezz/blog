(function () {
  var stored = localStorage.getItem('pz-theme');
  var theme = stored === 'dark' ? 'dark' : 'light';
  document.documentElement.dataset.theme = theme;

  function apply(t) {
    theme = t;
    document.body.dataset.theme = t;
    localStorage.setItem('pz-theme', t);
    document.querySelectorAll('.pz-toggle-opt').forEach(function (el) {
      el.classList.toggle('pz-toggle-opt-active', el.dataset.theme === t);
    });
  }

  window.pzSetTheme = apply;

  document.addEventListener('DOMContentLoaded', function () {
    apply(theme);
    document.querySelectorAll('.pz-toggle-opt').forEach(function (el) {
      el.addEventListener('click', function () {
        apply(el.dataset.theme);
      });
    });
  });
})();
