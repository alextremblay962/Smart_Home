const Device = require("./device.js")
class Light extends Device {
    constructor(name, type, topic, client) {
        super(name, type, topic,client)
        this.brighness = 0
        this.type = "light"
    }

    turnOn() {
        this.state = true;
    }

    turnOff() {
        this.state = false;
        this.sendMQTT(this.state)
    }

    setBrighness(brighness) {
        this.brighness = brighness
        let obj = {brighness:this.brighness}
        this.sendMQTT(JSON.stringify(obj))
    }

    getBrighness(){
        return this.brighness
    }

    setValue(){
        
        console.log("set " ,this.name," with val :" ,this.value)
    }

    initValue(){
        return{"brighness" : 0}

    }

    
}

module.exports = Light