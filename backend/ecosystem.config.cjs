module.exports = {
    apps: [
        {
            name: "backend",
            script: "./dist/backend/src/server.js",
            env_production: {
                NODE_ENV: "production",
            },
        },
    ],
};
