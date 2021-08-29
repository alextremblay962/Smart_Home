const Zone = require("./zone.js")
const Device = require("./device.js")
const Light = require("./light.js")
const RGB_Light = require("./RGB_light")
const Sensor = require('./sensor')
//var firelink = require('./firelink')

var mqtt = require('mqtt')
const { callbackify } = require("util")
var client = mqtt.connect('mqtt://test.mosquitto.org')

client.subscribe("update", (topic, message, packet) => {
  //console.log('update')
})

//declare devices
//living room
let livingRoomPir = new Sensor('pir1',
  'L-MVusr05_oP/living_room/pir',
  client, LivingRoomCallback)

let tvBacklight = new RGB_Light('rgb backlight',
  'L-MVusr05_oP/living_room/tv_light',
  client)
//declare devices

function LivingRoomCallback() {
  let off = "#000000"
  let red = "#FFF000"
  let blue = "#0000FF"

  if (livingRoomPir.getValue() && tvBacklight.getColor() == off) {
    tvBacklight.setColor(red)
    tvBacklight.startTimer(10, () => {
      tvBacklight.setColor(off)
    })
  }
  else if (livingRoomPir.getValue() && tvBacklight.getColor() != off) {
    tvBacklight.resetTimer()
  }
}