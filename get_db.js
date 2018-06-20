// note run "node app.js" to start web service
// to compile run copy all files to web server
var express = require('express');
var moment =  require('moment'); //  time js

var ibmdb = require('ibm_db'),
    cn = "DATABASE=DYLT_IMP;HOSTNAME=db2prod01;PORT=50000;PROTOCOL=TCPIP;UID=svc_sscap;PWD=$$c@p@cc0unT";
var ibmdb_db2admin = require('ibm_db'),
    con = "DATABASE=DYLT_IMP;HOSTNAME=db2prod01;PORT=50000;PROTOCOL=TCPIP;UID=db2admin;PWD=Maddox01";

var ibmdb_Rep = require('ibm_db'),
    conRep = "DATABASE=DYLT_REP;HOSTNAME=db2test01;PORT=50000;PROTOCOL=TCPIP;UID=db2admin;PWD=Maddox01";


var router = express.Router();
var cors = require('cors');
router.use(cors());
module.exports = router;


// rep
router.post('/insInv', function (req, res) {
    var desc = req.body.desc
    var found = req.body.found
    var sql = 'insert into TMWIN.DYLT_OSD_Inv_Mgt(Description, Row_Timestamp, Found) VALUES (?, current timestamp, ?)';
    ibmdb_Rep.open(conRep,function(err,conn){
        if (err){
            return console.log(err)
        } else {
            conn.prepare(sql, function (err, stmt) {
                if (err) {
                    console.log(err);
                    res.statusCode = 500;
                    return res.json({
                        errors: ['Failed to enter item. ' + err]
                    });
                }
                // bind the stamements
                stmt.executeNonQuery([desc, found], function (err, result) {
                    console.log(err);
                    res.statusCode = 200
                    res.setHeader('Access-Control-Allow-Origin', '*');
                    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
                    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,contenttype'); // If needed
                    res.setHeader('Access-Control-Allow-Credentials', true);
                    res.json(result)
                });
            });
        }
    });
});
router.post('/delInv', function (req, res) {
    var id = req.body.id
    var found = req.body.found
    console.log(id)
    console.log(found)
    var sql = 'delete from TMWIN.DYLT_OSD_Inv_Mgt where ID = ?';
    console.log(sql)
    ibmdb_Rep.open(conRep,function(err,conn){
        if (err){
            return console.log(err)
        } else {
            conn.prepare(sql, function (err, stmt) {
                if (err) {
                    console.log(err);
                    res.statusCode = 500;
                    return res.json({
                        errors: ['Failed to enter item. ' + err]
                    });
                }
                // bind the stamements
                stmt.executeNonQuery([id], function (err, result) {
                    console.log(err);
                    res.statusCode = 200
                    res.setHeader('Access-Control-Allow-Origin', '*');
                    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
                    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,contenttype'); // If needed
                    res.setHeader('Access-Control-Allow-Credentials', true);
                    res.json(result)
                });
            });
        }
    });
});
router.get('/listInv', function (req, res) {
    var todayDate = new Date();
    const start = req.params.start;
    const end = req.params.end;
    const term = req.params.term;
    var startDay = moment(todayDate).subtract(start, 'day').format('MM/DD/YYYY');
    var endDay = moment(todayDate).add(end, 'day').format('MM/DD/YYYY');

    ibmdb_Rep.open(conRep,function(err,connR){
        if (err){
            return console.log(err)
        }
        var stmt = 'select * from TMWIN.DYLT_OSD_INV_MGT where FOUND = 0 with ur'

        connR.query(stmt, function (err,rows) {
            if (err){
                console.log(err);
            }else {
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
                res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,contenttype'); // If needed
                res.setHeader('Access-Control-Allow-Credentials', true); // If needed
                res.json(rows)
            }
        })
    });
});


