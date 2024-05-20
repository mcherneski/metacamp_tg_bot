echo 'Stopping pm2' >> /home/ec2-user/metacamp_bot_logs/deploy.log
pm2 stop metacamp_tg_bot >> /home/ec2-user/metacamp_bot_logs/deploy.log
echo 'Removing old directory' >> /home/ec2-user/metacamp_bot_logs/deploy.log
rm -rf /home/ec2-user/metacamp_tg_bot/dist >> /home/ec2-user/metacamp_bot_logs/deploy.log

echo 'Cleaning up old files' >> /home/ec2-user/metacamp_bot_logs/deploy.log
DEPLOY_DIR=/home/ec2-user/metacamp_tg_bot

if [ -d "$DEPLOY_DIR" ]; then
    rm -rf "$DEPLOY_DIR/*"
fi 