// note run "node app.js" to start web service
// to compile run copy all files to web server
var express = require('express');
var moment =  require('moment');
var ibmdb = require('ibm_db'),
    cn = "DATABASE=DYLT_IMP;HOSTNAME=db2prod01;PORT=50000;PROTOCOL=TCPIP;UID=svc_sscap;PWD=$$c@p@cc0unT";
var router = express.Router();
var cors = require('cors')
router.use(cors())

module.exports = router;


12/21/2017
// router.use(function(req, res, next) {
//     res.setHeader("Access-Control-Allow-Origin", "*");
//     res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
// });
router.get('/docStats', function (req, res) {
    var todayDate = new Date();
    const start = req.params.start;
    const end = req.params.end;
    const term = req.params.term;
    var startDay = moment(todayDate).subtract(start, 'day').format('MM/DD/YYYY');
    var endDay = moment(todayDate).add(end, 'day').format('MM/DD/YYYY');

    ibmdb.open(cn,function(err,conn){
        if (err){
            return console.log(err)
        }
        var stmt = 'select * from\n' +
            '(\n' +
            'select t.DELIVERY_TERMINAL, ttp.TRIP_NUMBER, t.DETAIL_LINE_ID, t.BILL_NUMBER, t.ORIGNAME, t.ORIGPROV, t.ORIGPC, t.DESTNAME, \n' +
            '       t.DESTPROV, t.DESTPC, t.CURRENT_ZONE, t.CURRENT_STATUS, t.PICK_UP_BY, t.DELIVER_BY,\n' +
            '       t.SERVICE_LEVEL, t.PICK_UP_DRIVER, t.ROLLUP_PIECES, t.ROLLUP_WEIGHT, t.ROLLUP_PALLETS,\n' +
            '       v.TERMINAL_ZONE as Pickup_Zone, t.PICKUP_TERMINAL,v2.TERMINAL_ZONE as Delivery_Zone, \n' +
            '       t.DELIVERY_TERMINAL as LANE, c.NAME, \'DailyTonnage\' as "RPT"\n' +
            'from tmwin.tlorder t\n' +
            'join tmwin.V_TERMINAL_LIST v on t.PICKUP_TERMINAL = v.TERMINAL_ZONE\n' +
            'join tmwin.V_TERMINAL_LIST v2 on t.DELIVERY_TERMINAL = v2.TERMINAL_ZONE\n' +
            'join tmwin.COMPANY_INFO_SRC c on t.COMPANY_ID = c.COMPANY_INFO_ID\n' +
            'left join TMWIN.TLORDER_TERM_PLAN ttp on t.DETAIL_LINE_ID = ttp.DETAIL_LINE_ID\n' +
            'where t.PICK_UP_BY between (current timestamp - 14 day) and (current timestamp -1 day)\n' +
            //'and v.TERMINAL_ZONE = \'ONT\'\n' +
            'and t.BILL_NUMBER not like \'%Q%\'\n' +
            'and t.BILL_NUMBER != \'NA\'\n' +
            'and t.BILL_NUMBER not like \'%D\'\n' +
            'and t.PICKUP_TERMINAL like t.DELIVERY_TERMINAL \n' +
            'and t.BILL_NUMBER <> \'NA\' \n' +
            'and NOT t.BILL_NUMBER Like \'%VQ%\' \n' +
            'and t.CURRENT_STATUS <> \'QUOTE\' \n' +
            'and t.PICK_UP_BY = current date - 1 day\n' +
            'and t.DOCUMENT_TYPE <> \'CREDIT\' \n' +
            'and ttp.TX_TYPE <> \'D\' \n' +
            'and (\n' +
            '    t.INTERFACE_STATUS_F is null \n' +
            '    or t.INTERFACE_STATUS_F > -1\n' +
            ')\n' +
            'UNION\n' +
            'select t.DELIVERY_TERMINAL, ttp.TRIP_NUMBER, t.DETAIL_LINE_ID, t.BILL_NUMBER, t.ORIGNAME, t.ORIGPROV, t.ORIGPC, t.DESTNAME, t.DESTPROV, t.DESTPC,\n' +
            '    t.CURRENT_ZONE, t.CURRENT_STATUS, t.PICK_UP_BY, t.DELIVER_BY, t.SERVICE_LEVEL, \n' +
            '        t.PICK_UP_DRIVER, t.ROLLUP_PIECES, t.ROLLUP_WEIGHT, t.ROLLUP_PALLETS, \n' +
            '        v.TERMINAL_ZONE as Pickup_Zone, t.PICKUP_TERMINAL, v2.TERMINAL_ZONE as Delivery_Zone, t.DELIVERY_TERMINAL as LANE, c.NAME,\n' +
            '        \'OutBillsOnDoc\' as "RPT"\n' +
            'from tmwin.tlorder t\n' +
            'join tmwin.v_terminal_list v on t.PICKUP_TERMINAL = v.TERMINAL_ZONE\n' +
            'join tmwin.v_terminal_list v2 on t.DELIVERY_TERMINAL = v2.TERMINAL_ZONE\n' +
            'join tmwin.COMPANY_INFO_SRC c on t.COMPANY_ID = c.COMPANY_INFO_ID\n' +
            'left join TMWIN.TLORDER_TERM_PLAN ttp on t.DETAIL_LINE_ID = ttp.DETAIL_LINE_ID \n' +
            'where t.CURRENT_STATUS in (\'UNLOADING\', \'DOCKED\') \n' +
            'and t.SERVICE_LEVEL <> \'NON-NTWK\' \n' +
            'and  t.PICK_UP_BY >= current date - 5 days \n' +
            'and  t.PICK_UP_BY <= current date \n' +
            // 'and t.PICKUP_TERMINAL like (\'ONT\') \n' +
            // 'and T.DELIVERY_TERMINAL like (\'ONT\') \n' +
            'and ttp.TX_TYPE <> \'D\' \n' +
            'with ur\n' +
            ')\n' +
            'order by delivery_terminal,  BILL_NUMBER, trip_number\n'

        //console.log(stmt)
        conn.query(stmt, function (err,rows) {
            if (err){
                console.log(err);
            }else {
                console.log(rows.length);
                console.log(rows);
                console.log(rows.length);
                //console.log(typeof rows);
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
                res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,contenttype');
                res.setHeader('Access-Control-Allow-Credentials', true);
                res.json(rows)
            }
        })
    });
});

