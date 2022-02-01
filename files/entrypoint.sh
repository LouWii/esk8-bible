#!/bin/bash

cd /var/www/html

composer install --quiet

cd web

npm install

chmod 777 storage
chmod 777 web/cpresources

php-fpm