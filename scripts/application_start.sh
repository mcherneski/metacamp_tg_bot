#!/bin/bash
pm2 stop all
pm2 start /home/ec2-user/metacamp-tg-bot/ecosystem.config.js