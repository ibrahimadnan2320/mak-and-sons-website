(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  function initScrollProgress() {
    const bar = document.createElement("div");
    bar.className = "scroll-progress";
    bar.setAttribute("aria-hidden", "true");
    document.body.append(bar);

    let frame = 0;
    const update = () => {
      frame = 0;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? Math.max(0, Math.min(1, window.scrollY / scrollable)) : 0;
      document.documentElement.style.setProperty("--scroll-progress", progress.toFixed(4));
    };
    const requestUpdate = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate, { passive: true });
    update();
  }

  function initDepthCards() {
    if (reducedMotion || !finePointer) return;
    const cards = document.querySelectorAll(
      ".service-card, .pricing-card, .property-card, .home-project-card, .availability-card, .contact-form, .gallery-item, .family-mark"
    );
    cards.forEach(card => {
      card.classList.add("tilt-card");
      let frame = 0;
      let nextX = 0;
      let nextY = 0;

      card.addEventListener("pointermove", event => {
        const bounds = card.getBoundingClientRect();
        if (!bounds.width || !bounds.height) return;
        const x = (event.clientX - bounds.left) / bounds.width - .5;
        const y = (event.clientY - bounds.top) / bounds.height - .5;
        nextX = (-y * 5.5).toFixed(2);
        nextY = (x * 5.5).toFixed(2);
        if (frame) return;
        frame = requestAnimationFrame(() => {
          card.style.setProperty("--tilt-x", `${nextX}deg`);
          card.style.setProperty("--tilt-y", `${nextY}deg`);
          frame = 0;
        });
      }, { passive: true });

      card.addEventListener("pointerleave", () => {
        if (frame) cancelAnimationFrame(frame);
        frame = 0;
        card.style.setProperty("--tilt-x", "0deg");
        card.style.setProperty("--tilt-y", "0deg");
      }, { passive: true });
    });
  }

  function initAmbientVideos() {
    const videos = [...document.querySelectorAll("[data-ambient-host] .ambient-video")];
    if (!videos.length) return;

    const cores = navigator.hardwareConcurrency || 8;
    const memory = navigator.deviceMemory || 8;
    const staticOnly = reducedMotion || navigator.connection?.saveData || cores <= 4 || memory <= 4;
    if (staticOnly) {
      videos.forEach(video => { video.closest("[data-ambient-host]").dataset.ambientStatic = "true"; });
      return;
    }

    const visibleVideos = new Set();
    const start = video => {
      const host = video.closest("[data-ambient-host]");
      const source = video.querySelector("source[data-ambient-src]");
      if (!source) return;
      visibleVideos.forEach(other => { if (other !== video) other.pause(); });
      if (!source.src) { source.src = source.dataset.ambientSrc; video.load(); }
      video.play().then(() => { host.dataset.ambientReady = "true"; }).catch(() => { host.dataset.ambientStatic = "true"; });
    };

    if (!("IntersectionObserver" in window)) {
      start(videos[0]);
      return;
    }
    const visibility = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { visibleVideos.add(entry.target); if (!document.hidden) start(entry.target); }
        else { visibleVideos.delete(entry.target); entry.target.pause(); }
      });
    }, { rootMargin: "100px 0px", threshold: 0.01 });
    videos.forEach(video => visibility.observe(video));
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) visibleVideos.forEach(video => video.pause());
      else visibleVideos.forEach(start);
    });
    videos.forEach(video => video.addEventListener("error", () => {
      const host = video.closest("[data-ambient-host]");
      host.dataset.ambientStatic = "true";
      delete host.dataset.ambientReady;
    }));
  }

  document.addEventListener("DOMContentLoaded", () => {
    initScrollProgress();
    initDepthCards();
    initAmbientVideos();
  });
})();

