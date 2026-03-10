module.exports = {
    apps: [
        {
            name: "BookNook-Backend",
            script: "./src/app.ts",
            interpreter: "node",
            interpreter_args: "--import tsx",
            instances: "max",
            exec_mode: "cluster",
            env_production: {
                NODE_ENV: "production",
            },
        },
    ],
};
