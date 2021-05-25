const axios = require("axios");
const MockAdapter = require("axios-mock-adapter");
const mdLinks = require("../src/index");

const mock = new MockAdapter(axios);
global.axios = mock;
mock.onGet("https://nodejs.org/es/").reply(200, {});
mock.onGet("https://www.youtube.com/wat.....").reply(404, {});
// mock.onGet("https://nodejs.org/es/").reply(200, {});

describe("mdLinks", () => {
  it("should be a function", () => {
    expect(typeof mdLinks).toBe("function");
  });
  it("should return an error if the path does not exist", () => {
    expect.assertions(1);
    return mdLinks("path/notExist").catch((result) => {
      expect(result.message).toBe("Please verify path");
    });
  });
  it("should return an array", () => {
    expect.assertions(1);
    return mdLinks("readme.md").then((result) => {
      expect(Array.isArray(result)).toBeTruthy();
    });
  });
  it("should return objectResult", () => {
    const objResult = {
      href: "https://nodejs.org/",
      text: "Node.js",
      file: "readme_test.md",
    };
    expect.assertions(1);
    return mdLinks("readme_test.md").then((result) => {
      expect(result[1]).toEqual(objResult);
    });
  });

  it("should return a status 404", () => {
    expect.assertions(1);
    return mdLinks("readme_test.md", { validate: true }).then((result) => {
      expect(result[4].status).toBe(404);
    });
  });
  it("should return a promise type object", () => {
    expect.assertions(1);
    return mdLinks("./prueba").then((result) => {
      expect(Array.isArray(result)).toBeTruthy();
    });
  });
  it("should return an error if the file is not .md ext", () => {
    expect.assertions(1);
    return mdLinks("./bin/global.js").catch((result) => {
      expect(result.message).toBe("Error: File is not .md File");
    });
  });
});
