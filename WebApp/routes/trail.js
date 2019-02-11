const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const databaseConfig = require('../config/mysqlconf.js');

const router = express.Router();

const conn = mysql.createConnection(databaseConfig);

router.use(bodyParser.json()); // support json encoded bodies
router.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

let trailID = 0;

conn.query('SELECT COUNT(*) AS COUNT FROM TRAIL', (err, num) => {
  if (err) {
    console.log(err);
  } else {
    trailID = num[0].COUNT;
  }
});

router.get('/getAllTrails', (req, res) => {
  const response = [];
  const query = 'SELECT TRAIL.TRAIL_ID, TRAIL_HOTSPOT.NARRATIVE_ID, NARRATIVE_TITLE, HOTSPOT_NAME, TITLE, TOTAL_TIME, MISSION_TITLE, TRAIL_HOTSPOT.MISSION_ID FROM TRAIL_HOTSPOT, TRAIL, MISSION, NARRATIVE WHERE TRAIL_HOTSPOT.TRAIL_ID = TRAIL.TRAIL_ID AND MISSION.MISSION_ID = TRAIL_HOTSPOT.MISSION_ID AND NARRATIVE.NARRATIVE_ID = TRAIL_HOTSPOT.NARRATIVE_ID ORDER BY TRAIL.TRAIL_ID';

  conn.query(query, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      let temp = [];
      let currTrailID = data[0].TRAIL_ID;
      let currTrailTitle = data[0].TITLE
      let currTrailTotalTime = data[0].TOTAL_TIME;
      data.forEach((row) => {
        console.log(row.TRAIL_ID === currTrailID);
        if (row.TRAIL_ID === currTrailID) {
          temp.push({ hotspot: row.HOTSPOT_NAME, mission: row.MISSION_ID, missionTitle: row.MISSION_TITLE, narrativeTitle: row.NARRATIVE_TITLE, narrativeID: row.NARRATIVE_ID, missionType: '', missionList: [] });
        } else {
          console.log(temp);
          response.push({ trailID: currTrailID, title: currTrailTitle, totalTime: currTrailTotalTime, hotspotsAndMissions: temp });
          temp = [];
          temp.push({ hotspot: row.HOTSPOT_NAME, mission: row.MISSION_ID, missionTitle: row.MISSION_TITLE, narrativeTitle: row.NARRATIVE_TITLE, narrativeID: row.NARRATIVE_ID, missionType: '', missionList: [] });
          currTrailID = row.TRAIL_ID;
          currTrailTitle = row.TITLE;
          currTrailTotalTime = row.TOTAL_TIME;
        }
      });
      response.push({ trailID: currTrailID, title: currTrailTitle, totalTime: currTrailTotalTime, hotspotsAndMissions: temp });
      console.log(response);
      res.send(response);
    }
  });
})

router.post('/addTrail', (req, res) => {
  trailID += 1;
  const trailTitle = req.body.title;
  const totalTime = req.body.totalTime;
  const hotspotsAndMissions = req.body.hotspotsAndMissions;
  // const missions = req.body.missions;
  // const narrativeID = req.body.narrativeID;

  let hotspotCount = 0;
  const missionCount = 0;
  console.log(req.body);

  const trailCreationQuery = 'INSERT INTO TRAIL VALUES (?,?,?)';

  conn.query(trailCreationQuery, [trailID, trailTitle, totalTime], (err, data) => {
    if (err) {
      console.log(err);
    } else {
      const trailHotspotsCreationQuery = 'INSERT INTO TRAIL_HOTSPOT VALUES (?,?,?,?)';
      
      hotspotsAndMissions.forEach((hotspotAndMission) => {
        console.log(hotspotAndMission)
        conn.query(trailHotspotsCreationQuery, [trailID, hotspotAndMission.hotspot, hotspotAndMission.narrative, hotspotAndMission.mission], (err, result) => {
          if (err) {
            res.send(JSON.stringify({ success: 'false' }));
            console.log(err);
          } else {
            if (hotspotCount === hotspotsAndMissions.length - 1) {
              res.send(JSON.stringify({ success: 'true' }));
            } else {
              hotspotCount += 1;
            }
            // res.send(JSON.stringify({ success: 'true' }));
          }
        });
      });

      // const trailMissionsCreationQuery = 'INSERT INTO TRAIL_MISSION VALUES (?,?)';

      // missions.forEach((mission) => {
      //   conn.query(trailMissionsCreationQuery, [trailID, mission], (err, result) => {
      //     if (err) {
      //       res.send(JSON.stringify({ success: 'false' }));
      //       console.log(err);
      //        return;
      //     } else {
      //       if (missionCount === missions.length - 1 && hotspotCount === hotspots.length) {
      //         res.send(JSON.stringify({ success: 'true' }));
      //       } else {
      //         missionCount += 1;
      //       }
      //       // res.send(JSON.stringify({ success: 'true' }));
      //     }
      //   })
      // });
    }
  });
});

