import { XmlData } from "iconfont-parser";
import fs from "fs";
import path from "path";
import xmlParser from "xml-parser";
export const SvgParser = async (svg_dir: string): Promise<XmlData> => {
  const files = fs.readdirSync(svg_dir, { withFileTypes: true });
  const symbol: XmlData["svg"]["symbol"] = files
    .filter((file) => {
      return file.isFile() && file.name.endsWith(".svg");
    })
    .map((file) => {
      const svgText = fs.readFileSync(path.join(svg_dir, file.name), "utf8");
      const svg = xmlParser(svgText);
      // console.log(file.name, JSON.stringify(svg, null, 2));
      return {
        $: {
          viewBox: svg.root.attributes.viewBox,
          id: file.name,
        },
        path: svg.root.children.map((child) => {
          return {
            $: {
              fill: child.attributes.fill,
              d: child.attributes.d,
            },
          };
        }),
      };
    });
  return {
    svg: {
      symbol: symbol,
    },
  };
};
