import { app } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./lib/prisma.js";

const server = app.listen(env.APP_PORT, () => {
  console.log(`TransitOps API listening on port ${env.APP_PORT}`);
});

process.on("SIGTERM", async () => {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
});