router.post('/editTrail', (req, res) => {
  console.log(req.body)
  const trailID = req.body.trailID;
  const trailTitle = req.body.title;
  const totalTime = req.body.totalTime;
  const hotspotsAndMissions = req.body.hotspotsAndMissions;

  let rowCount = 0;
  const updateTrailQuery = 'UPDATE TRAIL SET TITLE = ?, TOTAL_TIME = ? WHERE TRAIL_ID = ?';

  conn.query(updateTrailQuery, [trailTitle, totalTime, trailID], (err, data) => {
    if (err) {
      console.log(err);
      res.send(JSON.stringify({ success: 'false' }));
    } else {
      const trailHotspotDeleteQuery = 'DELETE FROM TRAIL_HOTSPOT WHERE TRAIL_ID = ?';
      conn.query(trailHotspotDeleteQuery, trailID, (err, reply) => {
        if (err) {
          console.log(err);
          res.send(JSON.stringify({ success: 'false' }));
        } else {
          const trailHotspotsCreationQuery = 'INSERT INTO TRAIL_HOTSPOT VALUES (?,?,?,?)';
          hotspotsAndMissions.forEach((hotspotAndMission) => {
            console.log(hotspotAndMission)
            conn.query(trailHotspotsCreationQuery, [trailID, hotspotAndMission.hotspot, hotspotAndMission.narrative, hotspotAndMission.mission], (err, result) => {
              if (err) {
                res.send(JSON.stringify({ success: 'false' }));
                console.log(err);
              } else {
                if (rowCount === hotspotsAndMissions.length - 1) {
                  res.send(JSON.stringify({ success: 'true' }));
                } else {
                  rowCount += 1;
                }
                // res.send(JSON.stringify({ success: 'true' }));
              }
            });
          });
        }
      });
    }
  });
});

router.post('/initializeTrail', (req, res) => {
  const trailID = req.body.trailID
  const trailInstanceID = req.body.trailInstanceID;
  const numTeams = req.body.numTeams;
  let hasErr = false;

  console.log(trailID);
  console.log('initialize trail')
  const query = 'INSERT INTO TRAIL_INSTANCE VALUES (?,?,?,?)'

  const checkIfAnyActiveTrailQuery = 'SELECT * FROM TRAIL_INSTANCE WHERE ISACTIVE = 1 OR HASSTARTED = 1';

  conn.query(checkIfAnyActiveTrailQuery, (err, data) => {
    if (err) {
      hasErr = true;
      console.log(err)
    } else {
      const updateQuery = 'UPDATE TRAIL_INSTANCE SET ISACTIVE = 0, HASSTARTED = 0 WHERE TRAIL_ID = ? AND TRAIL_INSTANCE_ID = ?';
      data.forEach((row) => {
        const activatedTrailID = row.TRAIL_ID;
        const activatedTrailInstanceID = row.TRAIL_INSTANCE_ID;
        conn.query(updateQuery, [activatedTrailID, activatedTrailInstanceID], (err, data) => {
          if (err) {
            console.log(err)
          }
        });
      });

      conn.query(query, [trailInstanceID, trailID, 1, 0], (err, data) => {
        if (err) {
          console.log(err)
          res.send(JSON.stringify({ success: 'false' }));
        } else {
          const updateTeamQuery = 'INSERT INTO TEAM VALUES (?,?,?,?,?)';

          for (let teamID = 0; teamID < numTeams; teamID++) {
            conn.query(updateTeamQuery, [teamID + 1, 0, '1.268', '103.8522', trailInstanceID], (err, data) => {
              if (err) {
                console.log(err)
                hasErr = true;
                res.send(JSON.stringify({ success: 'false' }));
              } else {
                if (teamID === numTeams-1) {
                  // res.send(JSON.stringify({ success: 'true' }));
                }
              }
            });
          }

          const updateTeamHotspotStatusQuery = 'INSERT INTO TEAM_HOTSPOT_STATUS VALUES(?,?,?,?)';
          const retrieveHotspotsInTrail = 'SELECT HOTSPOT_NAME FROM TRAIL_HOTSPOT WHERE TRAIL_ID = ?';

          //retrieve all hotspots in trail
          conn.query(retrieveHotspotsInTrail, trailID, (err, hotspots) => {
            if (err) {
              console.log(err)
            } else {
              hotspots.forEach((hotspot) => {
                for (let teamID=0; teamID<numTeams; teamID++) {
                  conn.query(updateTeamHotspotStatusQuery, [hotspot.HOTSPOT_NAME, trailInstanceID, teamID+1, 0], (err, data) => {
                    if (err) {
                      console.log(err);
                    } else {
                      if(hotspot.HOTSPOT_NAME === hotspots[hotspots.length-1].HOTSPOT_NAME && teamID === numTeams-1 && hasErr != true){
                        res.send(JSON.stringify({ success: 'true' }));
                      }
                    }
                  })
                }
              })
            }
          })
        }
      });
    }
  });
});

router.post('/startTrail', (req, res) => {
  const trailID = req.body.trailID;
  const trailInstanceID = req.body.trailInstanceID;

  const io = req.app.get('socketio');

  const query = 'UPDATE TRAIL_INSTANCE SET HASSTARTED = 1 WHERE TRAIL_INSTANCE_ID = ? AND TRAIL_ID = ?';

  conn.query(query, [trailInstanceID, trailID], (err, data) => {
    if (err) {
      console.log(err)
      res.send(JSON.stringify({ success: 'false' }));
    } else {
      io.emit('startTrail', { trail_instance_id: trailInstanceID });
      res.send(JSON.stringify({ success: 'true' }));
    }
  });
})
module.exports = router;
