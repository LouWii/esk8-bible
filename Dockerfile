FROM php:7.4-fpm

RUN apt update && apt install -y msmtp

# Use https://github.com/mlocati/docker-php-extension-installer to easily install PHP extensions
# ctype curl iconv dom json mbstring openssl pcre PDO Reflection spl xml are required by Craft but installed by default
# intl is recommended, ImageMagick is recommended over GD
RUN curl -sSLf \
        -o /usr/local/bin/install-php-extensions \
        https://github.com/mlocati/docker-php-extension-installer/releases/latest/download/install-php-extensions && \
    chmod +x /usr/local/bin/install-php-extensions && \
    install-php-extensions imagick intl opcache pdo_mysql zip @composer-1 && \
    mkdir -p /var/www/html

# If you want CraftCMS to be able to backup the database, uncomment this line
#RUN apt install default-mysql-client

COPY files/msmtprc /etc/msmtprc

WORKDIR /var/www/html

COPY files/esk8-php.ini ./
RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini" && \
    mv esk8-php.ini "$PHP_INI_DIR/conf.d/esk8-php.ini"

COPY files/entrypoint-prod.sh /usr/local/bin/entrypoint.sh

COPY app /var/www/html

# Remove the possibility of the vendor dir outside of the container to corrupt things
RUN rm -rf /var/www/html/vendor && \
    rm -rf /var/www/html/web/node_modules

RUN composer install --quiet && \
    composer dump-autoload --optimize --no-dev --classmap-authoritative && \
    chown -R www-data:www-data storage && \
    chown -R www-data:www-data web/cpresources && \
    chown -R www-data:www-data config/project && \
    chown -R www-data:www-data web/assets

# Frontend assets are compiled in dev env and committed to git
# Not ideal, but it makes things so much easier, no need to compile them when building the container

ENTRYPOINT [ "entrypoint.sh" ]