require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");

const realtime = require("./socket/realtime");
const emergenciesRoutes = require("./routes/emergencies");
const ambulancesRoutes = require("./routes/ambulances");
const hospitalsRoutes = require("./routes/hospitals");
const routingRoutes = require("./routes/routing");
const analyticsRoutes = require("./routes/analytics");

const app = express();
const PORT = process.env.PORT || 4000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";

app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ service: "resqflow-backend", status: "operational" });
});
app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/api/emergencies", emergenciesRoutes);
app.use("/api/ambulances", ambulancesRoutes);
app.use("/api/hospitals", hospitalsRoutes);
app.use("/api/routing", routingRoutes);
app.use("/api/analytics", analyticsRoutes);

// 404 handler
app.use((req, res) => res.status(404).json({ error: "Not found" }));

// Central error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

const server = http.createServer(app);
realtime.attach(server, CORS_ORIGIN);

server.listen(PORT, () => {
  console.log(`RESQFLOW backend listening on http://localhost:${PORT}`);
});
