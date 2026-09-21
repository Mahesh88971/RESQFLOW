/**
 * RESQFLOW — shared UI utilities
 */
const RESQ = {

  notifications: [
    { icon: "🟢", message: "Green corridor monitoring is ready", time: "Now" },
    { icon: "🏥", message: "City Care Hospital capacity confirmed", time: "1 min ago" },
    { icon: "🚑", message: "AMB-204 en route to Apollo Emergency Center", time: "2 min ago" },
  ],

  toast(message, icon = "🔔") {
    const stack = document.getElementById("toastStack");
    if (!stack) return;
    const el = document.createElement("div");
    el.className = "toast glass";
    el.innerHTML = `<span>${icon}</span> ${message}`;
    stack.appendChild(el);
    setTimeout(() => {
      el.classList.add("toast--fade");
      setTimeout(() => el.remove(), 320);
    }, 4200);
  },

  notify(message, icon = "🔔") {
    this.notifications.unshift({ icon, message, time: "Now" });
    this.notifications = this.notifications.slice(0, 8);
    this.renderNotifications();
    this.toast(message, icon);
  },

  renderNotifications() {
    const markup = this.notifications.map(item => `
      <div class="notification-item">
        <span class="notification-item__icon">${item.icon}</span>
        <span class="notification-item__body"><span>${item.message}</span><span class="notification-item__time">${item.time}</span></span>
      </div>
    `).join("");
    ["notificationList", "responderNotifications"].forEach(id => {
      const target = document.getElementById(id);
      if (target) target.innerHTML = markup;
    });
    const count = document.getElementById("notificationCount");
    if (count) count.textContent = `${this.notifications.length} LIVE`;
  },

  animateCounter(el, target, opts = {}) {
    const { duration = 1400, suffix = "", isTime = false } = opts;
    const start = performance.now();
    function tick(now) {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      if (isTime) {
        const val = Math.round(target * eased);
        const m = String(Math.floor(val / 60)).padStart(1, "0");
        const s = String(val % 60).padStart(2, "0");
        el.textContent = `${m}:${s}`;
      } else {
        el.textContent = `${Math.round(target * eased)}${suffix}`;
      }
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  },

  initCounters(root = document) {
    const els = root.querySelectorAll("[data-count], [data-count-time]");
    if (!els.length) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        if (el.dataset.count) {
          RESQ.animateCounter(el, Number(el.dataset.count), { suffix: el.dataset.suffix || "" });
        } else if (el.dataset.countTime) {
          RESQ.animateCounter(el, Number(el.dataset.countTime), { isTime: true });
        }
        io.unobserve(el);
      });
    }, { threshold: 0.4 });
    els.forEach((el) => io.observe(el));
  },

  statusClass(status) {
    return {
      Available: "pill--available",
      Active: "pill--live",
      Hospital: "pill--hospital",
      Maintenance: "pill--maintenance",
    }[status] || "";
  },

  wait(ms) {
    return new Promise((res) => setTimeout(res, ms));
  },
};
