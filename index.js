const marked = require("marked");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const axios = require("axios");

const fs = require("fs");
const http = require("http");
const path = require("path");

/* const server = http
  .createServer((req, res) => {
    console.log(req.url);
    res.end("<h1>Hello, World!</h1>");
  })
  .listen(3000);

console.log("escuchando"); */

const linksArray = [];
const mdLinks = (filePath, options = { validate: false }) => {
  return new Promise((resolve, reject) => {
    if (path.extname(filePath) !== ".md")
      return reject("File is not .md extension");
    fs.readFile(filePath, (err, data) => {
      if (!data) return reject(`Error Path ${err}`);

      const tokens = marked.lexer(data.toString());
      const html = marked.parser(tokens);
      const dom = new JSDOM(html);
      const links = dom.window.document.querySelectorAll("a");
      links.forEach((link) => {
        if (!link.href.startsWith("about:blank"))
          linksArray.push({
            href: link.href,
            text: link.textContent,
            file: filePath,
          });
      });
      const promisesArray = [];
      if (options.validate)
        linksArray.forEach((objLink) => {
          promisesArray.push(
            new Promise((resolve) => {
              const objUrl = objLink;
              axios
                .get(objUrl.href)
                .then((response) => {
                  objUrl.status = response.status;
                  objUrl.ok = response.statusText;
                  resolve();
                })
                .catch((error) => {
                  objUrl.status = error.response.status;
                  objUrl.ok = error.response.statusText;
                  resolve();
                });
            })
          );
        });
      Promise.all(promisesArray).then((value) => resolve(linksArray));
    });
  });
};

mdLinks(__dirname + "/README.md", { validate: true })
  .then((result) => {
    console.log(result);
  })
  .catch((error) => console.log(`Error:${error}`));

// module.exports = () => {
//   mdLinks;
// };
