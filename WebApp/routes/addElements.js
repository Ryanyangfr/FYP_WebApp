var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var bodyParser = require('body-parser');

var databaseConfig = require('../config/mysqlconf.js');

var conn = mysql.createConnection(databaseConfig);

router.post('/addHotspot', function(req,res){
    var hotspotName = req.body.hotspot_name;
    var latitude = req.body.latitude;
    var longtitude = req.body.longtitude;
    var narrative_id = req.body.narrative_id;

    var query = 'INSERT INTO HOTSPOT VALUES (?,?,?,?)';

    conn.query(query,[hotspotName,latitude,longtitude,narrative_id], function(err, query){
        if(err){
            console.log(err);
        }else{
            res.end({success: true});
        }
    })
})

module.exports=router;


