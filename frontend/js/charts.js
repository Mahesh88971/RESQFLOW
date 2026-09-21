/**
 * RESQFLOW — analytics charts (Chart.js)
 */
const RESQ_CHARTS = {

  _base(color) {
    return {
      borderColor: color,
      backgroundColor: color.replace("1)", "0.12)"),
      borderWidth: 2,
      tension: 0.35,
      pointRadius: 0,
      fill: true,
    };
  },

  _commonOpts(extra = {}) {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: "rgba(255,255,255,.06)" }, ticks: { color: "#6D7796", font: { size: 10 } } },
        y: { grid: { color: "rgba(255,255,255,.06)" }, ticks: { color: "#6D7796", font: { size: 10 } } },
      },
      ...extra,
    };
  },

  renderAll(analytics) {
    if (typeof Chart === "undefined") return;
    Chart.defaults.font.family = "Inter";

    const respCtx = document.getElementById("chartResponse");
    if (respCtx) {
      new Chart(respCtx, {
        type: "line",
        data: {
          labels: analytics.responseTrend.labels,
          datasets: [{ label: "Avg response (min)", data: analytics.responseTrend.values, ...this._base("rgba(34,211,238,1)") }],
        },
        options: this._commonOpts(),
      });
    }

    const trafCtx = document.getElementById("chartTraffic");
    if (trafCtx) {
      new Chart(trafCtx, {
        type: "line",
        data: {
          labels: analytics.trafficForecast.labels,
          datasets: [{ label: "Traffic index", data: analytics.trafficForecast.values, ...this._base("rgba(251,191,36,1)") }],
        },
        options: this._commonOpts(),
      });
    }

    const typeCtx = document.getElementById("chartType");
    if (typeCtx) {
      new Chart(typeCtx, {
        type: "bar",
        data: {
          labels: analytics.byType.labels,
          datasets: [{ label: "Emergencies", data: analytics.byType.values, backgroundColor: "rgba(255,59,92,.55)", borderRadius: 6 }],
        },
        options: this._commonOpts(),
      });
    }

    const hospCtx = document.getElementById("chartHosp");
    if (hospCtx) {
      new Chart(hospCtx, {
        type: "bar",
        data: {
          labels: analytics.hospitalLoad.labels,
          datasets: [{ label: "Load %", data: analytics.hospitalLoad.values, backgroundColor: "rgba(52,211,153,.55)", borderRadius: 6 }],
        },
        options: this._commonOpts(),
      });
    }
  },
};
