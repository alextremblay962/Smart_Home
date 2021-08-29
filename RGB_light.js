const Light = require("./light")

class RGB_Light extends Light{
    constructor(name, topic,client){
        super(name,  topic, client)
        this.color
        this.brighness
        this.mode = 1 //1 => fixed RGB color , 2 => fading
    }

    setColor(color){
        this.color = color
        let obj = {brighness: this.brighness , color: this.color}
        this.sendMQTT(JSON.stringify(obj))
    }

    setBrighness(brighness) {
        this.brighness = brighness
        let obj = {"val" : {brighness: this.brighness , color: this.color}}
        this.sendMQTT(JSON.stringify(obj))
    }

    getColor(){
        return this.color
    }

    setValue(){
        console.log("set " ,this.name," with val :" ,this.val)
        this.brighness = this.val.brighness
        this.color = this.val.color
    }

    initValue() {
        return { color: '#000000', brighness: 0 }

    }
}

module.exports = RGB_Light