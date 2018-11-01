var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var bodyParser = require('body-parser');

var databaseConfig = require('../config/mysqlconf.js')

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
var conn = mysql.createConnection(databaseConfig);

router.post('/updateScore', function(req,res){
    var team_id = req.body.team_id;
    var instance_id = req.body.trail_instance_id;
    var update = parseInt(req.body.score);
    
    console.log('team_id: ' + team_id);
    console.log('instance_id: ' + instance_id);
    console.log('score: ' + update);

    var query = 'SELECT TEAM_POINTS FROM TEAM WHERE TEAM_ID = ? AND TRAIL_INSTANCE_ID = ?';

    conn.query(query, [team_id, instance_id], function(err, team){
        if (err){
            console.log(err)
        } else{
            var points = team[0].TEAM_POINTS + update;
            console.log('points: ' + points)
            queryUpdate = 'UPDATE TEAM SET TEAM_POINTS = ? WHERE TEAM_ID = ? AND TRAIL_INSTANCE_ID = ?';

            conn.query(queryUpdate, [points, team_id, instance_id], function(err, data){
                if (err){
                    console.log(err);
                } else{
                    res.send('update successful');
                }
            })
        }
    })
})

module.exports = router;