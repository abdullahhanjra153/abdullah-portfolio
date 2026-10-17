// Abdullah Hanjra Portfolio — Interactive Experience & Live Telemetry
(() => {
  'use strict';

  // 1. Scroll-reveal interaction
  const items = document.querySelectorAll('.project, .project-card, .principles article, .about-copy, .about-stamp');
  if ('IntersectionObserver' in window) {
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
  }

  // 2. The Boring Company OS — Interactive HUD Tab Switching
  const hudTabs = document.querySelectorAll('.hud-tab');
  const hudPanes = document.querySelectorAll('.hud-pane');

  hudTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const targetId = `pane-${tab.getAttribute('data-tab')}`;
      hudTabs.forEach((t) => t.classList.remove('active'));
      hudPanes.forEach((p) => p.classList.remove('active'));

      tab.classList.add('active');
      const targetPane = document.getElementById(targetId);
      if (targetPane) targetPane.classList.add('active');
    });
  });

  // 3. The Boring Company OS — Live Reality Gate Simulator
  const runGateBtn = document.getElementById('runGateBtn');
  const gateRunOutput = document.getElementById('gateRunOutput');
  const metricPass = document.getElementById('metricPass');
  const metricCode = document.getElementById('metricCode');
  const metricDrift = document.getElementById('metricDrift');
  let isTesting = false;

  if (runGateBtn && gateRunOutput) {
    runGateBtn.addEventListener('click', () => {
      if (isTesting) return;
      isTesting = true;
      runGateBtn.classList.add('is-running');
      runGateBtn.innerHTML = '<span class="btn-icon">⚡</span><span class="btn-text">AUDITING 32 SUITES...</span>';
      gateRunOutput.classList.remove('success');
      gateRunOutput.textContent = 'Spawning Dwight (Red Team) & Angela (Reality Gate)...';

      let count = 0;
      const interval = setInterval(() => {
        count += Math.floor(Math.random() * 7) + 5;
        if (count >= 32) count = 32;
        if (metricPass) metricPass.textContent = `${count}/32`;
        gateRunOutput.textContent = `Running strict TDD assertions: ${count}/32 suites passing...`;

        if (count >= 32) {
          clearInterval(interval);
          setTimeout(() => {
            if (metricCode) metricCode.textContent = '$? === 0';
            if (metricDrift) metricDrift.textContent = '0.0%';
            gateRunOutput.classList.add('success');
            gateRunOutput.textContent = '✔ REALITY GATE PASSED: Exit code 0 ($? === 0). 0 Hallucinations.';
            runGateBtn.classList.remove('is-running');
            runGateBtn.innerHTML = '<span class="btn-icon">✔</span><span class="btn-text">VERIFIED CLEAN ($? === 0)</span>';
            setTimeout(() => {
              runGateBtn.innerHTML = '<span class="btn-icon">▶</span><span class="btn-text">RUN REALITY GATE TEST</span>';
              isTesting = false;
            }, 3000);
          }, 300);
        }
      }, 120);
    });
  }

  // 4. One-Click Quickstart Command Copy
  const copyQsBtn = document.getElementById('copyQsBtn');
  if (copyQsBtn) {
    copyQsBtn.addEventListener('click', async () => {
      const textToCopy = copyQsBtn.getAttribute('data-copy') || 'npx theboringcompany --mission "build"';
      try {
        await navigator.clipboard.writeText(textToCopy);
        const originalText = copyQsBtn.querySelector('.copy-btn-text')?.textContent || 'Copy';
        copyQsBtn.classList.add('copied');
        copyQsBtn.innerHTML = '<span class="copy-btn-text">✔ Copied!</span>';
        setTimeout(() => {
          copyQsBtn.classList.remove('copied');
          copyQsBtn.innerHTML = `<span class="copy-btn-text">${originalText}</span>`;
        }, 2200);
      } catch (err) {
        // Fallback for older environments
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        copyQsBtn.classList.add('copied');
        copyQsBtn.innerHTML = '<span class="copy-btn-text">✔ Copied!</span>';
        setTimeout(() => {
          copyQsBtn.classList.remove('copied');
          copyQsBtn.innerHTML = '<span class="copy-btn-text">Copy</span>';
        }, 2200);
      }
    });
  }

  // 5. Smart Video Editor — Interactive Timeline Playback
  const videoPlayBtn = document.getElementById('videoPlayBtn');
  const videoVisual = document.getElementById('videoVisual');
  const screenBarStatus = document.getElementById('screenBarStatus');
  const previewFrameText = document.getElementById('previewFrameText');
  let isPlaying = false;

  if (videoPlayBtn && videoVisual) {
    videoPlayBtn.addEventListener('click', () => {
      isPlaying = !isPlaying;
      if (isPlaying) {
        videoVisual.classList.add('is-playing');
        videoPlayBtn.textContent = '❚❚';
        videoPlayBtn.setAttribute('aria-label', 'Pause timeline playback');
        if (screenBarStatus) screenBarStatus.textContent = 'PLAYING · 00:04:12';
        if (previewFrameText) previewFrameText.textContent = 'STREAMING KEYFRAMES...';
      } else {
        videoVisual.classList.remove('is-playing');
        videoPlayBtn.textContent = '▶';
        videoPlayBtn.setAttribute('aria-label', 'Play timeline preview');
        if (screenBarStatus) screenBarStatus.textContent = 'EDIT / TIMELINE';
        if (previewFrameText) previewFrameText.textContent = 'CLICK TO PLAY TIMELINE';
      }
    });
  }

  // 6. Subtle Parallax for Hero Geometry (Restrained & GPU-optimized)
  const heroArt = document.querySelector('.hero-art');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (heroArt && !prefersReduced && window.innerWidth > 800) {
    const cardA = heroArt.querySelector('.card-a');
    const cardB = heroArt.querySelector('.card-b');
    const core = heroArt.querySelector('.core');

    heroArt.addEventListener('mousemove', (e) => {
      const rect = heroArt.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      if (cardA) cardA.style.transform = `translate3d(${x * 14}px, ${y * 14}px, 0)`;
      if (cardB) cardB.style.transform = `translate3d(${x * -14}px, ${y * -14}px, 0)`;
      if (core) core.style.transform = `translate(-50%, -50%) translate3d(${x * 8}px, ${y * 8}px, 0)`;
    });

    heroArt.addEventListener('mouseleave', () => {
      if (cardA) cardA.style.transform = '';
      if (cardB) cardB.style.transform = '';
      if (core) core.style.transform = 'translate(-50%, -50%)';
    });
  }
})();
