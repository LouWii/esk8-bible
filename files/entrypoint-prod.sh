#!/bin/bash

sed -i "s/__ENV_SENDGRID_KEY__/$SENDGRID_KEY/" /etc/msmtprc

php-fpm