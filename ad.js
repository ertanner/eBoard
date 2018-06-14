var express = require('express');
var router = express.Router();
var cors = require('cors');
var ActiveDirectory = require('activedirectory');

router.use(cors());
module.exports = router;

function authUser(ad, username, password){
    console.log('Hi')
    ad.authenitcate(username, password, function(err, auth){
        if (err) {
            console.log('ERROR: '+JSON.stringify(err));
            console.log(username);
            console.log(password);
            return;
        }

        if (auth) {
            console.log('Authenticated!');
            console.log(auth);
            res.statusCode = 200
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
            res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,contenttype'); // If needed
            res.setHeader('Access-Control-Allow-Credentials', true);
            res.json('Authenticated ' + username)
        }
        else {
            console.log('Authentication failed!');
        }
    });
}
router.get('/getUser', function (req, res){
    var username = 'SVC_SSCAP';
    var password = '$$c@p@cc0unT';
    var config = { url: 'ldap://daylight.ads:389',
        baseDN: 'OU=Daylight Users,DC=daylight,DC=ads',
        username: 'SVC_SSCAP',
        password: '$$c@p@cc0unT' };

    var ad = new ActiveDirectory(config);

    console.log(username);
    console.log(password);
})

