#!/bin/bash
echo 'Cleaning up old files' >> /home/ec2-user/metacamp_bot_logs/deploy.log
DEPLOY_DIR=/home/ec2-user/metacamp_tg_bot
sudo npm install pm2 -g
if [ -d "$DEPLOY_DIR" ]; then
    rm -rf "/home/ec2-user/metacamp_tg_bot"
fi 