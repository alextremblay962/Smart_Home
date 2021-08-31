const Zone = require("./zone.js")
const Device = require("./device.js")
const Light = require("./light.js")
const RGB_Light = require("./RGB_light")
const Sensor = require('./sensor')
var firelink = require('./firelink')

var mqtt = require('mqtt')
const { callbackify } = require("util")
var client = mqtt.connect('mqtt://test.mosquitto.org')

client.subscribe("update", (topic, message, packet) => {
  //console.log('update')
})

//declare devices
//living room
var livingRoomPir = new Sensor('pir1',
  'L-MVusr05_oP/living_room/pir',
  client, LivingRoomCallback)

var tvBacklight = new RGB_Light('rgb backlight',
  'L-MVusr05_oP/living_room/tv_light',
  client)

var livingRoomLuxSensor = new Sensor("lux sensor",
 'L-MVusr05_oP/living_room/lux',
 client,LivingRoomCallback )
//declare devices

function LivingRoomCallback() {
  let off = "#000000"
  var onColor = "#0000FF"

 

  if(livingRoomLuxSensor.getValue() >= 100){
    console.log("onColor")
    onColor = "#FF0000"
  }
  else if(livingRoomLuxSensor.getValue() < 100){
    onColor = "#00FF00"
  }
  if(tvBacklight.getColor() !=  off){
    tvBacklight.setColor(onColor)
  }

  if (livingRoomPir.getValue() && tvBacklight.getColor() == off) {

    tvBacklight.setColor(onColor)
    tvBacklight.startTimer(30, () => {
      tvBacklight.setColor(off)
    })
  }
  else if (livingRoomPir.getValue() && tvBacklight.getColor() != off) {
    tvBacklight.resetTimer()

  }
}