echo 'Stopping pm2' >> /home/ec2-user/metacamp_bot_logs/deploy.log
pm2 stop metacamp_tg_bot >> /home/ec2-user/metacamp_bot_logs/deploy.log