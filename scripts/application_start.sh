#!/bin/bash

echo 'run application_start.sh' >> /home/ec2-user/metacamp_bot_logs/deploy.log
sudo npm install pm2 -g >> /home/ec2-user/metacamp_bot_logs/deploy.log
echo 'pm2 startOrRestart using config file'  >> /home/ec2-user/metacamp_bot_logs/deploy.log
sudo pm2 stop all
sudo pm2 start /home/ec2-user/metacamp-tg-bot/ecosystem.config.js >> /home/ec2-user/metacamp_bot_logs/deploy.log