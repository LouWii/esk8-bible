# Esk8 Bible

A small Craft CMS site project about electric skateboards or _esk8_.

## Setup

### Docker

`sudo docker-compose up -d --build`

## Apache

Don't forget to enable the required apache mods with `sudo a2enmod rewrite proxy proxy_fcgi` and restart `sudo systemctl restart apache2`.

```
<VirtualHost *:80>
    ServerName esk8.local

    DocumentRoot /home/louwii/Dev/esk8-bible/app/web

    ProxyPassMatch ^/(.*\.php(/.*)?)$ fcgi://127.0.0.1:9008/var/www/html/web/$1

    <Directory /home/louwii/Dev/esk8-bible/app/web>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
        DirectoryIndex index.php
    </Directory>

    ErrorLog ${APACHE_LOG_DIR}/esk8.local-error_log
    CustomLog ${APACHE_LOG_DIR}/esk8.local-access_log common
</VirtualHost>
```

## Dev

### Docker

Run `sudo docker-compose -f docker-compose-dev.yml up -d --build`

Wait for a bit to get composer stuff installed and npm. For convenience, composer and npm both run when the container goes up, so that both dependencies are installed on the mounted volume. We have to do this because for dev, we replace the entire app folder with the local app folder, mounted as a volume in Docker. We do this so that any local change is reflected in Docker.

There are probably better solutions for this (like putting composer and npm deps outside of the app), but it works for now.

#### Debug

`sudo docker logs -f esk8` or `esk8dev`

`sudo docker exec -it esk8 /bin/bash` or `esk8dev`

#### Other Random Commands

Run `sudo docker build -t esk8bible .` to build the container

Run `sudo docker run -d -v $(pwd)/html:/var/www/html -p 9008:9000 --name esk8 esk8bible` to run the container

sudo docker run -d --add-host host.docker.internal:host-gateway -p 9008:9000 --name esk8 esk8bible

sudo docker run -d --add-host host.docker.internal:host-gateway -v $(pwd)/app:/var/www/html -p 9008:9000 --name esk8 esk8bible

## Manual Install

Clone this repo

```
git clone https://github.com/LouWii/esk8-bible.git
```

Install PHP dependencies (check [Craft Docs](https://craftcms.com/docs/3.x/requirements.html#required-php-extensions))

```
cd esk8-bible
composer install
```

Set proper permissions to app folders (need to be writable by the app)

```
chmod 777 storage
chmod 777 web/cpresources
```

Install frontend dependencies

```
cd web
sudo npm install gulp-cli -g
npm install
```

(if problems, delete `node_modules`, `package-lock.json` and run `npm install` again)

Copy `.env.example` and rename it to `.env`. Edit with correct configuration.

`host.docker.internal` can be used as db host if the db is running on the host.

## Developers

### Frontend css and JS

Using Bootstrap 4.3, jQuery 3.2, font awesome 4.7, chart.js 2.7, database.net 1.10, typed.js 2.0 and more

Run `gulp sass` to compile sass files to css. `gulp sass:watch` to watch for changes and auto compile

Run `gulp minify-css` to compile sass into minified css file.

Run `gulp scripts` to build all JS.