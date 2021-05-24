const marked = require("marked");
const jsdom = require("jsdom");

const { JSDOM } = jsdom;
const axios = require("axios");

const fs = require("fs");
const path = require("path");
const { readFile } = require("fs/promises");
const { readdir } = require("fs/promises");

const mdLinks = (filePath, options = { validate: false }) =>
  // eslint-disable-next-line consistent-return
  new Promise((resolv, rej) => {
    const existPath = fs.existsSync(filePath);
    if (!existPath) return rej(console.error("Error:Please verify path"));

    const getLinks = (pathFile) =>
      readFile(pathFile).then((content) => {
        const tokens = marked.lexer(content.toString());
        const html = marked.parser(tokens);
        const dom = new JSDOM(html);
        const links = dom.window.document.querySelectorAll("a");
        const linksHttp = [...links].filter((link) =>
          link.href.startsWith("http")
        );
        return linksHttp.map((link) => ({
          href: link.href,
          text: link.textContent,
          file: pathFile,
        }));
      });

    const getFilesMd = (pathToGetMdFiles) =>
      readdir(pathToGetMdFiles, { withFileTypes: true }).then((files) =>
        Promise.all(
          files.map((file) => {
            const pathResolve = path.resolve(pathToGetMdFiles, file.name);
            const fileParsed = file.isDirectory()
              ? getFilesMd(pathResolve)
              : pathResolve;
            return fileParsed;
          })
        )
      );

    let arrayObjs;
    const extName = path.extname(filePath);
    const isDir = fs.lstatSync(filePath).isDirectory();
    if (isDir) {
      arrayObjs = getFilesMd(filePath).then((mdFiles) =>
        /*  const flattenDeep = (arr1) =>
          arr1.reduce(
            (acc, val) =>
              Array.isArray(val)
                ? acc.concat(flattenDeep(val))
                : acc.concat(val),
            []
          ); */
        Promise.all(mdFiles.flat(300).map((Element) => getLinks(Element)))
      );
    } else if (extName === ".md") {
      arrayObjs = getLinks(filePath);
    } else {
      rej(console.error("Error: File is not .md File"));
    }

    const arrayFinal = arrayObjs.then((val) => val.flat());

    if (options.validate) {
      arrayFinal.then((arrayLink) => {
        Promise.all(
          arrayLink.map((objLink) => {
            const objUrl = objLink;
            return axios
              .get(objLink.href)
              .then((response) => {
                objUrl.status = response.status;
                objUrl.ok = response.statusText;
              })
              .catch((error) => {
                if (error.response) {
                  objUrl.status = error.response.status;
                  objUrl.ok = error.response.statusText;
                } else if (error.request) {
                  objUrl.status = error.request.status;
                  objUrl.ok = error.request.statusText;
                } else {
                  console.error("Error", error.message);
                }
              });
          })
        )
          .then(() => resolv(arrayLink))
          .catch((err) => rej(console.error(err)));
      });
    } else {
      arrayObjs.then((n) => resolv(n.flat()));
    }
  });

module.exports = mdLinks;
