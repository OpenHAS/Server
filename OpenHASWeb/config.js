var config = {}

config.mongodb = {}
//database is the alias of the docker container where mongoDB is running
config.mongodb.connectionString = process.env.MONGODB || "mongodb://database/ruleengine"

config.mqtt = {}
config.mqtt.host = process.env.MQTT_HOST
config.mqtt.username = process.env.MQTT_USER
config.mqtt.password = process.env.MQTT_PASSWORD
config.mqtt.rootTopic = "/openhas"

config.openssl = {}
config.openssl.privatekey = './sslcert/server.key'
config.openssl.certificate = './sslcert/server.cer'

module.exports = config