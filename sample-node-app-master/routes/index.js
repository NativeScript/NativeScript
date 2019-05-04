var express = require('express');
var router = express.Router();
var nconf = require('nconf');

// For local-dev convenience, we'll use a hard-coded config file,
// but in production, we'd like to take advantage of Habitat's support
// for dynamic configuration, so we'll pass as an argument the path
// to the config file that Habitat will render for us on startup.
// See ./habitat/hooks/run for the implementation details.
nconf.file({ file: process.argv[2] || './dev-config.json' });

router.get('/', function(req, res, next) {
  res.render('index', {
    title: nconf.get('title'),
    message: nconf.get('message')
  });
});

module.exports = router;
