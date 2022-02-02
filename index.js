const child = require('child_process');

const Gpio = require('pigpio').Gpio;

{
const button = new Gpio(18, {
  mode: Gpio.INPUT,
  pullUpDown: Gpio.PUD_UP,
  edge: Gpio.EITHER_EDGE
});

button.glitchFilter(10);

button.on('interrupt', (level) => {
  console.log('1', level)

  if (level == 0) {
    child.exec('/home/pi/py-rfcat-cli/rfcat-tx-cmd neet lift_up', (err, so, se)=>{
      console.log(so)
      console.log(se)
    })
  }
});
}
{
  const button = new Gpio(17, {
    mode: Gpio.INPUT,
    pullUpDown: Gpio.PUD_UP,
    edge: Gpio.EITHER_EDGE
  });
  
  button.glitchFilter(10000);
  
  button.on('interrupt', (level) => {
    console.log('2', level)
  
    if (level == 0) {
      child.exec('/home/pi/py-rfcat-cli/rfcat-tx-cmd neet lift_down', (err, so, se)=>{
        console.log(so)
        console.log(se)
      })
    }
  });
  }