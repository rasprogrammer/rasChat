import app from "./app";
import { createServer } from "http";
import { initializeSocket } from "./socket/socketHandler";

const PORT = process.env.PORT || 8000;

const httpServer = createServer(app);

// Initialize Socket.IO
initializeSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.IO server initialized`);
});
