var firebase = require("firebase")
var mqtt = require('mqtt')
var client = mqtt.connect('mqtt://test.mosquitto.org')

var config = {
    apiKey: "AIzaSyDzIA745qykPFjRxpLsmnbgQ9pLbdvKEOY",
    authDomain: "alex-iotapp.firebaseapp.com",
    databaseURL: "https://alex-iotapp.firebaseio.com",
    projectId: "alex-iotapp",
    storageBucket: "alex-iotapp.appspot.com",
    messagingSenderId: "965070007418"
};
firebase.initializeApp(config);

var ref = firebase.app().database()
var devices = ref.ref("/device")
var flag = false
var flag2 = true

client.on('connect', function () {
    //client.subscribe('test2')
    client.subscribe('update')
    //client.publish('test2', 'Hello mqtt')

})

client.on('message', function (topic, message) {
    if (topic == 'update') {
        getData()
    }
    // message is Buffer
    flag2 = false
    if (flag) {

        console.log('message recieve from: ' + topic.toString() + ' : ' + message.toString())
        for (let i = 0; i < topics.length; i++) {
            if (topics[i] == topic) {
                var jsonMessage = JSON.parse(message.toString())
                //console.log("message: " + jsonMessage)
                ref.ref("device/" + keys[i]).update({
                    val: jsonMessage
                })
            }
        }
    }
    setTimeout(() => {
        console.log("flag2 true")
        flag2 = true
    }, 80)
})

function listenData() {
    //console.log("listenData")
    devices.once("value", (snap) => {
        //console.log(snap.val())
        console.log("new value: ")
        for (key in snap.val()) {
            console.log('key is: ' + key)
            ref.ref('device/' + key).on('value', (snap2) => {
                if (flag2) {
                    try {
                        //let topic = snap.key + snap2.key
                        let topic = snap2.val().topic
                        let value = snap2.val().val

                        //console.log('topic: ' + topic + '  val: ' + JSON.stringify(value))
                        //send to MQTT
                        //  client.unsubscribe(topics)
                        flag = false
                        client.publish(topic, JSON.stringify(value))
                        clearTimeout(flagtime)
                        var flagtime = setTimeout(() => {
                            flag = true
                        }, 20)
                        // client.subscribe(topics)

                    } catch (error) {
                        console.log('"\x1b[31m"', error)
                        //listenData()
                    }
                }
            })
        }
    })
}


var keys = []
var topics = []

function getData() {
    //topics = []  
    // console.log("getData")
    devices.once("value", (snap) => {
        // console.log(snap.val())
        data = snap.val()
        for (key in snap.val()) {
            // console.log('key is: ' + key)
            keys.push(key)
            ref.ref('device/' + key).once('value', (snap2) => {
                //let topic = snap.key + snap2.key
                let topic = snap2.val().topic
                let type = snap2.val().type
                let value = snap2.val().val
                  
                topics.push(topic)

                client.publish(topic, JSON.stringify(value))

                //console.log('topic: ' + topic + '  val: ' + JSON.stringify(value))
            })
        }
    })
}

setTimeout(() => {
    client.subscribe(topics)
    console.log("===== subscibe to: " + topics)
}, 5000)

console.log('\x1b[36m%s\x1b[0m', 'firebase link start');

module.exports.listenData = listenData;
module.exports.getData = getData;
