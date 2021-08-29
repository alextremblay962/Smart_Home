class Device {
    constructor(name, topic, client, callback) {
        this.name = name
        this.type = "device"
        this.topic = topic
        this.client = client
        this.callback = callback
        this.val = this.startDevice()
        this.timer
        this.timerTime = 5000
        this.timerCallback

        this.client.on('connect', () => {
            this.client.subscribe(this.topic, () => {
                //console.log('client connected')
                this.client.on('message', (topic, message, packet) => {
                    if (this.topic == topic) {
                        let JsonObj = JSON.parse(message.toString())
                        console.log(JsonObj, topic, 'from: ', this.name)
                        this.val = JsonObj
                        console.log('recieved : ', this.val)
                        if (this.callback) {
                            this.callback()
                        }
                    }
                })
            })
        })
    }
    static deviceCount = 0
    startDevice() {
        let fs = require('fs')
        var found = 0
        fs.readFile("IOT_Device.json", (err, data) => {
            let deviceData = JSON.parse(data)
            deviceData.devices.forEach((device) => {
                if (device.topic == this.topic) {
                    this.val = device.val
                    found = 1
                    Device.deviceCount += 1
                }
            })
            if (!found) {
                //console.log(this.name, " ===don't exist")
                let newDevice = {
                    "name": this.name,
                    "type": this.type,
                    "topic": this.topic,
                    "val": this.initValue()
                }
                deviceData.devices.push(newDevice)
                fs.writeFileSync("IOT_Device.json", JSON.stringify(deviceData))
                console.log(deviceData)
            }
            this.setValue(this.val)
        })
    }

    sendMQTT(payload) {
        console.log('sending: ' + payload, 'to: ', this.topic)
        this.client.publish(this.topic, payload)
    }

    initValue() {
        return {}
    }

    startTimer(time, callback) {
        if (time) {
            this.timerTime = time
        }

        if (callback) {
            this.timerCallback = callback
        }

        this.timer = setTimeout(() => {
            this.timerCallback()
        }, this.timerTime)
    }
    setTimerCallback(callback) {
        this.timerCallback = callback()
    }

    resetTimer() {
        clearTimeout(this.timer)
        this.startTimer()

    }

    setTimerCallback(callbabk) {
        this.timerCallback = callbabk
    }


}
module.exports = Device