# Esk8 Bible

A small Craft CMS site project about electric skateboards or _esk8_.

## Setup

### Docker

`sudo docker-compose up -d --build`

Set a host env var for `SENDGRID_KEY_ESK8` which should contain the Send grid API key.

### Apache

Don't forget to enable the required apache mods with `sudo a2enmod rewrite proxy proxy_fcgi` and restart `sudo systemctl restart apache2`.

Copy `esk8.conf` to `/etc/apache2/sites-available/` and then enable it.

```
sudo cp esk8.conf /etc/apache2/sites-available/esk8.conf
sudo a2ensite esk8
```

### Iptables

Depending on the `iptables` rules on the host, some rules might need to be added to make everything work properly. The script `iptables-fix.sh` contains a few iptables rules to set things up properly.

### `.env` file

Copy `.env.example` and rename it to `.env`. Edit with correct configuration.

`host.docker.internal` can be used as db host if the db is running on the host.

## Dev

### Docker

Run `sudo docker-compose -f docker-compose-dev.yml up -d --build`

Wait for a bit to get composer stuff installed and npm. For convenience, composer and npm both run when the container goes up, so that both dependencies are installed on the mounted volume. We have to do this because for dev, we replace the entire app folder with the local app folder, mounted as a volume in Docker. We do this so that any local change is reflected in Docker.

There are probably better solutions for this (like putting composer and npm deps outside of the app), but it works for now.

### Apache

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

### Frontend css and JS

Using Bootstrap 4.3, jQuery 3.2, font awesome 4.7, chart.js 2.7, database.net 1.10, typed.js 2.0 and more

Run `gulp sass` to compile sass files to css. `gulp sass:watch` to watch for changes and auto compile

Run `gulp minify-css` to compile sass into minified css file.

Run `gulp scripts` to build all JS.

**Commit** the built assets, that how they are served in prod. Not the best, but eh.

## Debug

`sudo docker logs -f esk8` or `esk8dev`

`sudo docker exec -it esk8 /bin/bash` or `esk8dev`

#### Other Random Commands

Run `sudo docker build -t esk8bible .` to build the container

Run `sudo docker run -d -v $(pwd)/html:/var/www/html -p 9008:9000 --name esk8 esk8bible` to run the container

sudo docker run -d --add-host host.docker.internal:host-gateway -p 9008:9000 --name esk8 esk8bible

sudo docker run -d --add-host host.docker.internal:host-gateway -v $(pwd)/app:/var/www/html -p 9008:9000 --name esk8 esk8bible

## Email

Using Sendgrid SMTP server (has a free tier of 100 emails/day which is way enough here). MSMTP installed in the Docker container to serve as an intermediate between PHP and Sendgrid SMTP.

The **FROM** address needs to be one of the validated domain in Sendgrid, otherwise Sendgrid won't accept the email.

### Debug

`echo "Hello this is sending email using msmtp" | msmtp recipent@domain.com` to send a test email using MSMTP.

## Known issues

### Cannot backup database on update

It's because `mysqldump` command is not available in the container. It requires a bunch of packages that aren't needed for anything else. In order to keep the container light, we decided to not install the command. But it's simply commented out of the `Dockerfile`, in case we need that command at some point.

### Sending emails

```
2022-02-01 17:51:40 [-][1][-][trace][yii\base\InlineAction::runWithParams] Running action: craft\contactform\controllers\SendController::actionIndex()
2022-02-01 17:51:40 [-][1][-][info][yii\mail\BaseMailer::send] Sending email "New message from Esk8 Bible - Test email from dev" to "louwii+esk8bible@protonmail.com"
2022-02-01 17:51:40 [-][1][-][info][yii\swiftmailer\Mailer::sendMessage] Sending email "New message from Esk8 Bible - Test email from dev" to "louwii+esk8bible@protonmail.com"
2022-02-01 17:51:40 [-][1][-][warning][application] Error sending email: Expected response code 220 but got an empty respons
2022-02-01 17:51:40 [-][1][-][info][application] $_GET = [
    'p' => 'contact'
]
```