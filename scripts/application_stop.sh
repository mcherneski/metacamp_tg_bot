echo 'Stopping pm2' >> /home/ec2-user/metacamp_bot_logs/deploy.log
pm2 stop metacamp_tg_bot >> /home/ec2-user/metacamp_bot_logs/deploy.log
echo 'Removing old directory' >> /home/ec2-user/metacamp_bot_logs/deploy.log
rm -rf /home/ec2-user/metacamp_tg_bot/dist >> /home/ec2-user/metacamp_bot_logs/deploy.log