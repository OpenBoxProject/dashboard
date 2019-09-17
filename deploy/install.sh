#!/bin/bash

# Run from project root

apt update
apt-get install nginx -y
cp deploy/nginx.conf /etc/nginx/conf.d/openbox.conf
service nginx stop

npm install
npm install -g @angular/cli
ng build --prod

