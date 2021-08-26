const Zone = require("./zone.js")
const Device = require("./device.js")
const Light = require("./light.js")
const RGB_Light = require("./RGB_light")
const Sensor = require('./sensor')

// const aedes = require('aedes')()
// const server = require('net').createServer(aedes.handle)
// const port = 1883

// server.listen(port, function () {
//   console.log('server started and listening on port ', port)
// })

var mqtt = require('mqtt')
const { callbackify } = require("util")
var client  = mqtt.connect('mqtt://test.mosquitto.org')

client.subscribe("update", (topic,message,packet)=>{
  //console.log('update')
})


let livingRoomPir = new Sensor('pir1', 'L-MVusr05_oP/living_room/pir', client, LivingRoomCallback)

let tvBacklight = new RGB_Light('rgb backlight','L-MVusr05_oP/living_room/tv_light', client)

setTimeout(() => {
  console.log(Device.deviceCount)
  
}, 100);




var LivingRoomparam

function LivingRoomCallback(){

  if(livingRoomPir.getValue() && tvBacklight.getColor() == "#000000"){
    tvBacklight.setColor("#FF0000")
    //tvBacklight.setTimerCallback( )
    var call1 = function(){
      console.log("======= callback")
    }
    tvBacklight.startTimer(5000,call1)
    console.log(tvBacklight.getColor())
  }
  else if(livingRoomPir.getValue() && tvBacklight.getColor()  != "#000000"){
    console.log("reset")
    
  }

 


}

