var express = require('express');

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('login');
});
/*router.get('/login/facebook',
  passport.authenticate('facebook'));*/

module.exports = router;
