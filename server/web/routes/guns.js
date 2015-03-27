var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('guns');
});

router.get('/:id/', function(req, res, next) {
   res.send("Display gun ID: " + req.params.id);
});

module.exports = router;
