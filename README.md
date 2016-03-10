Contains source code for the project. 
### Structure
* OpenHASWeb - Node.js based web interface to the sensor network.
* Dockerfile - This used to decribe the docker container. It must be here to let it able to add the web app to the docker image
* Docker - Scripts and configurations to be embedded to the docker container

### How to install the controller?
The system is totally self contained in a docker container, which can be pulled from here: [https://hub.docker.com/r/openhas/server/] You will need Docker to run this image. 
The container exposes two internal ports:
* 3000: This is the web application port
* 1883: Mosquitto MQTT broker's port
Please map these ports to suit your needs.
The container also exposes a volume where the interal database should be persisted. The path in the container is /data/db It must be mounted as a read/write volume.

### Starting the container for the very first time: 
Because by default there is no username/password in the app, you should set up the admin user supplying the username/password to the docker container. For example:
```docker run -p 1883:1883 -p 3000:3000 -e NEW_USER=admin -e NEW_PASSWORD=admin -e MQTT_HOST=mqtt://localhost -v /openhas/data:/data/db openhas/server
Lets analyse this command:
||Parameter||Meaning||
|run|Start a container|
|-p 1883:1883|Maps the internal 1883 port to the external 1883 port. This will be used by the MQTT broker. OpenHAS hub will connect to this port|
|-p 3000:3000|Maps the internal 3000 port to the external 3000 port. This is the port where you can access the web application|
|-e NEW_USER=admin| This username can be used for logging into the web app. Only considered for the first login.|
|-e NEW_PASSWORD=admin| The password which can be used for logging into the web app. Only considered for the first login.|
|-e MQTT_HOST=mqtt://localhost| The MQTT broker to connect to. It should be mqtt://localhost for most of the cases|
|-v /openhas/data:/data/db|Mounts the /openhas/data directory on the host computer to the container. OpenHAS data will be persisted here|
|openhas/server|The name of the image which should be started|

### Logging in the first time:
After the container is started, navigate to the http://localhost:3000 website, and log in with the new user/password pair you just specified above. Go to the settings page,and specify an MQTT username and password. You will need to use this in the Hab configuration.

### Stopping the container:
After you changed the MQTT username/password, you need to stop and restart the application. Press Ctrl+C to kill the container.

### Starting the container subsequently: 
Now you have the username and password already specified, you dont need to add them via environment variables. So see the modified command.
```docker run -p 1883:1883 -p 3000:3000 -e MQTT_HOST=mqtt://localhost -v /openhas/data:/data/db openhas/server
