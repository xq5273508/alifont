/**
 * Created by XQ on 2019/01/08.
 */

'use strict';

const through2 = require("through2");
const gulp = require("gulp");

function Trans(content) {
  let Size, devX, devY;
  content.replace(/(<svg.+?viewBox\s*=\s*['"]\s*[\d.]+\s+[\d.]+\s+)([\d.]+)\s+([\d.]+)\s*(['"][\s\S]+?>)/g, (...agrs) => {
    const width = parseFloat(agrs[2]);
    const height = parseFloat(agrs[3]);
    Size = Math.max(width, height);
    devX = Math.abs((Size - width) / 2);
    devY = Math.abs((Size - height) / 2);
  });
  if (!Size) {
    return content;
  }
  const paths = [];
  content.replace(/<path[\s\S]+?d\s*=\s*['"]([\s\S]+?)['"][\s\S]*?>/g, ($0, $1) => {
    const _path = $1.replace(/H([\d.]+)/g, (...args) => {
      return "H" + (parseFloat(args[1]) + devX);
    })
    .replace(/V([\d.]+)/g, (...args) => {
      return "V" + (parseFloat(args[1]) + devY);
    })
    .replace(/([MLT])((\s*[\d.]+\s+[\d.]+)+)/g, (...args) => {
      const size = args[2].split(" ").filter(_item => _item && _item.trim());

      return args[1] + size.map((_item, _index) => {
        return parseFloat(_item) + (_index % 2 === 0 ? devX : devY);
      }).join(" ");
    })
    .replace(/(A(\S+\s+){5})(\S+)\s+([\d.]+)/g, (...args) => {
      return args[1] + (parseFloat(args[3]) + devX) + " " + (parseFloat(args[4]) + devY);
    });
    paths.push(`<path d="${_path}"></path>`);
  });
  return `<?xml version="1.0" standalone="no"?>
<svg viewBox="0 0 ${Size} ${Size}" xmlns="http://www.w3.org/2000/svg">
    ${paths.join(`
`)}
</svg>`;
}

gulp.task("default", async function () {
  gulp.src("./src/**/*.svg")
  .pipe(through2.obj(function (file, enc, callback) {
    if (file.isBuffer()) {
      file.contents = Buffer(Trans(String(file.contents)));
    }
    this.push(file);
    callback();
  }))
  .pipe(gulp.dest("./dest"))
});