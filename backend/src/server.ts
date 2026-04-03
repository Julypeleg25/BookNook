import initApp from "./app";
import https from "https";
import http from "http";
import fs from "fs";

initApp().then((app) => {
    if (process.env.NODE_ENV !== "production") {
        http.createServer(app).listen(process.env.PORT || 3000);
    } else {
        console.log("PRODUCTION");
        const options2 = {
            key: fs.readFileSync("../client-key.pem"),
            cert: fs.readFileSync("../client-cert.pem")
        };
        https.createServer(options2, app).listen(process.env.HTTPS_PORT);
    }
}).catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
});
