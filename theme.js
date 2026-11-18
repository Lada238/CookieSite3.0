// Переключатель светлой/тёмной темы (кнопки с атрибутом data-theme)
if (localStorage.theme === 'dark') document.documentElement.classList.add('dark');
document.addEventListener('click', e => {
  if (e.target.closest('[data-theme]'))
    localStorage.theme = document.documentElement.classList.toggle('dark') ? 'dark' : 'light';
});
