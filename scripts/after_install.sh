#!/bin/bash
echo 'run after_install.sh' >> /home/ec2-user/metacamp_tg_bot/deploy.log

echo 'cd /home/ec2-user/metacamp_tg_bot' >> /home/ec2-user/metacamp_tg_bot/deploy.log
cd /home/ec2-user/metacamp_tg_bot >> /home/ec2-user/metacamp_tg_bot/deploy.log

echo 'npm install' >> /home/ec2-user/metacamp_tg_bot/deploy.log
npm install >> /home/ec2-user/metacamp_tg_bot/deploy.log
