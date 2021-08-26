const Device = require("./device.js")

class Sensor extends Device {
    constructor(name, topic, client, callback) {
        super(name,  topic, client, callback)

        
    }

    getValue(){
        return this.val.value
    }

    setValue(){
        
        console.log("set " ,this.name," with val :" ,this.value)
    }
    initValue() {
        return { value: 0 }

    }
}

module.exports = Sensor