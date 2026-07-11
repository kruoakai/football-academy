// PM2 process config — ใช้เฉพาะวิธีติดตั้งแบบไม่ใช้ Docker
// รัน:   pm2 start deploy/ecosystem.config.js
// ดู log: pm2 logs football-academy
module.exports = {
  apps: [
    {
      name: "football-academy",
      script: "npm",
      args: "start",
      cwd: "/var/www/football-academy",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      instances: 1,
      autorestart: true,
      max_memory_restart: "512M",
    },
  ],
};
