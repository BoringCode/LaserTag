var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'CSE Laser Tag' });
});

router.get('/about/', function(req, res, next) {
   res.render('index', {title: 'About Page'});
})

module.exports = router;
