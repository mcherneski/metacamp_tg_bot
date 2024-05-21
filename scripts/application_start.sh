#!/bin/bash

echo 'run application_start.sh' >> /home/ec2-user/metacamp_bot_logs/deploy.log
npm install pm2 -g >> /home/ec2-user/metacamp_bot_logs/deploy.log
echo 'pm2 start using config file'  >> /home/ec2-user/metacamp_bot_logs/deploy.log
pm2 stop all
pm2 start /home/ec2-user/metacamp-tg-bot/ecosystem.config.js >> /home/ec2-user/metacamp_bot_logs/deploy.log