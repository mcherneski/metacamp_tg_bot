#!/bin/bash

DEPLOY_DIR=/home/ec2-user/metacamp_tg_bot

if [ -d "$DEPLOY_DIR" ]; then
    rm -rf "$DEPLOY_DIR/*"
fi 