router.get('/trip/:term/:start/:end', function (req, res) {
    var todayDate = new Date();
    const start = req.params.start;
    const end = req.params.end;
    const term = req.params.term;
    var startDay = moment(todayDate).subtract(start, 'day').format('MM/DD/YYYY');
    var endDay = moment(todayDate).add(end, 'day').format('MM/DD/YYYY');

    ibmdb.open(cn,function(err,conn){
        if (err){
            return console.log(err)
        }
        var stmt = 'select t.TRIP_NUMBER, t.STATUS "TRIP STATUS", te.TERMINAL_ZONE,\n' +
            '       ls.ls_leg_wgt, ls.LS_LEG_DIST, ls.LS_LEG_STAT, ls.LS_PLANNED_DEPARTURE, ls.LS_ETA_DATE\n' +
            'from TMWIN.trip t\n' +
            'join TMWIN.legsum ls \n' +
            '    on ls.LS_TRIP_NUMBER = t.TRIP_NUMBER \n' +
            '    and ls.LS_LEG_STAT = \'ACTIVE\'\n' +
            '    and ls.LS_PLANNED_DEPARTURE between  date(\'' + startDay +'\') and  date(\'' + endDay  + '\')\n' +
            'join TMWIN.TERMINAL te \n' +
            '    on t.TERMINAL_ID = te.TERMINAL_ID\n' +
            'where t.STATUS not in (\'CANCL\', \'COMPLETE\', \'PLAN\')  \n' +
            ' and te.TERMINAL_ZONE = \'' + term + '\' \n' +
            'order by t.status, t.TRIP_NUMBER '

        //console.log(stmt)
        conn.query(stmt, function (err,rows) {
            if (err){
                console.log(err);
            }else {
                console.log(rows.length);
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
                res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,contenttype'); // If needed
                res.setHeader('Access-Control-Allow-Credentials', true); // If needed
                res.json(rows)
            }
        })
    });
});

