FROM php:7.4-fpm

# Use https://github.com/mlocati/docker-php-extension-installer to easily install PHP extensions
# ctype curl iconv dom json mbstring openssl pcre PDO Reflection spl xml are required by Craft but installed by default
# intl is recommended, ImageMagick is recommended over GD
RUN curl -sSLf \
        -o /usr/local/bin/install-php-extensions \
        https://github.com/mlocati/docker-php-extension-installer/releases/latest/download/install-php-extensions && \
    chmod +x /usr/local/bin/install-php-extensions && \
    install-php-extensions imagick intl opcache pdo_mysql zip @composer-1 && \
    mkdir -p /var/www/html

WORKDIR /var/www/html

COPY app /var/www/html

# Remove the possibility of the vendor dir outside of the container to corrupt things
RUN rm -rf /var/www/html/vendor && \
    rm -rf /var/www/html/web/node_modules

RUN composer install --quiet && \
    composer dump-autoload --optimize --no-dev --classmap-authoritative && \
    chown -R www-data:www-data storage && \
    chown -R www-data:www-data web/cpresources

RUN mv "$PHP_INI_DIR/php.ini-development" "$PHP_INI_DIR/php.ini"

# Install node using https://github.com/nodesource/distributions
# We are a bit late on nod version, upgrading is breaking things
RUN curl -fsSL https://deb.nodesource.com/setup_14.x | bash - && \
    apt-get install -y nodejs

WORKDIR /var/www/html/web

# Compile frontend assets
RUN npm install gulp-cli -g && \
    npm install

# Remove node to free up space
RUN apt-get remove --purge -y nodejs

WORKDIR /var/www/html