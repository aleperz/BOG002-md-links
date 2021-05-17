const marked = require("marked");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const fs = require("fs");
const http = require("http");

/* const server = http
  .createServer((req, res) => {
    console.log(req.url);
    res.end("<h1>Hello, World!</h1>");
  })
  .listen(3000);

console.log("escuchando"); */

const linksArray = [];
const mdLinks = (path, options = { validate: false }) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, (err, data) => {
      if (!data) {
        reject(`Error Path ${err}`);
      } else {
        if (!options.validate) {
          const tokens = marked.lexer(data.toString());
          /* const objTokens = tokens.map((token) => token.tokens);
        console.log(objTokens);        
        console.log(tokens); */
          const html = marked.parser(tokens);
          const dom = new JSDOM(html);
          const links = dom.window.document.querySelectorAll("a");
          links.forEach((link) => {
            if (!link.href.startsWith("about:blank"))
              linksArray.push({
                href: link.href,
                text: link.textContent,
                file: path,
              });
          });
        } else {
          linksArray.push("validate true");
        }
        resolve(linksArray);
      }
    });
  });
};

mdLinks(__dirname + "/README.md")
  .then((result) => {
    console.log(result);
  })
  .catch((error) => console.log(`${error}"fallo algo"`));

// module.exports = () => {
//   mdLinks;
// };
