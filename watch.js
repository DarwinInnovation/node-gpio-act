const child = require('child_process');

const Gpio = require('pigpio').Gpio;

const to_watch = [18, 17, 4, 27, 22]
const gpios = []

to_watch.forEach((gpio_num)=>{
  const button = new Gpio(gpio_num, {
    mode: Gpio.INPUT,
    pullUpDown: Gpio.PUD_UP,
    edge: Gpio.EITHER_EDGE
  });
  button.gpio_num = gpio_num
  gpios.push(button)
})

process.stdout.write('\n')
setInterval(()=>{
  process.stdout.write('\r')
  gpios.forEach((gpio)=>{
    process.stdout.write(`${gpio.gpio_num}: ${gpio.digitalRead()} | `)
  })
}, 200);