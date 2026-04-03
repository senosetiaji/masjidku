module.exports = {
  apps: [
    {
      name: "sistem-masjid",
      cwd: "/var/www/sistem-masjid",
      script: "npm",
      args: "run start",
      env: {
        NODE_ENV: "production",
        PORT: 3010,
      },
      instances: 1,
      autorestart: true,
      max_memory_restart: "512M",
      watch: false,
    },
  ],
};