router.get('/termcount/:start/:end', function (req, res) {
    var todayDate = new Date();
    const start = req.params.start;
    const end = req.params.end;
    const term = req.params.term;
    var startDay = moment(todayDate).subtract(start, 'day').format('MM/DD/YYYY');
    var endDay = moment(todayDate).add(end, 'day').format('MM/DD/YYYY');

    ibmdb.open(cn,function(err,conn){
        if (err){
            return console.log(err)
        }
        var stmt = 'select a.terminal_zone, a.DESTINATION_ZONE, count(a.trip_number) "Count_Trips", sum(a.ls_leg_wgt) "Weight"\n' +
            'from (\n' +
            '    select t.TRIP_NUMBER, t.STATUS "TRIP STATUS", t.DESTINATION_ZONE, te.TERMINAL_ZONE, \n' +
            '        ls.ls_leg_wgt, ls.LS_LEG_DIST, ls.LS_LEG_STAT, ls.LS_PLANNED_DEPARTURE, ls.LS_ETA_DATE\n' +
            '    from TMWIN.trip t\n' +
            '    join TMWIN.LEGSUM ls ' +
            '       on t.TRIP_NUMBER = ls.LS_TRIP_NUMBER\n' +
            '       and ls.LS_PLANNED_DEPARTURE between date(\'' + startDay + '\') and  date(\'' + endDay + '\')\n' +
            '    join TMWIN.TERMINAL te \n' +
            '       on t.TERMINAL_ID = te.TERMINAL_ID \n' +
            '    where t.STATUS not in (\'CANCL\', \'COMPLETE\', \'PLAN\')\n' +
            '    and t.DESTINATION_ZONE != te.TERMINAL_ZONE \n' +
            ') a\n' +
            'group by a.TERMINAL_ZONE, a.DESTINATION_ZONE\n' +
            'order by a.TERMINAL_ZONE, a.DESTINATION_ZONE'

        //console.log(stmt)
        conn.query(stmt, function (err,rows) {
            if (err){
                console.log(err);
            }else {
                console.log(rows.length);
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
                res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,contenttype'); // If needed
                res.setHeader('Access-Control-Allow-Credentials', true); // If needed
                res.json(rows)
            }
        })
    });
});

router.get('/late/:start/:end', function (req, res) {
    var todayDate = new Date();
    const start = req.params.start;
    const end = req.params.end;
    var startDay = moment(todayDate).subtract(start, 'day').format('MM/DD/YYYY');
    var endDay = moment(todayDate).add(end, 'day').format('MM/DD/YYYY');

    console.log(start);
    console.log(end);
    console.log(startDay);
    console.log(endDay);

    ibmdb.open(cn,function(err,conn){
        if (err){
            return console.log(err)
        }
        var stmt = 'CALL TMWIN.RPT_LATE_TRIPS_KPI_DYLT(\'' + startDay + '\', \'' + endDay + '\', \'L\')';
        console.log(stmt);
        conn.query(stmt, function (err,rows) {
            if (err){
                console.log(err);
            }else {
                console.log(rows.length);
                // res.setHeader('Access-Control-Allow-Origin', '*');
                // res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
                // res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,contenttype'); // If needed
                // res.setHeader('Access-Control-Allow-Credentials', true); // If needed

                res.json(rows)
            }
        })
    });
});

router.get('/terminals', function (req, res) {
    ibmdb.open(cn,function(err,conn){
        if (err){
            return console.log(err)
        }
        var stmt = 'SELECT distinct TERMINAL_ID, TERMINAL_ZONE, TERMINAL_DESC FROM TMWIN.TERMINAL order by TERMINAL_ZONE with ur'
        conn.query(stmt, function (err,rows) {
            if (err){
                console.log(err);
            }else {
                console.log(rows.length);
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
                res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,contenttype'); // If needed
                res.setHeader('Access-Control-Allow-Credentials', true); // If needed
                res.json(rows)
            }
        })
    });
});

router.get('/orig', function (req, res) {
    ibmdb.open(cn,function(err,conn){
        if (err){
            return console.log(err)
        }
        var stmt = 'SELECT distinct TERMINAL_ID, TERMINAL_ZONE, TERMINAL_DESC FROM TMWIN.TERMINAL order by TERMINAL_ZONE with ur'
        conn.query(stmt, function (err,rows) {
            if (err){
                console.log(err);
            }else {
                console.log(rows.length);
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
                res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,contenttype'); // If needed
                res.setHeader('Access-Control-Allow-Credentials', true); // If needed
                res.json(rows)
            }
        })
    });
});

router.get('/all', function (req, res) {
    ibmdb.open(cn,function(err,conn){
        if (err){
            return console.log(err)
        }
        var stmt = getStmt('all', 2, 15, '' )
        conn.query(stmt, function (err,rows) {
            if (err){
                console.log(err);
            }else {
                console.log(rows.length);
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
                res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,contenttype'); // If needed
                res.setHeader('Access-Control-Allow-Credentials', true); // If needed

                res.json(rows)
            }
        })
    });
});

