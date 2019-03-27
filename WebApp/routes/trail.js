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
      if (data[0] === undefined) {
        res.send([]);
        return;
      }
      let temp = [];
      let currTrailID = data[0].TRAIL_ID;
      let currTrailTitle = data[0].TITLE;
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
});

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
        console.log(hotspotAndMission);
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
  console.log(req.body);
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
            console.log(hotspotAndMission);
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
  const trailID = req.body.trailID;
  const trailInstanceID = req.body.trailInstanceID;
  const numTeams = req.body.numTeams;
  const date = req.body.date;
  let hasErr = false;

  console.log('number of teams: ' + numTeams);
  console.log(trailID);
  console.log('initialize trail');
  const query = 'INSERT INTO TRAIL_INSTANCE VALUES (?,?,?,?,?)';

  const checkIfAnyActiveTrailQuery = 'SELECT * FROM TRAIL_INSTANCE WHERE ISACTIVE = 1 OR HASSTARTED = 1';

  conn.query(checkIfAnyActiveTrailQuery, (err, data) => {
    if (err) {
      hasErr = true;
      console.log(err);
    } else {
      const updateQuery = 'UPDATE TRAIL_INSTANCE SET ISACTIVE = 0, HASSTARTED = 0 WHERE TRAIL_ID = ? AND TRAIL_INSTANCE_ID = ?';
      data.forEach((row) => {
        const activatedTrailID = row.TRAIL_ID;
        const activatedTrailInstanceID = row.TRAIL_INSTANCE_ID;
        conn.query(updateQuery, [activatedTrailID, activatedTrailInstanceID], (err, data) => {
          if (err) {
            console.log(err);
          }
        });
      });

      conn.query(query, [trailInstanceID, trailID, 1, 0, date], (err, data) => {
        if (err) {
          console.log(err);
          res.send(JSON.stringify({ success: 'false' }));
        } else {
          const updateTeamQuery = 'INSERT INTO TEAM VALUES (?,?,?,?,?,?)';

          for (let teamID = 0; teamID < numTeams; teamID++) {
            console.log('team: ' + teamID);
            conn.query(updateTeamQuery, [teamID + 1, 0, '1.268', '103.8522', '', trailInstanceID], (err, data) => {
              if (err) {
                console.log(err);
                hasErr = true;
                res.send(JSON.stringify({ success: 'false' }));
              } else if (teamID === numTeams - 1) {
                // res.send(JSON.stringify({ success: 'true' }));
              }
            });
          }

          const updateTeamHotspotStatusQuery = 'INSERT INTO TEAM_HOTSPOT_STATUS VALUES(?,?,?,?,?)';
          const retrieveHotspotsInTrail = 'SELECT HOTSPOT_NAME FROM TRAIL_HOTSPOT WHERE TRAIL_ID = ?';

          // retrieve all hotspots in trail
          conn.query(retrieveHotspotsInTrail, trailID, (err, hotspots) => {
            if (err) {
              console.log(err);
            } else {
              hotspots.forEach((hotspot) => {
                for (let teamID = 0; teamID < numTeams; teamID++) {
                  conn.query(updateTeamHotspotStatusQuery, [hotspot.HOTSPOT_NAME, trailInstanceID, teamID + 1, 0, null], (err, data) => {
                    if (err) {
                      console.log(err);
                    } else if(hotspot.HOTSPOT_NAME === hotspots[hotspots.length - 1].HOTSPOT_NAME && teamID === numTeams - 1 && hasErr != true) {
                      res.send(JSON.stringify({ success: 'true' }));
                    }
                  });
                }
              });
            }
          });
        }
      });
    }
  });
});

router.post('/startTrail', (req, res) => {
  const trailID = req.body.trailID;
  const trailInstanceID = req.body.trailInstanceID;

  const io = req.app.get('socketio');

  const insertMissionHistoryQuery = 'INSERT INTO MISSION_HISTORY VALUES (?,?)';

  const query = 'UPDATE TRAIL_INSTANCE SET HASSTARTED = 1 WHERE TRAIL_INSTANCE_ID = ? AND TRAIL_ID = ?';

  conn.query('SELECT COUNT(*) AS COUNT FROM MISSION_HISTORY', (err, data1) => {
    if (err) {
      console.log(err);
    } else {
      let missionID = data1[0].COUNT + 1;
      missionID = duplicateMission(trailInstanceID, missionID, insertMissionHistoryQuery);
      
    }
  });


  conn.query(query, [trailInstanceID, trailID], (err, data) => {
    if (err) {
      console.log(err);
      res.send(JSON.stringify({ success: 'false' }));
    } else {
      io.emit('startTrail', { trail_instance_id: trailInstanceID });
      res.send(JSON.stringify({ success: 'true' }));
    }
  });
});

