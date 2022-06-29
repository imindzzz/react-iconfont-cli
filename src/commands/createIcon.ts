#!/usr/bin/env node

import colors from "colors";
import { getConfig } from "../libs/getConfig";
import { SvgParser } from "../libs/SvgParser";
import { generateComponent } from "../libs/generateComponent";

const config = getConfig();

SvgParser(config.svg_dir)
  .then((result) => {
    generateComponent(result, config);
  })
  .catch((e) => {
    console.error(colors.red(e.message || "Unknown Error"));
    process.exit(1);
  });
