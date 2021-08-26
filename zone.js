class Zone {
    constructor(name, devices) {
        this.name = name
        this.devices = devices
        this.temperature = 25
        this.humidity = 50
     
    }

    print_devices() {
        console.log(this.devices)
    }

    print_devices_state() {
        this.devices.forEach(device => {
            console.log(device.state)
        });
    }

    getTemperature() {
        return this.temperature;
    }
    getHumidity() {
        return this.humidity;
    }

}

module.exports = Zone;
