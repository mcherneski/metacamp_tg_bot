#!/bin/bash
source ~/.nvm/nvm.sh
~/.nvm/versions/node/v20.13.1/bin/pm2 startOrRestart /home/ec2-user/metacamp_tg_bot/ecosystem.config.js