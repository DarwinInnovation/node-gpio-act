import { exec } from "node:child_process";
import _ from 'lodash';
import { Gpio } from "pigpio";

import pino from "pino";


export interface GpioActioCfg {
  type: string;
  gpio?: {
    mode?: number;
    pullUpDown?: number;
    edge?: number;
  }
};

export interface GpioActioCfgExt extends GpioActioCfg {
  type: "ext";
  cmd: string;
  timeout?: number;
  cwd?: string;
}


export type GpioActionHandler = (action: any) => Promise<void>;

export class GpioAction {
  static log: pino.Logger | null = null;
  static TypeToHandler: {
    [type: string]: GpioActionHandler
  } = {}

  static RegisterType(type: string, handler: GpioActionHandler) {
    GpioAction.TypeToHandler[type] = handler;
  }

  private gpio: Gpio;
  private handler: GpioActionHandler;

  constructor(readonly gpio_num: number, readonly action_cfg: GpioActioCfg) {
    const options = _.defaults({}, this.action_cfg.gpio, {
      mode: Gpio.INPUT,
      pullUpDown: Gpio.PUD_UP,
      edge: Gpio.EITHER_EDGE
    });
    this.gpio = new Gpio(this.gpio_num, options);
    this.handler = GpioAction.TypeToHandler[action_cfg.type];

    this.gpio.glitchFilter(100000);
    this.gpio.on('interrupt', (level) => {
      this._handle_interrupt(level);
    });
  }

  private _handle_interrupt(level: number) {
    if (GpioAction.log)
      GpioAction.log.info(`INT${this.gpio_num} = ${level}`);
    if (!level) {
      this.handler(this.action_cfg).then(()=> {
        //
      })
    }
  }
}

GpioAction.RegisterType("ext", (action: GpioActioCfgExt) => {
  return new Promise<void>((resolve, reject) => {
    if (GpioAction.log) {
      GpioAction.log.info(`Running command '${action.cmd}'`);
    }
    exec(action.cmd, action, (err, stdout, stderr) => {
      if (GpioAction.log) {
        GpioAction.log.info("  Done");
        if (stdout.length) {
          GpioAction.log.info("  Std. Output: " + stdout);
        }
        if (stderr.length) {
          GpioAction.log.info("  Std. Error: " + stderr);
        }
      }

      resolve();
    });
  });
});
