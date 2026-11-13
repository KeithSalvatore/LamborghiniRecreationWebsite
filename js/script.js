(() => {
  "use strict";

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  const modelData = {
    revuelto: {
      name: "REVUELTO",
      image: "assets/images/revuelto-orange.png",
      description: "A dramatic V12 hybrid flagship concept combining electrified performance with bold, angular design.",
      engine: "6.5L V12 Hybrid",
      power: "1,001 HP",
      speed: "2.5 s",
      price: "$608,358"
    },
    huracan: {
      name: "HURACÁN EVO",
      image: "assets/images/huracan-orange.png",
      description: "A low-slung V10-inspired supercar concept built around sharp lines, responsive handling, and a vivid orange finish.",
      engine: "5.2L V10",
      power: "640 HP",
      speed: "3.2 s",
      price: "$261,274"
    },
    urus: {
      name: "URUS PERFORMANTE",
      image: "assets/images/urus-black.png",
      description: "A performance SUV concept that combines a muscular stance with a dark, stealth-inspired finish.",
      engine: "4.0L Twin-Turbo V8",
      power: "666 HP",
      speed: "3.3 s",
      price: "$282,995"
    },
    sian: {
      name: "SIÁN FKP 37",
      image: "assets/images/sian-green.png",
      description: "A limited-production-inspired hybrid supercar concept with futuristic angles and a striking green look.",
      engine: "V12 Hybrid",
      power: "819 HP",
      speed: "2.8 s",
      price: "$3,640,000"
    },
    aventador: {
      name: "AVENTADOR SVJ",
      image: "assets/images/aventador-silver.png",
      description: "A dramatic V12 supercar concept with a silver finish, low profile, and track-focused visual character.",
      engine: "6.5L V12",
      power: "759 HP",
      speed: "2.8 s",
      price: "$573,966"
    }
  };

  const storage = {
    get(key, fallback) {
      try {
        const value = localStorage.getItem(key);
        return value === null ? fallback : JSON.parse(value);
      } catch {
        return fallback;
      }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* Storage may be disabled. */ }
    }
  };

  // Mobile navigation
  const menuToggle = $("#menuToggle");
  const primaryNav = $("#primaryNav");

  function closeMenu() {
    menuToggle?.setAttribute("aria-expanded", "false");
    menuToggle?.setAttribute("aria-label", "Open navigation");
    primaryNav?.classList.remove("is-open");
  }

  menuToggle?.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") !== "true";
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
    primaryNav?.classList.toggle("is-open", isOpen);
  });

  $$("#primaryNav a").forEach(link => link.addEventListener("click", closeMenu));
  document.addEventListener("click", event => {
    if (primaryNav?.classList.contains("is-open") &&
        !primaryNav.contains(event.target) && !menuToggle?.contains(event.target)) closeMenu();
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 760) closeMenu();
  });

  // Hero slideshow: automatic cycling, arrows, and direct slide controls.
  const heroSlides = $$(".hero-slide");
  const slideDots = $$(".slide-dot");
  let activeSlide = 0;
  let slideTimer;

  function showSlide(index) {
    if (!heroSlides.length) return;
    activeSlide = (index + heroSlides.length) % heroSlides.length;
    heroSlides.forEach((slide, i) => slide.classList.toggle("is-active", i === activeSlide));
    slideDots.forEach((dot, i) => {
      dot.classList.toggle("is-active", i === activeSlide);
      if (i === activeSlide) dot.setAttribute("aria-current", "true");
      else dot.removeAttribute("aria-current");
    });
  }
  function restartSlideshow() {
    window.clearInterval(slideTimer);
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      slideTimer = window.setInterval(() => showSlide(activeSlide + 1), 6500);
    }
  }
  $("#prevSlide")?.addEventListener("click", () => { showSlide(activeSlide - 1); restartSlideshow(); });
  $("#nextSlide")?.addEventListener("click", () => { showSlide(activeSlide + 1); restartSlideshow(); });
  slideDots.forEach((dot, index) => dot.addEventListener("click", () => { showSlide(index); restartSlideshow(); }));
  $(".hero")?.addEventListener("mouseenter", () => window.clearInterval(slideTimer));
  $(".hero")?.addEventListener("mouseleave", restartSlideshow);
  showSlide(0);
  restartSlideshow();

  // Toast helper
  let toastTimer;
  function toast(message) {
    const element = $("#toast");
    if (!element) return;
    element.textContent = message;
    element.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => element.classList.remove("is-visible"), 2600);
  }

  // Favorites saved in local storage
  let favorites = storage.get("automobiliFavorites", []);
  if (!Array.isArray(favorites)) favorites = [];

  function updateFavoriteButtons() {
    $$("[data-favorite]").forEach(button => {
      const isFavorite = favorites.includes(button.dataset.favorite);
      button.setAttribute("aria-pressed", String(isFavorite));
      button.textContent = isFavorite ? "♥" : "♡";
      const name = modelData[button.dataset.favorite]?.name || button.dataset.favorite;
      button.setAttribute("aria-label", `${isFavorite ? "Remove" : "Add"} ${name} ${isFavorite ? "from" : "to"} favorites`);
    });
    $("#headerFavorites")?.classList.toggle("has-favorites", favorites.length > 0);
  }

  function toggleFavorite(modelId) {
    const isFavorite = favorites.includes(modelId);
    favorites = isFavorite ? favorites.filter(id => id !== modelId) : [...favorites, modelId];
    storage.set("automobiliFavorites", favorites);
    updateFavoriteButtons();
    return !isFavorite;
  }

  $$("[data-favorite]").forEach(button => button.addEventListener("click", () => {
    const added = toggleFavorite(button.dataset.favorite);
    toast(added ? "Added to your favorites." : "Removed from your favorites.");
  }));
  $("#headerFavorites")?.addEventListener("click", () => {
    if (!favorites.length) {
      toast("Tap a heart on any model to save it here.");
      return;
    }
    $("#modelFilter").value = "all";
    filterModels();
    $$(".car-card").forEach(card => {
      card.classList.toggle("favorite-highlight", favorites.includes(card.dataset.model));
      card.hidden = !favorites.includes(card.dataset.model);
    });
    $("#filterEmpty").hidden = favorites.length > 0;
    $("#lineupTitle").textContent = "YOUR FAVORITES";
    $("#lineup").scrollIntoView({ behavior: "smooth" });
  });
  updateFavoriteButtons();

  // Model modal
  const modal = $("#modelModal");
  const modalClose = $("#modalClose");
  let lastFocusedElement = null;
  let activeModalModel = "revuelto";

  function openModel(modelId) {
    const model = modelData[modelId];
    if (!model || !modal) return;
    activeModalModel = modelId;
    lastFocusedElement = document.activeElement;
    $("#modalTitle").textContent = model.name;
    $("#modalDescription").textContent = model.description;
    $("#modalImage").src = model.image;
    $("#modalImage").alt = `${model.name} concept car`;
    $("#modalEngine").textContent = model.engine;
    $("#modalPower").textContent = model.power;
    $("#modalSpeed").textContent = model.speed;
    $("#modalPrice").textContent = model.price;
    $("#modalFavorite").textContent = favorites.includes(modelId) ? "♥ Remove from favorites" : "♡ Add to favorites";
    modal.hidden = false;
    document.body.classList.add("modal-open");
    modalClose?.focus();
  }

  function closeModal() {
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    document.body.classList.remove("modal-open");
    if (lastFocusedElement && typeof lastFocusedElement.focus === "function") lastFocusedElement.focus();
  }

  $$("[data-model]").forEach(button => button.addEventListener("click", () => openModel(button.dataset.model)));
  modalClose?.addEventListener("click", closeModal);
  modal?.addEventListener("click", event => { if (event.target === modal) closeModal(); });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      closeModal();
      closeMenu();
    }
    if (event.key === "Tab" && modal && !modal.hidden) {
      const focusable = $$("button, a, input, select, [tabindex]:not([tabindex='-1'])", modal)
        .filter(element => !element.disabled && element.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  $("#modalFavorite")?.addEventListener("click", () => {
    const added = toggleFavorite(activeModalModel);
    $("#modalFavorite").textContent = added ? "♥ Remove from favorites" : "♡ Add to favorites";
    toast(added ? "Added to your favorites." : "Removed from your favorites.");
  });

  // Filter lineup by vehicle category.
  const modelFilter = $("#modelFilter");
  function filterModels() {
    const selected = modelFilter?.value || "all";
    let visibleCount = 0;
    $$(".car-card").forEach(card => {
      const visible = selected === "all" || card.dataset.category === selected;
      card.hidden = !visible;
      if (visible) visibleCount += 1;
    });
    $("#filterEmpty").hidden = visibleCount > 0;
    $("#lineupTitle").textContent = selected === "all" ? "EXPLORE OUR LINEUP" : `${selected.toUpperCase()} COLLECTION`;
  }
  modelFilter?.addEventListener("change", filterModels);

  // Frontend-only newsletter validation. No email is sent to a server.
  const newsletterForm = $("#newsletterForm");
  const emailInput = $("#emailInput");
  const formMessage = $("#formMessage");

  newsletterForm?.addEventListener("submit", event => {
    event.preventDefault();
    const email = emailInput.value.trim();
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!validEmail) {
      emailInput.setAttribute("aria-invalid", "true");
      formMessage.textContent = "Please enter a valid email address.";
      formMessage.classList.add("is-error");
      emailInput.focus();
      return;
    }

    emailInput.removeAttribute("aria-invalid");
    formMessage.classList.remove("is-error");
    formMessage.textContent = "Thanks! This demo validates your email locally; no email has been sent.";
    newsletterForm.reset();
  });
  emailInput?.addEventListener("input", () => {
    emailInput.removeAttribute("aria-invalid");
    if (formMessage.classList.contains("is-error")) formMessage.textContent = "";
  });

  // Back-to-top control
  const backToTop = $("#backToTop");
  function updateBackToTop() {
    backToTop?.classList.toggle("is-visible", window.scrollY > 450);
  }
  window.addEventListener("scroll", updateBackToTop, { passive: true });
  updateBackToTop();
  backToTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  // Cookie preferences demo
  const cookiePanel = $("#cookiePanel");
  $("#cookieSettings")?.addEventListener("click", () => { cookiePanel.hidden = false; });
  $("#acceptCookies")?.addEventListener("click", () => {
    storage.set("automobiliCookieNoticeSeen", true);
    cookiePanel.hidden = true;
    toast("Preference saved on this device.");
  });

  // Footer links are intentionally local demo links.
  $$("[data-notice]").forEach(link => link.addEventListener("click", event => {
    event.preventDefault();
    toast(link.dataset.notice);
  }));

  $("#year").textContent = String(new Date().getFullYear());
})();
