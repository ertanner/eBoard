 var ibmdb = require("ibm_db"),

retrieveCustomers(callback){
    var customers = [];
    console.log("Opening DB2 connection");

    var connString = "DRIVER={DB2};"
        + "DATABASE=" + config.database_name + ";"
        + "UID=" + config.database_user + ";"
        + "PWD=" + config.database_password + ";"
        + "HOSTNAME=" + config.database_host + ";"
        + "port=" + config.database_port;

    console.log("DB2 connection string: " + connString);

    ibmdb.open(connString, function(err, conn) {
        if(err) {
            console.log("DB2 connection error: ", err.message);
            callback();
        } else {
            conn.query("\"select dteail_line_item from tmwin.tlorder where detail_line_item = 40430622\"",
                function(err, customerRows, moreResultSets) {
                if(err) {
                    console.log("DB2 query failed: ", err.message);
                } else {
                    for(var i = 0; i< customerRows.length; i++) {
                        customers.push(
                            new module.exports.Customer(
                                customerRows[i].CID,
                                customerRows[i].FIRST_NAME,
                                customerRows[i].LAST_NAME));
                    }

                    if(typeof callback === "function") {
                        callback(customers);
                    }
                }
            });

            conn.close(function(){
                console.log("DB2 connection Closed");
            });
        }
    });
}