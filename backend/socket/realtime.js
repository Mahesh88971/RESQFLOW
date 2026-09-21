/**
 * Real-time layer (Socket.IO)
 *
 * Wires a Socket.IO server onto the shared HTTP server and exposes a
 * small pub/sub-style API so route handlers can broadcast live updates
 * (new emergency, ambulance moved, corridor activated, reroute) to every
 * connected dashboard without polling.
 */

let io = null;

function attach(server, corsOrigin) {
  const { Server } = require("socket.io");
  io = new Server(server, {
    cors: { origin: corsOrigin || "*" },
  });

  io.on("connection", (socket) => {
    console.log(`[socket] client connected: ${socket.id}`);
    socket.emit("system:status", { status: "operational" });

    socket.on("disconnect", () => {
      console.log(`[socket] client disconnected: ${socket.id}`);
    });
  });

  return io;
}

function broadcast(event, payload) {
  if (!io) return;
  io.emit(event, payload);
}

module.exports = { attach, broadcast };
