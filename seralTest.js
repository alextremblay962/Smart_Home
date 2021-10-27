const SerialPort = require('serialport')
const port = new SerialPort('COM24', { baudRate: 115200 })


port.write('main screen turn on', function (err) {
    if (err) {
        return console.log('Error on write: ', err.message)
    }
    console.log('message written')
})

// Open errors will be emitted as an error event
port.on('error', function (err) {
    console.log('Error: ', err.message)
})

// Read data that is available but keep the stream in "paused mode"
port.on('readable', function () {
    console.log('Data:', port.read().toString())
})

// // Switches the port into "flowing mode"
// port.on('data', function (data) {
//     console.log('Data:', data.toString())
// })


const readline = require('readline');
readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);
process.stdin.on('keypress', (str, key) => {
    if (key.ctrl && key.name === 'c') {
        process.exit();
    }
    else if (key.name === 's') {
        var foo = {
            "topic": "hydro/light1",
            "payload": 1
        }
        foo = JSON.stringify(foo)
        port.write(foo, function (err) {
            if (err) {
                return console.log('Error on write: ', err.message)
            }
            console.log('message written')
        })
    }

    else if (key.name === 'a') {
        var foo = {
            "topic": "hydro/light1",
            "payload": 0
        }
        foo = JSON.stringify(foo)
        port.write(foo, function (err) {
            if (err) {
                return console.log('Error on write: ', err.message)
            } 
            console.log('message written')
        })
    }
}
);

