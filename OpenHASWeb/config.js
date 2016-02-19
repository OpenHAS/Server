var config = {}

config.mongodb = {}
config.mongodb.connectionString = process.env.MONGODB || "mongodb://localhost/ruleengine"


module.exports = config