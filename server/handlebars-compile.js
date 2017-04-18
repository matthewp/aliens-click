const fs = require('fs');
const Handlebars = require('handlebars');
const path = require('path');

const isProduction = process.env.NODE_ENV === 'production';

module.exports = isProduction ? precompiled : ondemand;

function precompiled(pth){
  pth = joinToViews(pth);
  let tmpl = fs.readFileSync(pth, 'utf8');
  return Handlebars.compile(tmpl);
}

function ondemand(pth){
  pth = joinToViews(pth);
  return function(data){
    let tmpl = fs.readFileSync(pth, 'utf8');
    let render = Handlebars.compile(tmpl);
    return render(data);
  };
}

function joinToViews(pth){
  return path.join(__dirname, '../views', pth);
}

function registerPartials() {
  var partialsDir = __dirname + '/../views/partials';

  var filenames = fs.readdirSync(partialsDir);

  filenames.forEach(function (filename) {
    var matches = /^([^.]+).handlebars$/.exec(filename);
    if (!matches) {
      return;
    }
    var name = matches[1];
    var template = fs.readFileSync(partialsDir + '/' + filename, 'utf8');
    Handlebars.registerPartial(name, template);
  });
}

registerPartials();