module.exports = {
    apps: [{
        name: 'metacamp_tg_bot',
        script: './dist/index.js',
        env_production: {
            NODE_ENV: 'production'
        },
        watch: true,
        log_file: '~/metacamp_tg_bot.log',
        merge_logs: true,
        time: true,
        autorestart: true
    }]
}