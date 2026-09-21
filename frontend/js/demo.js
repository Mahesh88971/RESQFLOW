/**
 * RESQFLOW — full demo simulation ("RUN EMERGENCY SIMULATION")
 */
const RESQ_DEMO = {

  steps: [
    { icon: "🚨", label: "Emergency detected" },
    { icon: "📍", label: "Location confirmed" },
    { icon: "🚑", label: "AMB-204 assigned" },
    { icon: "🧠", label: "AI analyzing 3 routes" },
    { icon: "🏥", label: "Hospital capacity checked" },
    { icon: "🗺️", label: "Optimal route selected" },
    { icon: "🟢", label: "Green corridor activated" },
    { icon: "🚧", label: "Road blockage detected" },
    { icon: "🔄", label: "Dynamic rerouting" },
    { icon: "🏥", label: "Hospital notified" },
    { icon: "🚑", label: "Patient arrived" },
  ],

  async run() {
    const overlay = document.getElementById("demoOverlay");
    const list = document.getElementById("demoSteps");
    const resultBox = document.getElementById("demoResult");
    if (!overlay || !list) return;

    resultBox.hidden = true;
    list.hidden = false;
    list.innerHTML = this.steps.map((s, i) => `
      <li class="demo-step" id="demoStep${i}">
        <span class="demo-step__icon">${s.icon}</span>
        <span class="demo-step__label">${s.label}</span>
      </li>
    `).join("");
    overlay.hidden = false;

    for (let i = 0; i < this.steps.length; i++) {
      const el = document.getElementById(`demoStep${i}`);
      el.classList.add("is-active");
      RESQ.notify(this.steps[i].label, this.steps[i].icon);
      await RESQ.wait(750);
      el.classList.remove("is-active");
      el.classList.add("is-done");
    }

    await RESQ.wait(400);
    list.hidden = true;
    resultBox.hidden = false;
  },

  close() {
    document.getElementById("demoOverlay").hidden = true;
  },
};
