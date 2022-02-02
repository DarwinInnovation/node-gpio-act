#! /usr/bin/env node

import { program } from "commander";
import { readFileSync } from "fs";
import _ from 'lodash'
import pino from "pino";

import { GpioAction, GpioActioCfg } from '../lib/GpioAction';


const version = require("../../package.json").version

program.version(version);
program.option("-d, --debug", "debug output");

program.parse();

interface GpioActionsCfg {
  actions: {
    [gpio_num:number]: GpioActioCfg
  }
}

const logger = pino({
  level: program.opts().debug ? 'debug':'info'
})

logger.info(`gpio-act v${version} running`)

GpioAction.log = logger;

const cfg_path = 'cfg/actions.json';
const cfg = JSON.parse(readFileSync(cfg_path, {encoding:'latin1'})) as GpioActionsCfg;

const gpio_actions: GpioAction[] = []
_.each(cfg.actions, (action_cfg, gpio_num) => {
  gpio_actions.push(new GpioAction(parseInt(gpio_num), action_cfg))
});