router.get('/byTerm/:orig', function (req, res) {
    const orig = req.params.orig;
    const start = null;
    const end = null;
    ibmdb.open(cn,function(err,conn){
        if (err){
            return console.log(err)
        }
        var stmt =  getStmt('byTerm', start, end, orig);
        conn.query(stmt, function (err,rows) {
            if (err){
                console.log(err);
            }else {
                console.log(rows.length);
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
                res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,contenttype'); // If needed
                res.setHeader('Access-Control-Allow-Credentials', true); // If needed

                res.json(rows)
            }
        })
    });
});

router.get('/byTerm/:orig/:start/:end', function (req, res) {
    const orig = req.params.orig;
    const start = req.params.start;
    const end = req.params.end;
    ibmdb.open(cn,function(err,conn){
        if (err){
            return console.log(err)
        }
        var stmt =  getStmt('byTerm', start, end, orig);

        conn.query(stmt, function (err,rows) {
            if (err){
                console.log(err);
            }else {
                console.log(rows.length);
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
                res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,contenttype'); // If needed
                res.setHeader('Access-Control-Allow-Credentials', true); // If needed

                res.json(rows)
            }
        })
    });
});

router.get('/west/:start/:end', function (req, res) {
    const start = req.params.start;
    const end = req.params.end;
    ibmdb.open(cn,function(err,conn){
        if (err){
            return console.log(err)
        }
        var stmt =  getStmt('west', start, end, '');

        conn.query(stmt, function (err,rows) {
            if (err){
                console.log(err);
            }else {
                console.log(rows.length);
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
                res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,contenttype'); // If needed
                res.setHeader('Access-Control-Allow-Credentials', true); // If needed

                res.json(rows)
            }
        })
    });
});

router.get('/east/:start/:end', function (req, res) {
    const start = req.params.start;
    const end = req.params.end;
    ibmdb.open(cn,function(err,conn){
        if (err){
            return console.log(err)
        }
        var stmt =  getStmt('east', start, end, '');

        conn.query(stmt, function (err,rows) {
            if (err){
                console.log(err);
            }else {
                console.log(rows.length);
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
                res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,contenttype'); // If needed
                res.setHeader('Access-Control-Allow-Credentials', true); // If needed

                res.json(rows)
            }
        })
    });
});

router.get('/byDate/:start/:end/:orig', function (req, res) {
    const start = req.params.start;
    const end = req.params.end;
    const orig = req.params.orig;
    ibmdb.open(cn,function(err,conn){
        if (err){
            return console.log(err)
        }
        //var stmt = getStmt(stmtType, start, end, orig);
        var stmt =  getStmt('byDate', start, end, orig);
        conn.query(stmt, function (err,rows) {
            if (err){
                console.log(err);
            }else {
                console.log(rows.length);
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
                res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,contenttype'); // If needed
                res.setHeader('Access-Control-Allow-Credentials', true); // If needed

                res.json(rows)
            }
        })
    });
});

router.get('/byDate/:start/:end', function (req, res) {
    const start = req.params.start;
    const end = req.params.end;
    const orig = req.params.orig;
    ibmdb.open(cn,function(err,conn){
        if (err){
            return console.log(err)
        }
        //var stmt = getStmt(stmtType, start, end, orig);
        var stmt =  getStmt('byDate', start, end, orig);
        conn.query(stmt, function (err,rows) {
            if (err){
                console.log(err);
            }else {
                console.log(rows.length);
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
                res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,contenttype'); // If needed
                res.setHeader('Access-Control-Allow-Credentials', true); // If needed

                res.json(rows)
            }
        })
    });
});

router.get('/west2', function (req, res) {
    console.log(req);
    ibmdb.open(cn,function(err,conn){
        if (err){
            return console.log(err)
        }
        var stmt = getStmt('west', 2, 15, '');
        //console.log(stmt);
        conn.query(stmt, function (err,rows) {
            if (err){
                console.log(err);
            }else {
                console.log(rows.length);
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
                res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,contenttype'); // If needed
                res.setHeader('Access-Control-Allow-Credentials', true); // If needed

                res.json(rows)
            }
        })
    });

});

