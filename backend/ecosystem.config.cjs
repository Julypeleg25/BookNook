module.exports = {
    apps: [
        {
            name: "REST SERVER",
            script: "./dist/backend/src/server.js",
            env_production: {
                NODE_ENV: "production",
            },
        },
    ],
};
