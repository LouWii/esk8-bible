#!/bin/bash

cd /var/www/html

composer install --quiet

cd web

npm install

chown -R www-data:www-data storage
chown -R www-data:www-data web/cpresources
chown -R www-data:www-data config/project
chown -R www-data:www-data web/assets

php-fpm