var express = require('express');
var router = express.Router();
var cors = require('cors');
var ActiveDirectory = require('activedirectory');

router.use(cors());
module.exports = router;

router.get('/getUser', function (req, res){
    var username = 'etanner';
    var password = 'ericdobyjudyshadow';
    var config = { url: 'ldap://daylight.ads:389',
        baseDN: 'OU=Daylight Users,DC=daylight,DC=ads',
        username: 'SVC_SSCAP',
        password: '$$c@p@cc0unT' };

    console.log(config)
    var ad = new ActiveDirectory(config);
    var sAMAccountName = 'etanner';
    ad.getGroupMembershipForUser(sAMAccountName, function(err, groups){
        if (err) {
            console.log('ERROR: '+JSON.stringify(err));
            return;
        }

        if (! groups) {
            console.log('User: ' + sAMAccountName + ' not found.')
        }else{
            console.log('Authenticated!');
            res.statusCode = 200
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
            res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,contenttype'); // If needed
            res.setHeader('Access-Control-Allow-Credentials', true);
            res.json('Authenticated ' + username)
        }
    });

    console.log(username);
    console.log(password);

})

