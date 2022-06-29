import fs from "fs";
import path from "path";
import mkdirp from "mkdirp";
import glob from "glob";
import colors from "colors";
import { camelCase, upperFirst } from "lodash";
import { XmlData } from "iconfont-parser";
import { Config } from "./getConfig";
import { whitespace } from "./whitespace";

const ATTRIBUTE_FILL_MAP = ["path"];

export const generateSvg = (data: XmlData, config: Config) => {
  // console.log(JSON.stringify(data, null, 2));
  const names: string[] = [];
  const imports: string[] = [];
  const saveDir = path.resolve(config.svg_dir);
  const fileExtension = ".svg";

  mkdirp.sync(saveDir);
  glob.sync(path.join(saveDir, "*")).forEach((file) => fs.unlinkSync(file));

  data.svg.symbol.forEach((item) => {
    let singleFile: string;
    const iconId = item.$.id;
    const iconIdAfterTrim = config.trim_icon_prefix
      ? iconId.replace(
          new RegExp(`^${config.trim_icon_prefix}(.+?)$`),
          (_, value) => value.replace(/^[-_.=+#@!~*]+(.+?)$/, "$1")
        )
      : iconId;
    const componentName = upperFirst(camelCase(iconId));

    names.push(iconIdAfterTrim);

    imports.push(componentName);

    singleFile = generateCase(item, 4);

    fs.writeFileSync(
      path.join(saveDir, componentName + fileExtension),
      singleFile
    );

    console.log(
      `${colors.green("√")} Generated icon "${colors.yellow(iconId)}"`
    );
  });
};

const generateCase = (
  data: XmlData["svg"]["symbol"][number],
  baseIdent: number
) => {
  let template = `\n${whitespace(baseIdent)}<svg viewBox="${
    data.$.viewBox
  }"  t="1656476178637"
  class="icon"
  version="1.1"
  xmlns="http://www.w3.org/2000/svg"
  p-id="5038"
  width="200"
  height="200">\n`;

  for (const domName of Object.keys(data)) {
    if (domName === "$") {
      continue;
    }

    if (!domName) {
      console.error(colors.red(`Unable to transform dom "${domName}"`));
      process.exit(1);
    }

    const counter = {
      colorIndex: 0,
      baseIdent,
    };

    if (data[domName].$) {
      template += `${whitespace(baseIdent + 2)}<${domName}${addAttribute(
        domName,
        data[domName],
        counter
      )}\n${whitespace(baseIdent + 2)}/>\n`;
    } else if (Array.isArray(data[domName])) {
      data[domName].forEach((sub) => {
        template += `${whitespace(baseIdent + 2)}<${domName}${addAttribute(
          domName,
          sub,
          counter
        )}\n${whitespace(baseIdent + 2)}/>\n`;
      });
    }
  }

  template += `${whitespace(baseIdent)}</svg>\n`;

  return template;
};

const addAttribute = (
  domName: string,
  sub: XmlData["svg"]["symbol"][number]["path"][number],
  counter: { colorIndex: number; baseIdent: number }
) => {
  let template = "";

  if (sub && sub.$) {
    if (ATTRIBUTE_FILL_MAP.includes(domName)) {
      // Set default color same as in iconfont.cn
      // And create placeholder to inject color by user's behavior
      sub.$.fill = sub.$.fill || "#333333";
    }

    for (const attributeName of Object.keys(sub.$)) {
      if (attributeName === "fill") {
        template += `\n${whitespace(counter.baseIdent + 4)}${camelCase(
          attributeName
        )}="${sub.$[attributeName]}"`;
        counter.colorIndex += 1;
      } else {
        template += `\n${whitespace(counter.baseIdent + 4)}${camelCase(
          attributeName
        )}="${sub.$[attributeName]}"`;
      }
    }
  }

  return template;
};
