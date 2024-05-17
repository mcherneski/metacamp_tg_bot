#!/bin/bash
SECRET_NAME='BOT_TOKEN'
REGION='us-west-2'
SECRET_VALUE=$(aws ssm get-parameter --name "$SECRET_NAME" --with-decryption --region "$REGION" --query "Parameter.Value" --output text)

echo "export BOT_TOKEN=$SECRET_VALUE" >> /home/ec2-user/metacamp_tg_bot/.env

echo 'run after_install.sh' >> /home/ec2-user/metacamp_tg_bot/deploy.log

echo 'cd /home/ec2-user/metacamp_tg_bot' >> /home/ec2-user/metacamp_tg_bot/deploy.log
cd /home/ec2-user/metacamp_tg_bot >> /home/ec2-user/metacamp_tg_bot/deploy.log

echo 'npm install' >> /home/ec2-user/metacamp_tg_bot/deploy.log
npm install >> /home/ec2-user/metacamp_tg_bot/deploy.log
