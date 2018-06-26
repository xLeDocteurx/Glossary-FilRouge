var fs = require('fs');

exports.commit = function (data) {
  // console.log(JSON.stringify(data));
  // fs.writeFile('save.json', "This is working");
  fs.writeFile('./public/json/core.json', JSON.stringify(data), function (err) {
    if (err) throw err;
    console.log('JSON successfully modified!');
  });
};