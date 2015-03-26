var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('games');
});

router.get('/test', function(req, res, next) {
	res.send('message');
});

module.exports = router;
