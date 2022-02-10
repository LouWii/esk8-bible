#!/bin/bash

CONTAINER_NAME='esk8'

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[1;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}iptables configuratio setup${NC}"
echo "---------------------------"

if [ "$EUID" -ne 0 ]
  then echo -e "${RED}Please run as root or use sudo${NC}";
  exit
fi

dev_container=false;
container_type='Prod'

read -r -p "Default is to setup the rules for the prod container. Would you like to setup rules for the dev container instead? [y/N]" response
response=${response,,} # tolower
if [[ $response =~ ^(yes|y) ]] ; then
    dev_container=true;
    container_type='Dev'
    CONTAINER_NAME="${CONTAINER_NAME}dev"
fi

container_ip=$(docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' ${CONTAINER_NAME})
ip_range=$(echo "${container_ip}" | echo "$(sed -r 's/([0-9]+\.[0-9]+\.)[0-9]+\.[0-9]+/\1/')0.0/24")

echo -e "Checking rules for ${BLUE}${container_type}${NC} container"
echo "IP ${container_ip} - range ${ip_range}"
echo "---------------------------"

echo "Removing outside access to container exposed port"

#iptables -I DOCKER-USER 1 -i eno1 -p tcp -m conntrack --ctorigdstport 9008 --ctdir ORIGINAL -j DROP

if ! iptables -I DOCKER-USER 1 -i eno1 -p tcp -m conntrack --ctorigdstport 9008 --ctdir ORIGINAL -j DROP; then
    echo -e "${RED}Failed${NC}"
    exit 1;
fi

echo ""
echo "Fixing container access to its internal network"

#iptables -A OUTPUT -p tcp -s 172.20.0.0/24 --destination 172.20.0.0/24 -m conntrack --ctstate NEW -j ACCEPT

if ! iptables -A OUTPUT -p tcp -s $ip_range --destination $ip_range -m conntrack --ctstate NEW -j ACCEPT; then
    echo -e "${RED}Failed${NC}"
    exit 1;
fi

echo ""
echo "Authorizing container to connect to host's MySQL"

#iptables -t filter -A INPUT -p tcp -s 172.20.0.0/24 --dport 3306 -j ACCEPT

if ! iptables -t filter -A INPUT -p tcp -s $ip_range --dport 3306 -j ACCEPT; then
    echo -e "${RED}Failed${NC}"
    exit 1;
fi

echo ""
echo -e "${GREEN}All done!${NC}"