function getStmt(stmtType, start , end , orig ){
    console.log('');
    var rptType = '';
    switch(stmtType){
        case 'east':
            rptType = 'and ORIG not in ( \'ONT\', \'LAX\', \'SFO\', \'VIS\' ) \n';
            break;
        case 'west':
            rptType = 'and ORIG in ( \'ONT\', \'LAX\', \'SFO\', \'VIS\' ) \n';
            break;
        case 'all':
            rptType = '';
            break;
        case 'byTerm':
            rptType = 'and ORIG = \'' + orig + '\' \n' ;
            break;
        case 'byDate':
            rptType = 'and ORIG = \'' + orig + '\' \n' ;
            break;
    }
    var stmt = 'SELECT CARRIER, TRIP, ORIG, DEST, \n' +
        'case dayname(PLAN_DEPART) \n' +
        'when \'Monday\' then  \'Mon\' || \' \' || date(PLAN_DEPART) || \' \' ||  VARCHAR_FORMAT(PLAN_DEPART, \'HH24\') || \':\'|| VARCHAR_FORMAT(PLAN_DEPART, \'MI\') \n'+
        'when \'Tuesday\' then \'Tue\' || \' \' || date(PLAN_DEPART) || \' \' ||  VARCHAR_FORMAT(PLAN_DEPART, \'HH24\') || \':\'|| VARCHAR_FORMAT(PLAN_DEPART, \'MI\') \n'+
        'when \'Wednesday\' then \'Wed\' || \' \' || date(PLAN_DEPART) || \' \' ||  VARCHAR_FORMAT(PLAN_DEPART, \'HH24\') || \':\'|| VARCHAR_FORMAT(PLAN_DEPART, \'MI\') \n'+
        'when \'Thrusday\' then \'Thu\' || \' \' || date(PLAN_DEPART) || \' \' ||  VARCHAR_FORMAT(PLAN_DEPART, \'HH24\') || \':\'|| VARCHAR_FORMAT(PLAN_DEPART, \'MI\') \n'+
        'when \'Friday\' then \'Fri\' || \' \' || date(PLAN_DEPART) || \' \' ||  VARCHAR_FORMAT(PLAN_DEPART, \'HH24\') || \':\'|| VARCHAR_FORMAT(PLAN_DEPART, \'MI\') \n'+
        'when \'Saturday\' then \'Sat\' || \' \' || date(PLAN_DEPART) || \' \' ||  VARCHAR_FORMAT(PLAN_DEPART, \'HH24\') || \':\'|| VARCHAR_FORMAT(PLAN_DEPART, \'MI\') \n'+
        'when \'Sunday\' then \'Sun\'|| \' \' || date(PLAN_DEPART) || \' \' ||  VARCHAR_FORMAT(PLAN_DEPART, \'HH24\') || \':\'|| VARCHAR_FORMAT(PLAN_DEPART, \'MI\') \n'+
        'end AS PLAN_DEPART ,\n'+
        'STATUS, BOOKING_NUMBER, OFFERED, \n' +
        'case\n' +
        'when timestampdiff(8, char(plan_depart) - current timestamp) < 1 then \'red\'\n' +
        'when timestampdiff(8, char(plan_depart) - current timestamp) = 1 and timestampdiff(8, char(plan_depart) - current timestamp) < 3 then \'yellow\'\n' +
        'end COLOR \n' +
        'FROM TMWIN.VW_LH_TRIP_BOARD\n' +
        'WHERE STATUS NOT IN (\'DISP\',\'CANCL\',\'ENRTE\',\'ARRCONS\',\'ARRSHIP\',\'ARRTERM\',\'COMPLETE\',\'D-HOS\',\'D-Incident\',\'D-Mech\',\'DELAY\',\'Docked\',\'L-Carr Perf\',\'L- Clean Up\',\'L-Drvr Perf\',\'L-OB Cut\',\'L- Pickup\',\'L-Stopoff\',\'LATE\',\'TONU\',\'WEATHER\')\n' ;
        if (end != null || end > ''){
            stmt = stmt + 'AND PLAN_DEPART < (current date + ' + end + ' days)\n';
        };
        if (start != null || start > ''){
            stmt = stmt  + 'and PLAN_DEPART > (current date - ' + start + ' days)\n';
        };
        stmt = stmt + rptType + 'and ORIG != DEST\n' +
        'ORDER BY  COLOR, plan_depart, ORIG, DEST' ;
        return stmt;
}


