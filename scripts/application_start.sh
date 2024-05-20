#!/bin/bash
echo 'run application_start.sh' >> /home/ec2-user/metacamp_bot_logs/deploy.log

echo 'pm2 startOrRestart using config file'  >> /home/ec2-user/metacamp_bot_logs/deploy.log
pm2 startOrRestart ../ecosystem.config.js >> /home/ec2-user/metacamp_bot_logs/deploy.log