/* Namgay Wangchuk - Portfolio interactions */
(function () {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ---------- Theme toggle (remembers choice, respects OS setting) ---------- */
  const root = document.documentElement;
  const safeGet = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const safeSet = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } };

  const saved = safeGet("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  root.setAttribute("data-theme", saved || (prefersDark ? "dark" : "light"));

  $("#themeToggle").addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    safeSet("theme", next);
  });

  /* ---------- Mobile menu ---------- */
  const menuBtn = $("#menuBtn");
  const navLinks = $("#navLinks");
  const closeMenu = () => {
    navLinks.classList.remove("open");
    menuBtn.classList.remove("open");
    menuBtn.setAttribute("aria-expanded", "false");
  };
  menuBtn.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    menuBtn.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
  });
  $$(".nav-link").forEach((l) => l.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(); });

  /* ---------- Typing effect ---------- */
  const roles = ["Software Developer", "Network Engineer", "Web Developer", "Lifelong Learner"];
  const typedEl = $("#typed");
  let r = 0, c = 0, deleting = false;
  function type() {
    const word = roles[r];
    typedEl.textContent = word.slice(0, c);
    if (!deleting && c < word.length) { c++; setTimeout(type, 90); }
    else if (!deleting) { deleting = true; setTimeout(type, 1400); }
    else if (c > 0) { c--; setTimeout(type, 45); }
    else { deleting = false; r = (r + 1) % roles.length; setTimeout(type, 350); }
  }
  type();

  /* ---------- Scroll: progress bar, navbar, back-to-top, active link ---------- */
  const navbar = $("#navbar");
  const progress = $("#scrollProgress");
  const toTop = $("#toTop");
  const sections = $$("main section[id]");
  const links = $$(".nav-link");

  function onScroll() {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";
    navbar.classList.toggle("scrolled", y > 10);
    toTop.classList.toggle("show", y > 500);

    let current = sections[0].id;
    sections.forEach((s) => { if (y + 120 >= s.offsetTop) current = s.id; });
    links.forEach((l) => l.classList.toggle("active", l.getAttribute("href") === "#" + current));
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  /* ---------- Reveal on scroll + animated skill bars + counters ---------- */
  function animateCount(el) {
    const target = +el.dataset.target;
    const start = performance.now();
    const dur = 1200;
    (function step(now) {
      const p = Math.min((now - start) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    })(start);
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.classList.add("visible");
      $$(".fill", el).forEach((f) => { f.style.width = f.dataset.level + "%"; });
      $$(".stat-num", el).forEach(animateCount);
      io.unobserve(el);
    });
  }, { threshold: 0.15 });
  $$(".reveal").forEach((el) => io.observe(el));

  /* ---------- Project filter ---------- */
  const filterBtns = $$(".filter");
  const projects = $$(".project");
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const f = btn.dataset.filter;
      projects.forEach((p) => p.classList.toggle("hide", f !== "all" && p.dataset.category !== f));
    });
  });

  /* ---------- Contact form validation ---------- */
  const form = $("#contactForm");
  const message = $("#message");
  const counter = $("#counter");
  const status = $("#formStatus");

  message.addEventListener("input", () => { counter.textContent = message.value.length + "/500"; });

  function setError(input, errId, msg) {
    $("#" + errId).textContent = msg;
    input.closest(".field").classList.toggle("invalid", !!msg);
    return !msg;
  }

  function validate() {
    const name = $("#name"), email = $("#email");
    const okName = setError(name, "nameError", name.value.trim().length < 2 ? "Please enter your name." : "");
    const okEmail = setError(email, "emailError", /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()) ? "" : "Please enter a valid email address.");
    const okMsg = setError(message, "messageError", message.value.trim().length < 10 ? "Message must be at least 10 characters." : "");
    return okName && okEmail && okMsg;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    status.textContent = "";
    if (!validate()) return;

    // Opens the visitor's email app with the message pre-filled.
    const to = "05250180.jnec@rub.edu.bt";
    const subject = encodeURIComponent("Portfolio message from " + $("#name").value.trim());
    const body = encodeURIComponent(message.value.trim() + "\n\nFrom: " + $("#name").value.trim() + " (" + $("#email").value.trim() + ")");
    window.location.href = "mailto:" + to + "?subject=" + subject + "&body=" + body;

    status.textContent = "Thanks! Your email app should open with your message ready to send.";
    form.reset();
    counter.textContent = "0/500";
  });

  $$("input, textarea", form).forEach((el) => el.addEventListener("blur", validate));

  /* ---------- Footer year ---------- */
  $("#year").textContent = new Date().getFullYear();
})();
