var mqtt = require('mqtt')
const { callbackify } = require("util")
var client = mqtt.connect('mqtt://127.0.0.1')

client.subscribe("update", (topic, message, packet) => {
  //console.log('update')
})

console.log(client.options)