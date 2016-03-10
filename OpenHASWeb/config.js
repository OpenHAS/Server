var config = {}

config.mongodb = {}
config.mongodb.connectionString = process.env.MONGODB || "mongodb://localhost/ruleengine"

config.mqtt = {}
config.mqtt.host = process.env.MQTT_HOST
config.mqtt.username = process.env.MQTT_USER
config.mqtt.password = process.env.MQTT_PASSWORD
config.mqtt.rootTopic = "/openhas"

module.exports = config