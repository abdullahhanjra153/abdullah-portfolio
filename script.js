// Lightweight interaction: reveal elements as they enter view, with a safe fallback.
(() => {
  const items = document.querySelectorAll('.project, .project-card, .principles article, .about-copy, .about-stamp');
  if (!('IntersectionObserver' in window)) return;
  items.forEach((item) => item.classList.add('reveal-ready'));
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  items.forEach((item) => observer.observe(item));
})();
