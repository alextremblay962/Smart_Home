const Zone = require("./zone.js")
const Device = require("./device.js")
const Light = require("./light.js")
const RGB_Light = require("./RGB_light")
const Sensor = require('./sensor')

var mqtt = require('mqtt')
const { callbackify } = require("util")
var client  = mqtt.connect('mqtt://test.mosquitto.org')

client.subscribe("update", (topic,message,packet)=>{
  //console.log('update')
})


let livingRoomPir = new Sensor('pir1', 'L-MVusr05_oP/living_room/pir', client, LivingRoomCallback)

let tvBacklight = new RGB_Light('rgb backlight','L-MVusr05_oP/living_room/tv_light', client)


function LivingRoomCallback(){
  let red = "#FF0000"

  if(livingRoomPir.getValue() && tvBacklight.getColor() == "#000000"){
    tvBacklight.setColor("#FF0000")
    
    tvBacklight.startTimer(10000,()=>{
      tvBacklight.setColor("#000000")
      console.log("=====callback")
    })
  }
  else if(livingRoomPir.getValue() && tvBacklight.getColor()  != "#000000"){
    console.log("reset")
    tvBacklight.resetTimer()
    
  }

}