#!/bin/bash
~/.nvm/versions/node/v20.13.1/bin/pm2 status
~/.nvm/versions/node/v20.13.1/bin/pm2 startOrRestart /home/ec2-user/metacamp-tg-bot/ecosystem.config.js