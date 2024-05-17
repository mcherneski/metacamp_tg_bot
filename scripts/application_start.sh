#!/bin/bash
echo 'run application_start.sh' >> /home/ec2-user/metacamp_tg_bot/deploy.log

echo 'pm2 restart nodejs-app'  >> /home/ec2-user/metacamp_tg_bot/deploy.log
pm2 restart nodejs-app >> /home/ec2-user/metacamp_tg_bot/deploy.log