// ibmdb_db2admin
router.get('/bphitratio', function (req, res) {
    var todayDate = new Date();
    const start = req.params.start;
    const end = req.params.end;
    const term = req.params.term;
    var startDay = moment(todayDate).subtract(start, 'day').format('MM/DD/YYYY');
    var endDay = moment(todayDate).add(end, 'day').format('MM/DD/YYYY');

    ibmdb_db2admin.open(con,function(err,conn){
        if (err){
            return console.log(err)
        }
        var stmt = 'SELECT\n' +
            '    min(TOTAL_HIT_RATIO_PERCENT) as minHR,\n' +
            '    CASE \n' +
            '        when min(TOTAL_HIT_RATIO_PERCENT) < 85.00 then \'red\'\n' +
            '        when min(TOTAL_HIT_RATIO_PERCENT) > 98.00 then \'green\'\n' +
            '        else \'yellow\'\n' +
            '    end v_Color\n' +
            'from sysibmadm.bp_hitratio bphr join table (mon_get_bufferpool(NULL,-2)) mgbp on bphr.bp_name=mgbp.bp_name\n' +
            'join syscat.bufferpools b on bphr.bp_name=b.bpname'

        conn.query(stmt, function (err,rows) {
            if (err){
                console.log(err);
            }else {
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
                res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,contenttype'); // If needed
                res.setHeader('Access-Control-Allow-Credentials', true); // If needed
                res.json(rows)
            }
        })
    });
});
router.get('/mempool', function (req, res) {
    var todayDate = new Date();
    const start = req.params.start;
    const end = req.params.end;
    const term = req.params.term;
    var startDay = moment(todayDate).subtract(start, 'day').format('MM/DD/YYYY');
    var endDay = moment(todayDate).add(end, 'day').format('MM/DD/YYYY');

    ibmdb_db2admin.open(con,function(err,conn){
        if (err){
            return console.log(err)
        }
        var stmt = 'select\n' +
            '  memory_set_type\n' +
            '  , memory_pool_type\n' +
            '  , sum(memory_pool_used)/1024 as used_mb\n' +
            'from\n' +
            '  table(mon_get_memory_pool(NULL,\'DYLT_IMP\',-2))\n' +
            'where db_name=\'DYLT_IMP\'\n' +
            'group by\n' +
            '  memory_set_type\n' +
            '  , memory_pool_type\n' +
            'with ur'

        conn.query(stmt, function (err,rows) {
            if (err){
                console.log(err);
            }else {
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
                res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,contenttype'); // If needed
                res.setHeader('Access-Control-Allow-Credentials', true); // If needed
                res.json(rows)
            }
        })
    });
});
router.get('/dbmem', function (req, res) {
    ibmdb_db2admin.open(con,function(err,conn){
        if (err){
            return console.log(err)
        }
        var stmt = 'select\n' +
            '    sum(memory_set_used)/1024 as used_mb,\n' +
            '    case\n' +
            '        when sum(memory_set_used)/1024 > 110000 then \'red\'\n' +
            '        when sum(memory_set_used)/1024 > 100000 then \'yellow\'\n' +
            '        else \'green\'\n' +
            '    end V_COLOR \n' +
            'from\n' +
            '  table(mon_get_memory_set(NULL,NULL,-2))\n' +
            'where db_name = \'DYLT_IMP\'\n' +
            'and memory_set_type = \'DATABASE\'\n' +
            'group by\n' +
            '  memory_set_type\n' +
            '  , db_name\n' +
            'with ur\n'
        conn.query(stmt, function (err,rows) {
            if (err){
                console.log(err);
            }else {
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
                res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,contenttype'); // If needed
                res.setHeader('Access-Control-Allow-Credentials', true); // If needed
                res.json(rows)
            }
        })
    });
});
router.get('/srvmem', function (req, res) {
    ibmdb_db2admin.open(con,function(err,conn){
        if (err){
            return console.log(err)
        }
        var stmt = 'SELECT cast(((T.CURRENT_PARTITION_MEM * 1.0) / T.MAX_PARTITION_MEM * 1.0) * 100.0 as decimal(6,3)) PERCENT_USED,\n' +
            ' case\n' +
            '    when ((T.CURRENT_PARTITION_MEM * 1.0) / T.MAX_PARTITION_MEM * 1.0) * 100.0 > 90.0 then \'red\'\n' +
            '    when ((T.CURRENT_PARTITION_MEM * 1.0) / T.MAX_PARTITION_MEM * 1.0) * 100.0 > 85.0 then \'yellow\'\n' +
            '    else \'green\'\n' +
            ' end V_COLOR\n' +
            'FROM TABLE (SYSPROC.ADMIN_GET_DBP_MEM_USAGE()) AS T with UR'
        conn.query(stmt, function (err,rows) {
            if (err){
                console.log(err);
            }else {
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
                res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,contenttype'); // If needed
                res.setHeader('Access-Control-Allow-Credentials', true); // If needed
                res.json(rows)
            }
        })
    });
});
router.get('/tblsptotsize', function (req, res) {
    ibmdb_db2admin.open(con,function(err,conn){
        if (err){
            return console.log(err)
        }
        var stmt = 'SELECT\n' +
            'substr(TBSP_NAME,1,18) as tbsp_name\n' +
            ', TBSP_PAGE_SIZE/1024 as ts_page_sz_k\n' +
            ', TBSP_TOTAL_PAGES*TBSP_PAGE_SIZE/1024/1024 as tbsp_size_mb\n' +
            ', case\n' +
            'when TBSP_TOTAL_PAGES>0 then decimal(float(TBSP_FREE_PAGES)/float(TBSP_TOTAL_PAGES) * 100,5,2)\n' +
            'else null\n' +
            'end as pct_empty\n' +
            ', TBSP_TOTAL_PAGES\n' +
            ', TBSP_PAGE_TOP\n' +
            'from table (mon_get_tablespace(NULL,-2))\n' +
            'where TBSP_CONTENT_TYPE not like \'%TEMP\'\n' +
            'order by STORAGE_GROUP_NAME, TBSP_PAGE_SIZE, TBSP_NAME'

        conn.query(stmt, function (err,rows) {
            if (err){
                console.log(err);
            }else {
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
                res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,contenttype'); // If needed
                res.setHeader('Access-Control-Allow-Credentials', true); // If needed
                res.json(rows)
            }
        })
    });
});
router.get('/dbaLocks24hr', function (req, res) {
    ibmdb_db2admin.open(con,function(err,conn){
        if (err){
            return console.log(err)
        }
        var stmt = 'with t1 as (\n' +
            'select distinct xmlid, event_type, event_timestamp \n' +
            'from db2admin.LOCK_EVENT\n' +
            'where EVENT_TIMESTAMP > current timestamp - 24 hours\n' +
            '--and EVENT_TYPE = \'DEADLOCK\'\n' +
            ')\n' +
            'select substr(t1.event_type,1,18) as event_type\n' +
            ', count(*) as count,\n' +
            'case\n' +
            '    when count(*) > 20 then \'red\'\n' +
            '    when count(*) > 5 then \'yellow\'\n' +
            '    else \'green\'\n' +
            '    END V_COLOR\n' +
            'from t1\n' +
            'where t1.EVENT_TIMESTAMP > current timestamp - 24 hours\n' +
            'group by event_type\n' +
            'order by t1.event_type\n' +
            'with ur'

        conn.query(stmt, function (err,rows) {
            if (err){
                console.log(err);
            }else {
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
                res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,contenttype'); // If needed
                res.setHeader('Access-Control-Allow-Credentials', true); // If needed
                res.json(rows)
            }
        })
    });
});
router.get('/bpHitRt', function (req, res) {
    ibmdb_db2admin.open(con,function(err,conn){
        if (err){
            return console.log(err)
        }
        var stmt = 'SELECT\n' +
            '        substr(bphr.BP_NAME,1,24) as BP_NAME\n' +
            '        , mgbp.BP_CUR_BUFFSZ\n' +
            '        , TOTAL_HIT_RATIO_PERCENT \n' +
            '        ,\n' +
            '        case \n' +
            '            when TOTAL_HIT_RATIO_PERCENT < 88.00  then \'red\'\n' +
            '            when TOTAL_HIT_RATIO_PERCENT < 95.00  then \'yellow\'\n' +
            '            else \'green\'\n' +
            '        end V_COLOR\n' +
            'from sysibmadm.bp_hitratio bphr join table (mon_get_bufferpool(NULL,-2)) mgbp on bphr.bp_name=mgbp.bp_name\n' +
            '        join syscat.bufferpools b on bphr.bp_name=b.bpname\n' +
            '        where bphr.bp_name like \'TMWIN%\''

        conn.query(stmt, function (err,rows) {
            if (err){
                console.log(err);
            }else {
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
                res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,contenttype'); // If needed
                res.setHeader('Access-Control-Allow-Credentials', true); // If needed
                res.json(rows)
            }
        })
    });
});
router.get('/irefPeriod', function (req, res) {
    ibmdb_db2admin.open(con,function(err,conn){
        if (err){
            return console.log(err)
        }
        var stmt = 'select IREF_PERIOD\n' +
            'from TMWIN.DYLT_IREF_STATS\n' +
            'where stat_time = (select max(stat_time) from tmwin.dylt_iref_stats)'

        conn.query(stmt, function (err,rows) {
            if (err){
                // console.log(err);
            }else {
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
                res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,contenttype'); // If needed
                res.setHeader('Access-Control-Allow-Credentials', true); // If needed
                res.json(rows)
            }
        })
    });
});
router.get('/irefOverall', function (req, res) {
    ibmdb_db2admin.open(con,function(err,conn){
        if (err){
            return console.log(err)
        }
        var stmt = 'select IREF \n' +
            'from TMWIN.DYLT_IREF_STATS\n' +
            'where stat_time = (select max(stat_time) from tmwin.dylt_iref_stats)'

        conn.query(stmt, function (err,rows) {
            if (err){
                console.log(err);
            }else {
                var iref
                if(Array.isArray(rows)){
                    for( i=0; rows.length; i++){
                        iref = rows[i]
                    }
                }
                console.log(iref);
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
                res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,contenttype'); // If needed
                res.setHeader('Access-Control-Allow-Credentials', true); // If needed
                res(iref)
            }
        })
    });
});
router.get('/irefData', function (req, res) {
    ibmdb_db2admin.open(con,function(err,conn){
        if (err){
            return console.log(err)
        }
        var stmt = 'select IREF, IREF_PERIOD from tmwin.DYLT_IREF_STATS\n' +
            'where STAT_TIME = (select  max(stat_time) from tmwin.DYLT_IREF_STATS)\n' +
            'with ur'

        conn.query(stmt, function (err,rows) {
            if (err){
                console.log(err);
            }else {
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
                res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,contenttype'); // If needed
                res.setHeader('Access-Control-Allow-Credentials', true); // If needed
                res.json(rows)
            }
        })
    });
});
router.get('/longRun', function (req, res) {
    ibmdb_db2admin.open(con,function(err,conn){
        if (err){
            return console.log(err)
        }
        var stmt = '\n' +
            'SELECT \n' +
            'rownumber() over (partition by lr.APPL_STATUS) as row_next, \n' +
            'substr(CAST(STMT_TEXT AS CHAR(254)),1,30) AS STMT_TEXT, INT(LR.AGENT_ID) AGENT_ID, CAST(APPL_NAME AS CHAR(25)) Application_Name,\n' +
            '--SUBSTR(AUTHID,1,25) USER_ID,\n' +
            '(SELECT USERNAME FROM tmwin.USERS WHERE USER_ID = AUTHID WITH UR) AS "User_Name", \n' +
            ' ELAPSED_TIME_MIN, \n' +
            ' LR.APPL_STATUS, \n' +
            ' CASE \n' +
            '    WHEN ELAPSED_TIME_MIN > 0 \n' +
            '    AND APPL_STATUS = \'UOWEXEC\' \n' +
            ' THEN \'1\' \n' +
            '    ELSE \'0\' \n' +
            ' END STAT_TIME,\n' +
            ' case\n' +
            '     when ELAPSED_TIME_MIN > 4 then \'red\'\n' +
            '     when APPL_STATUS = \'LOCKWAIT\' then \'purple\'\n' +
            '     when ELAPSED_TIME_MIN > 1 then \'orange\'\n' +
            ' End color\n' +
            'FROM SYSIBMADM.LONG_RUNNING_SQL LR\n' +
            'WHERE ELAPSED_TIME_MIN IS NOT NULL\n' +
            'AND STMT_TEXT IS NOT NULL \n' +
            'and (ELAPSED_TIME_MIN > 1 \n' +
            'or APPL_STATUS = \'LOCKWAIT\' \n' +
            ')\n' +
            '   ORDER BY 7 , 6 desc\n' +
            '   with ur'

        conn.query(stmt, function (err,rows) {
            if (err){
                console.log(err);
            }else {
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
                res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,contenttype'); // If needed
                res.setHeader('Access-Control-Allow-Credentials', true); // If needed
                res.json(rows)
            }
        })
    });
});
router.get('/hadr', function (req, res) {
    ibmdb_db2admin.open(con,function(err,conn){
        if (err){
            return console.log(err)
        }
        var stmt = 'WITH HADR_STAT AS (\n' +
            'SELECT * FROM SYSIBMADM.SNAPHADR\n' +
            ')\n' +
            'SELECT \'STATUS\' SERVER, \'GAP:\' || TRIM(CHAR(HADR_LOG_GAP)) LOG_FILE, CHAR(HADR_CONNECT_STATUS) LOG_PAGE, CHAR(HADR_STATE) LOG_LSN,1 as Orderby FROM HADR_STAT \n' +
            'UNION\n' +
            'SELECT \'DLPTMDB09\', CHAR(HADR_PRIMARY_LOG_FILE), CHAR(HADR_PRIMARY_LOG_PAGE), CHAR(HADR_PRIMARY_LOG_LSN),2 as Orderby FROM HADR_STAT \n' +
            'UNION\n' +
            'SELECT \'DLPTMDB01\', CHAR(HADR_STANDBY_LOG_FILE), CHAR(HADR_STANDBY_LOG_PAGE), CHAR(HADR_STANDBY_LOG_LSN),3 as Orderby FROM HADR_STAT \n' +
            'UNION\n' +
            'SELECT \'\', \n' +
            '\'BACKLOG: \' || CHAR(\n' +
            '    INT(translate(LEFT(HADR_PRIMARY_LOG_FILE, LENGTH(HADR_PRIMARY_LOG_FILE)),\'\', \' abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.`~!@#$%^&*()-_=+\\|[]{};:",<>/?  \')) -\n' +
            '    INT(translate(LEFT(HADR_STANDBY_LOG_FILE, LENGTH(HADR_STANDBY_LOG_FILE)),\'\', \' abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.`~!@#$%^&*()-_=+\\|[]{};:",<>/?  \')))\n' +
            ', \'\', CHAR(HADR_PRIMARY_LOG_LSN - HADR_STANDBY_LOG_LSN),4 as Orderby FROM HADR_STAT \n' +
            'ORDER BY Orderby\n' +
            'with ur'

        conn.query(stmt, function (err,rows) {
            if (err){
                console.log(err);
            }else {
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
                res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,contenttype'); // If needed
                res.setHeader('Access-Control-Allow-Credentials', true); // If needed
                res.json(rows)
            }
        })
    });
});

