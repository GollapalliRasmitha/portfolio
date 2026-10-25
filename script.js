// Portfolio interactions: theme toggle, phone menu, optional intro video, card tilt, scroll reveal.
// Everything is optional polish: the page works fully without JavaScript.

const root = document.documentElement;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

document.getElementById("year").textContent = new Date().getFullYear();

// ---- Light / dark: dark by default; your choice is remembered. --------------------------------------------------------
document.querySelector(".theme-btn").addEventListener("click", () => {
  root.dataset.theme = root.dataset.theme === "light" ? "dark" : "light";
  try {
    localStorage.setItem("theme", root.dataset.theme);
  } catch {
    /* storage blocked: the choice lasts for this visit only */
  }
});

// ---- Email: joined here from two pieces, so bots reading the raw page don't find a whole address. ------------------
const emailLink = document.getElementById("email-link");
if (emailLink) {
  const address = `${emailLink.dataset.user}@${emailLink.dataset.domain}`;
  emailLink.href = `mailto:${address}`;
  emailLink.querySelector(".email-text").textContent = address;
}

// ---- Certificates: each card opens the certificate in a viewer (native <dialog>: Esc closes, focus returns). ---------
const viewer = document.getElementById("cert-viewer");
if (viewer && typeof viewer.showModal === "function") {
  const viewerImg = document.getElementById("cert-viewer-img");
  const viewerTitle = document.getElementById("cert-viewer-title");
  const viewerOriginal = document.getElementById("cert-viewer-original");
  document.querySelectorAll(".cert-open").forEach((btn) => {
    btn.addEventListener("click", () => {
      const { title, full, original, originalLabel } = btn.dataset;
      viewerTitle.textContent = title;
      viewerImg.src = full;
      viewerImg.alt = `Certificate: ${viewerTitle.textContent}`;
      viewerOriginal.href = original;
      viewerOriginal.textContent = originalLabel;
      viewer.showModal();
    });
  });
  viewer.querySelector(".viewer-close").addEventListener("click", () => viewer.close());
  viewer.addEventListener("click", (e) => e.target === viewer && viewer.close()); // click on the dimmed backdrop
} else {
  // Very old browsers: open the certificate itself instead.
  document.querySelectorAll(".cert-open").forEach((btn) =>
    btn.addEventListener("click", () => window.open(btn.dataset.full, "_blank", "noopener")),
  );
}

// ---- Phone menu ----------------------------------------------------------------------------------------------------
const menuBtn = document.querySelector(".menu-btn");
const navLinks = document.getElementById("nav-links");
const setMenu = (open) => {
  navLinks.classList.toggle("open", open);
  menuBtn.setAttribute("aria-expanded", String(open));
  menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
};
menuBtn.addEventListener("click", () => setMenu(!navLinks.classList.contains("open")));
navLinks.addEventListener("click", (e) => e.target.closest("a") && setMenu(false));
document.addEventListener("keydown", (e) => e.key === "Escape" && setMenu(false));

// ---- Intro video: shown only if intro.mp4 exists in the repo; until then the photo stays. ----------------------------
const media = document.querySelector(".hero-media");
fetch(media.dataset.video, { method: "HEAD" })
  .then((res) => {
    if (!res.ok || !(res.headers.get("content-type") || "").startsWith("video/")) return;
    const photo = media.querySelector("img");
    const video = Object.assign(document.createElement("video"), {
      src: media.dataset.video,
      poster: photo.currentSrc || photo.src,
      muted: true,
      playsInline: true,
      loop: true,
      preload: "none",
    });
    video.setAttribute("aria-label", "Intro video of Gollapalli Rasmitha (muted)");
    const btn = document.createElement("button");
    btn.className = "play-btn";
    btn.type = "button";
    const icons = {
      play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>',
      pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>',
    };
    const sync = () => {
      const playing = !video.paused;
      btn.innerHTML = playing ? icons.pause : icons.play;
      btn.setAttribute("aria-label", playing ? "Pause the intro video" : "Play the intro video (muted)");
      btn.classList.toggle("playing", playing);
    };
    btn.addEventListener("click", () => (video.paused ? video.play() : video.pause()));
    video.addEventListener("play", sync);
    video.addEventListener("pause", sync);
    photo.replaceWith(video);
    media.append(btn);
    sync();
  })
  .catch(() => {
    /* no video: keep the photo */
  });

// ---- The 3D touch: cards tilt toward the mouse (mouse only, never with reduced motion). ---------------------------
if (canHover && !reduceMotion) {
  const MAX = 6; // degrees
  document.querySelectorAll(".tilt").forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.classList.add("tilting");
      el.style.setProperty("--ry", `${(x * MAX * 2).toFixed(2)}deg`);
      el.style.setProperty("--rx", `${(-y * MAX * 2).toFixed(2)}deg`);
    });
    el.addEventListener("pointerleave", () => {
      el.classList.remove("tilting");
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--ry", "0deg");
    });
  });
}

// ---- Gentle scroll reveal (skipped with reduced motion). ------------------------------------------------------------
if (!reduceMotion && "IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("shown");
          io.unobserve(entry.target);
        }
      }),
    { threshold: 0.12 },
  );
  document.querySelectorAll(".section > *").forEach((el) => {
    el.classList.add("reveal");
    io.observe(el);
  });
}
