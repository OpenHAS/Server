FROM node:7-onbuild

#install bower
RUN npm install bower -g

#install the application and the startup scripts
ADD . /usr/src/app
WORKDIR /usr/src/app

#execute bower install to get UI side dependencies
WORKDIR /usr/src/app/public/template
RUN bower --allow-root install
