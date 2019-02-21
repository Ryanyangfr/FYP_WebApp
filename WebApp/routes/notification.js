const express = require('express');

const router = express.Router();
const mysql = require('mysql');
const bodyParser = require('body-parser');

const databaseConfig = require('../config/mysqlconf.js');

const conn = mysql.createConnection(databaseConfig);

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.get('/sendNotification', (req,res) => {
  const io = req.app.get('socketio');
  const message = req.query.message;
  console.log(message)

  io.emit('notification', {message});
});