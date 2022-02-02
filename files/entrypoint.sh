#!/bin/bash

cd /var/www/html

composer install --quiet

chown -R www-data:www-data storage
chown -R www-data:www-data web/cpresources
chown -R www-data:www-data config/project
chown -R www-data:www-data web/assets

cd web

npm install

php-fpm