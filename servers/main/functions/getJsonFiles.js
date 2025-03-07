const path = require("path");
const fs = require("fs");

const getJsonFiles = (folder, fileName, params = {}) => {
  
  let data = {};
  const dirPath = path.join(process.cwd(), folder);

  if (fileName) {
    data = JSON.parse(fs.readFileSync(path.join(dirPath, fileName)));
  } else {
    fs.readdirSync(dirPath).forEach((fileName) => {
      const file = fs.readFileSync(path.join(dirPath, fileName));
      fileName = fileName.split(".json")[0];
      data[fileName] = JSON.parse(file);
    });
  }

  if (params.id) {
    data = data.filter((data) => params.id.find((id) => id === data.id));
  }

  return data;
};

module.exports = {getJsonFiles};
