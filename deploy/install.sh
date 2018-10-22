#!/bin/bash

# Run from project root

apt update
apt-get install nginx
cp deploy/nginx.conf /etc/nginx/conf.d/openbox.conf

npm install
npm install -g @angular/cli
ng build --prod

service nginx restart
