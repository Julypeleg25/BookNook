module.exports = {
    apps: [
        {
            name: "BookNook-Backend",
            script: "./dist/backend/src/app.js",
            instances: "max",
            exec_mode: "cluster",
            env_production: {
                NODE_ENV: "production",
            },
        },
    ],
};
