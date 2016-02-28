FROM ubuntu:latest

ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update && apt-get upgrade -y && apt-get install python-software-properties software-properties-common curl supervisor git-all -y


#install mosquitto
RUN apt-add-repository ppa:mosquitto-dev/mosquitto-ppa && apt-get update && apt-get install mosquitto -y

RUN adduser --system --disabled-password --disabled-login mosquitto
EXPOSE 1883

#install mongodb
RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10 && \
    echo 'deb http://downloads-distro.mongodb.org/repo/ubuntu-upstart dist 10gen' | sudo tee /etc/apt/sources.list.d/mongodb.list && \
    apt-get update && \
    apt-get install -y pwgen mongodb-org mongodb-org-server mongodb-org-shell mongodb-org-mongos mongodb-org-tools && \
    echo "mongodb-org hold" | dpkg --set-selections && \
    echo "mongodb-org-server hold" | dpkg --set-selections && \
    echo "mongodb-org-shell hold" | dpkg --set-selections && \
    echo "mongodb-org-mongos hold" | dpkg --set-selections && \
    echo "mongodb-org-tools hold" | dpkg --set-selections

VOLUME /data/db
ENV AUTH yes
ENV JOURNALING yes
EXPOSE 27017 28017

#install nodejs
RUN curl -sL https://deb.nodesource.com/setup_5.x | sudo -E bash -
RUN sudo apt-get install -y nodejs
RUN sudo apt-get install -y build-essential
EXPOSE 3000

#install bower
RUN npm install bower -g

#install the application and the startup scripts
RUN mkdir -p /usr/local/docker
WORKDIR /usr/local/docker
ADD Docker/scripts ./scripts
ADD OpenHASWeb ./app
ADD Docker/config/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
ADD Docker/config/mosquitto.conf /etc/mosquitto/conf.d/mosquitto.conf
ADD Docker/config/mosquitto_password_file /etc/mosquitto/password_file
RUN mosquitto_passwd -D /etc/mosquitto/password_file testuser
RUN mosquitto_passwd -b /etc/mosquitto/password_file testuser test_pass-word_test
RUN adduser --system --disabled-password --disabled-login nodejs

#execute npm install to prepare the app
WORKDIR /usr/local/docker/app
RUN npm install

#execute bower install to get UI side dependencies
WORKDIR /usr/local/docker/app/public/template
RUN bower --allow-root install

#for nodejs app, we need to define the port
ENV PORT=3000

EXPOSE 1883	

#start
WORKDIR /usr/local/docker
CMD ["/usr/bin/supervisord"]

