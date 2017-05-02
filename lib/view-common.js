const compile = require('./handlebars-compile');

const headerView = compile('layout/header.handlebars');
const footerView = compile('layout/footer.handlebars');

exports.header = function(model){
  return function(req, res, next){
    res.type('html');
    res.write(headerView(model));
    next();
  };
};

exports.footer = function(model){
  return function(req, res){
    let state = Object.assign({}, model, {
      state: req.appState
    });
    res.write(footerView(state));
    res.end();
  };
};