/** *********************************************************** methods **************************************************************************** */

// does anagram duplication first
function duplicateMission(trailInstanceID, missionID, insertMissionHistoryQuery) {
  const anagramQuery = 'SELECT HOTSPOT_NAME, MISSION.MISSION_ID, MISSION_TITLE, ANAGRAM_ID, ANAGRAM_WORD FROM TRAIL_HOTSPOT,MISSION,ANAGRAM WHERE TRAIL_ID = (SELECT TRAIL_ID FROM TRAIL_INSTANCE WHERE TRAIL_INSTANCE_ID = ?) AND MISSION.MISSION_ID = TRAIL_HOTSPOT.MISSION_ID AND ANAGRAM.MISSION_ID = MISSION.MISSION_ID';
  const anagramHistoryInsertQuery = 'INSERT INTO ANAGRAM_HISTORY VALUES (?,?,?)';
  const summaryTableIDQuery = 'SELECT COUNT(*) AS COUNT FROM SUMMARY_TABLE';
  let numberOfiterations = 0;
  let summaryID = 0;

  conn.query('SELECT COUNT(*) as count FROM ANAGRAM_HISTORY', (err, data1) => {
    if (err) {
      console.log(err);
    } else {
      const anagramHistoryID = data1[0].count + 1;
      conn.query(anagramQuery, trailInstanceID, (err, data2) => {
        if (err) {
          console.log(err);
        } else {
          data2.forEach((row) => {
            numberOfiterations += 1;
            const hotspot = row.HOTSPOT_NAME;
            const title = row.MISSION_TITLE;
            const word = row.ANAGRAM_WORD;

            conn.query(insertMissionHistoryQuery, [missionID, title], (err,result) => {
              if (err) {
                console.log(err);
              } else {
                conn.query(anagramHistoryInsertQuery, [anagramHistoryID, word, missionID], (err, result2) => {
                  if (err) {
                    console.log(err);
                  }
                });
                conn.query(summaryTableIDQuery, (err, result3) => {
                  if (err) {
                    console.log(err);
                  } else {
                    summaryID = result3[0].COUNT + 1;
                    conn.query('INSERT INTO SUMMARY_TABLE VALUES (?,?,?,?)', [summaryID, trailInstanceID, hotspot, missionID], (err, result4) => {
                      if (err) {
                        console.log(err);
                      }
                    });
                  }
                });
                // missionID += 1;
                console.log(data2.length);
                console.log(numberOfiterations);
                if (numberOfiterations === data2.length) {
                  duplicateQuiz(trailInstanceID, missionID, insertMissionHistoryQuery, summaryID + 1);
                }
              }
            });
          });
        }
      });
    }
  });
}