//ibmdb
router.get('/MessageQueueStatus', function (req, res) {
    ibmdb.open(cn,function(err,conn){
        if (err){
            return console.log(err)
        }
        var stmt = 'WITH RESULTS AS (\n' +
            '    SELECT \'OB\' "MSG_DIRECTION", \'Not Sent\' AS "STATUS", coalesce (COUNT(*), 1) "TTL_MSG",\n' +
            '    (\n' +
            '        SELECT TIMESTAMPDIFF(4,CHAR(TIMESTAMP(CREATED)-CURRENT TIMESTAMP))\n' +
            '        FROM tmwin.MESSAGE_FORWARD x\n' +
            '        WHERE x.CREATED >= CURRENT DATE AND x.STATUS = \'NS\'\n' +
            '        ORDER BY x.CREATED ASC\n' +
            '        FETCH FIRST ROW ONLY with ur\n' +
            '    ) "DELAY"\n' +
            '    FROM tmwin.MESSAGE_FORWARD \n' +
            '    WHERE CREATED >= CURRENT DATE AND STATUS = \'NS\'\n' +
            '    GROUP BY STATUS\n' +
            'UNION ALL\n' +
            '    SELECT \'IB\' "MSG_DIRECTION", \'Not Processed\' AS "STATUS", COUNT(*) "TTL_MSG",\n' +
            '    (\n' +
            '        SELECT TIMESTAMPDIFF(4,CHAR(TIMESTAMP(RECEIVED)-CURRENT TIMESTAMP)) \n' +
            '        FROM tmwin.MESSAGE_RETURN_PENDING x   \n' +
            '            LEFT OUTER JOIN tmwin.MESSAGE_RETURN_PENDING_RECEIVED a ON x.PENDING_ID = a.PENDING_ID\n' +
            '        WHERE a.RECEIVED BETWEEN CURRENT DATE AND CURRENT DATE + 1 DAYS AND x.STATUS IN (\'P\',\'M\')\n' +
            '        ORDER BY a.RECEIVED ASC\n' +
            '        FETCH FIRST ROW ONLY with UR\n' +
            '    ) "DELAY"\n' +
            '    FROM tmwin.MESSAGE_RETURN_PENDING \n' +
            '        LEFT OUTER JOIN tmwin.MESSAGE_RETURN_PENDING_RECEIVED b ON tmwin.MESSAGE_RETURN_PENDING.PENDING_ID = b.PENDING_ID\n' +
            '    WHERE RECEIVED BETWEEN CURRENT DATE AND CURRENT DATE + 1 DAYS AND STATUS IN (\'P\',\'M\')\n' +
            '    GROUP BY STATUS\n' +
            '    with UR\n' +
            ')\n' +
            'SELECT MSG_DIRECTION, STATUS, SUM(TTL_MSG) "TTL_MSG", DELAY,\n' +
            '    case\n' +
            '        when SUM(TTL_MSG) > 750 then \'red\'\n' +
            '        when SUM(TTL_MSG) > 400 then \'yellow\'\n' +
            '        else \'green\'\n' +
            '    end V_COLOR\n' +
            'FROM RESULTS\n' +
            'WHERE \n' +
            '    (SELECT COUNT(*) FROM tmwin.MESSAGE_RETURN_PENDING x WHERE CREATED_ON_DEVICE BETWEEN CURRENT DATE AND CURRENT DATE + 1 DAYS AND STATUS IN (\'P\',\'M\') with UR) > 15 OR \n' +
            '    (SELECT COUNT(*) FROM tmwin.MESSAGE_FORWARD x WHERE x.CREATED >= CURRENT DATE AND STATUS = \'NS\' with UR) > 15\n' +
            'GROUP BY MSG_DIRECTION, STATUS, DELAY\n' +
            'WITH UR \n' +
            'FOR READ ONLY'


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

function extractJson(data){
    // for (i = 0; i< data.length; i++){
        //console.log('Row ' + i + '  ' + JSON.stringify(data[i]))
        // {name: 'Overall', data: {'4/5/2018 2:19:05 PM': 40.13, '4/5/2018 2:33:01 PM': 40.11, '4/5/2018 11:59:04 PM': 39.83}},
        // var overall []
       // var period []

        // if ( data[i].indexOf('Overall') > 0 ) {
        //
        // }
    console.log(data)
    return data
    // }
}
