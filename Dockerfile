FROM ubuntu:latest

ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update && apt-get upgrade -y && apt-get install build-essential libwrap0-dev libssl-dev python-distutils-extra libc-ares-dev uuid-dev libcurl4-openssl-dev curl supervisor git-all -y

#install mosquitto
RUN mkdir -p /usr/local/src
WORKDIR /usr/local/src
RUN curl -O http://mosquitto.org/files/source/mosquitto-1.4.8.tar.gz
RUN tar xvzf ./mosquitto-1.4.8.tar.gz
WORKDIR /usr/local/src/mosquitto-1.4.8
RUN make
RUN make install

#get auth plugin

WORKDIR /usr/local/src
RUN curl -L -O https://github.com/jpmens/mosquitto-auth-plug/archive/0.0.7.tar.gz
RUN tar xvzf ./0.0.7.tar.gz
WORKDIR /usr/local/src/mosquitto-auth-plug-0.0.7
COPY Docker/config/config.mk /usr/local/src/mosquitto-auth-plug-0.0.7/config.mk
RUN make clean
RUN make
RUN cp auth-plug.so /usr/local/lib/
RUN cp np /usr/local/bin/ && chmod +x /usr/local/bin/np

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

#install nodejs
RUN curl -sL https://deb.nodesource.com/setup_5.x | sudo -E bash -
RUN sudo apt-get install -y nodejs
EXPOSE 3000

#install bower
RUN npm install bower -g

#install the application and the startup scripts
RUN mkdir -p /usr/local/docker
WORKDIR /usr/local/docker
ADD Docker/scripts ./scripts
ADD OpenHASWeb ./app
ADD Docker/config/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
ADD Docker/config/mosquitto.conf /etc/mosquitto/mosquitto.conf
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

