import initApp from "./app";
import https from "https";
import http from "http";
import fs from "fs";
import { logger } from "@utils/logger";

initApp()
  .then((app) => {
    logger.info("Starting HTTPS server in production mode");
    const options2 = {
      key: fs.readFileSync("../client-key.pem"),
      cert: fs.readFileSync("../client-cert.pem"),
    };
    https.createServer(options2, app).listen(process.env.HTTPS_PORT);
  })
  .catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });
