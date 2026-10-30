/* Background music control - works independently of script.js */
(function () {
  "use strict";

  var audio = document.getElementById("bgMusic");
  var btn = document.getElementById("musicToggle");
  if (!audio || !btn) return;

  var label = btn.querySelector(".music-label");
  var TARGET_VOLUME = 0.45;   // soft by default
  var FADE_MS = 700;          // smooth fade in / out
  var fadeTimer = null;
  var on = false;

  audio.loop = true;
  audio.volume = 0;
  audio.muted = true;         // muted by default

  // Muted playback is allowed by browsers, so the track is ready and in sync.
  // If the browser blocks even this, the first click will start it.
  var muted = audio.play();
  if (muted && typeof muted.catch === "function") muted.catch(function () {});

  function fadeTo(target, done) {
    clearInterval(fadeTimer);
    var start = audio.volume;
    var t0 = performance.now();
    fadeTimer = setInterval(function () {
      var p = Math.min((performance.now() - t0) / FADE_MS, 1);
      try { audio.volume = start + (target - start) * p; } catch (e) { p = 1; }
      if (p >= 1) { clearInterval(fadeTimer); if (done) done(); }
    }, 30);
  }

  function render() {
    btn.classList.toggle("is-on", on);
    btn.setAttribute("aria-pressed", String(on));
    btn.setAttribute("aria-label", on ? "Turn background music off" : "Turn background music on");
    if (label) label.textContent = on ? "Music On" : "Music Off";
  }

  function turnOn() {
    on = true;
    render();
    audio.muted = false;                    // only unmuted after a user click
    var p = audio.play();
    if (p && typeof p.catch === "function") {
      p.catch(function () { on = false; audio.muted = true; render(); });
    }
    fadeTo(TARGET_VOLUME);
  }

  function turnOff() {
    on = false;
    render();
    fadeTo(0, function () { audio.muted = true; });
  }

  btn.addEventListener("click", function () { on ? turnOff() : turnOn(); });

  // Be polite: pause while the tab is hidden, resume when it returns.
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) audio.pause();
    else audio.play().catch(function () {});
  });

  render();
})();
