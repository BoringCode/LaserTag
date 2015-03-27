var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('games');
});

router.get('/:id/', function(req, res, next) {
   res.send("Display game ID: " + req.params.id);
});

module.exports = router;
