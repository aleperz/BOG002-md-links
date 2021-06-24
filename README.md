# Markdown Links

Markdown Links extracts and validates markdown file links (.md). You will also be able to obtain the statistics of the total of links, and the number of unique and broken links.

## Installation

In the same directory as your `package.json` file, create or edit an `.npmrc` file to include this line:

```
@aleperz:registry=https://npm.pkg.github.com
```

### As a dependency in your project

```
npm install @aleperz/md-links@1.0.0
```

## Usage

### 1. API

The mdLinks function is also usable through an API:

#### `mdLinks(path[,options])`

##### Arguments

- `path`: `<string>` | Absolute or relative path to the file or directory.
- `options`: `<string>` | An object with only the following property:
  - `validate`: Boolean that determines if you want to validate the links found.

##### Return value

`<Promise>` Fulfills with an array of objects, where each object represents a link and contains the following properties:

With `{ validate: false }`:

- `href`: URL found.
- `text`: Text before the link.
- `file`: Path of the file where the link was found.

With `{ validate: true }` :

- `href`: URL found.
- `text`: Text before the link.
- `file`: Path of the file where the link was found.
- `status`: HTTP response code.
- `ok`: Message `fail` in case of failure or` ok` in case of success.

#### Example (results as comments)

```js
const mdLinks = require("md-links");

mdLinks("./some/example.md")
  .then((links) => {
    // => [{ href, text, file }, ...]
  })
  .catch(console.error);

mdLinks("./some/example.md", { validate: true })
  .then((links) => {
    // => [{ href, text, file, status, ok }, ...]
  })
  .catch(console.error);

mdLinks("./some/dir")
  .then((links) => {
    // => [{ href, text, file }, ...]
  })
  .catch(console.error);
```

### 2. CLI

Markdown Links can be run as follows via terminal:

`md-links <path-to-file> [options]`


Example:

#### Options

##### `--validate`

The module makes an HTTP request to find out if the link works or not.

Example:

```sh
$ md-links ./some/example.md --validate
./some/example.md http://algo.com/2/3/ ok 200 Link a algo
./some/example.md https://otra-cosa.net/algun-doc.html fail 404 algún doc
./some/example.md http://google.com/ ok 301 Google
```

##### `--stats`

With which you can obtain basic statistics about the links.

```sh
$ md-links ./some/example.md --stats
Total: 3
Unique: 3
```

You can also combine `--stats` and` --validate` to get needed statistics from the validation results.

```sh
$ md-links ./some/example.md --stats --validate
Total: 3
Unique: 3
Broken: 1
```