function duplicateQuiz(trailInstanceID, missionHistoryID, insertMissionHistoryQuery, summaryID) {
  const quizQuery = 'SELECT HOTSPOT_NAME, MISSION.MISSION_ID, MISSION_TITLE, QUIZ.QUIZ_ID, QUIZ_QUESTION, QUIZ_ANSWER,  QUIZ_OPTION  FROM TRAIL_HOTSPOT,MISSION,QUIZ,QUIZ_OPTION WHERE TRAIL_ID = (SELECT TRAIL_ID FROM TRAIL_INSTANCE WHERE TRAIL_INSTANCE_ID = ?) AND MISSION.MISSION_ID = TRAIL_HOTSPOT.MISSION_ID AND QUIZ.MISSION_ID = MISSION.MISSION_ID AND QUIZ.QUIZ_ID = QUIZ_OPTION.QUIZ_ID';
  const numQuizHistoryQuery = 'SELECT COUNT(*) AS COUNT FROM QUIZ_HISTORY';
  const numQuizOptionHistoryQuery = 'SELECT COUNT(*) AS COUNT FROM QUIZ_OPTION_HISTORY';
  const quizQuestionHistoryInsertQuery = 'INSERT INTO QUIZ_HISTORY VALUES (?,?,?,?)';
  const quizOptionHistoryInsertQuery = 'INSERT INTO QUIZ_OPTION_HISTORY VALUES (?,?,?)';
  const summaryTableIDQuery = 'SELECT COUNT(*) AS COUNT FROM SUMMARY_TABLE';

  conn.query(numQuizHistoryQuery, (err, result1) => {
    if (err) {
      console.log(err);
    } else {
      let numQuiz = result1[0].COUNT;
      
      conn.query(numQuizOptionHistoryQuery, (err, result2) => {
        if (err) {
          console.log(err);
        } else {
          let numQuizOption = result2[0].COUNT;

          conn.query(quizQuery, trailInstanceID, (err, result3) => {
            if (err) {
              console.log(err);
            } else {
              const rows = result3;
              console.log(rows[0])
              // let currQuizID = result3[0].QUIZ_ID;
              let currMissionID = -1;
              let rowIndex = -1;

              result3.forEach((row) => {
                rowIndex += 1;
                console.log(`row index top: ${rowIndex}`)
                if (rowIndex % 4 == 0) {
                  // console.log(row);
                  const hotspot = row.HOTSPOT_NAME;
                  const missionID = row.MISSION_ID;
                  const title = row.MISSION_TITLE;
                  const quizID = row.QUIZ_ID;
                  const quizOption = row.QUIZ_OPTION;
                  const quizQuestion = row.QUIZ_QUESTION;
                  const quizAnswer = row.QUIZ_ANSWER;

                  if (currMissionID != missionID) {
                    missionHistoryID += 1;
                    currMissionID = missionID;
                    
                    conn.query(insertMissionHistoryQuery, [missionHistoryID, title], (err, result4) => {
                      if (err) {
                        console.log(err);
                      } else {
                        summaryID += 1;
                        console.log(`summary id: ${summaryID}`);
                        conn.query(summaryTableIDQuery, (err, result3) => {
                          if (err) {
                            console.log(err);
                          } else {
                            summaryID = result3[0].COUNT + 1;
                            conn.query('INSERT INTO SUMMARY_TABLE VALUES (?,?,?,?)', [summaryID, trailInstanceID, hotspot, missionID], (err, result4) => {
                              if (err) {
                                console.log(err);
                              }
                            });
                          }
                        });

                        // currQuizID = quizID;
                        // console.log(`curr quiz id: ${currQuizID}`);
                        numQuiz += 1;
                        conn.query(quizQuestionHistoryInsertQuery, [numQuiz, quizQuestion, quizAnswer, missionHistoryID], (err, result5) => {
                          if (err) {
                            console.log(err);
                          } else {
                            numQuizOption += 1;
                            console.log(`row index: ${rowIndex}`);
                            conn.query(quizOptionHistoryInsertQuery, [numQuiz, numQuizOption, rows[rowIndex].QUIZ_OPTION], (err, results6) => {
                              if (err) {
                                console.log(err);
                              } else {
                                console.log(`1: ${quizOption}`);
                              }
                            });

                            numQuizOption += 1;
                            conn.query(quizOptionHistoryInsertQuery, [numQuiz, numQuizOption, rows[rowIndex + 1].QUIZ_OPTION], (err, results6) => {
                              if (err) {
                                console.log(err);
                              } else {
                                console.log(`1: ${quizOption}`);
                              }
                            });

                            numQuizOption += 1;
                            conn.query(quizOptionHistoryInsertQuery, [numQuiz, numQuizOption, rows[rowIndex + 2].QUIZ_OPTION], (err, results6) => {
                              if (err) {
                                console.log(err);
                              } else {
                                console.log(`1: ${quizOption}`);
                              }
                            });

                            numQuizOption += 1;
                            conn.query(quizOptionHistoryInsertQuery, [numQuiz, numQuizOption, rows[rowIndex + 3].QUIZ_OPTION], (err, results6) => {
                              if (err) {
                                console.log(err);
                              } else {
                                console.log(`1: ${quizOption}`);
                              }
                            });

                          }
                        });
                      }

                    });
                  }
                }
              });

            }
          });
        }
      });
    }
  });
}

module.exports = router;
