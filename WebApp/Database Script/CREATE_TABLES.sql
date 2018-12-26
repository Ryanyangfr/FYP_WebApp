CREATE DATABASE IF NOT EXISTS Engaging_U; 
USE Engaging_U;

CREATE TABLE REMINDER
(
REMINDER_ID INT NOT NULL,
TIME_LEFT INT NOT NULL,
REMINDER_TEXT VARCHAR(100) NOT NULL,
CONSTRAINT REMINDER_PK PRIMARY KEY (REMINDER_ID)
);

CREATE TABLE TRAIL
(
TRAIL_ID INT NOT NULL,
TOTAL_TIME INT NOT NULL,
CONSTRAINT TRAIL_PK PRIMARY KEY (TRAIL_ID)
);

CREATE TABLE TRAIL_REMINDERS
(
TRAIL_ID INT NOT NULL,
REMINDER_ID INT NOT NULL,
CONSTRAINT TRAIL_REMINDERS_PK PRIMARY KEY (TRAIL_ID, REMINDER_ID)
);

CREATE TABLE TRAIL_INSTANCE
(
TRAIL_INSTANCE_ID VARCHAR(10) NOT NULL,
TRAIL_ID INT NOT NULL,
ISACTIVE TINYINT NOT NULL,
HASSTARTED TINYINT NOT NULL,
CONSTRAINT TRAIL_INSTANCE_PK PRIMARY KEY (TRAIL_INSTANCE_ID),
CONSTRAINT TRAIL_INSTANCE_FK1 FOREIGN KEY (TRAIL_ID)
REFERENCES TRAIL(TRAIL_ID) 
);

CREATE TABLE FEEDBACK_QUESTION
(
FEEDBACK_QUESTION_ID INT NOT NULL,
FEEDBACK_QUESTION VARCHAR(100) NOT NULL,
CONSTRAINT FEEDBACK_PK PRIMARY KEY (FEEDBACK_QUESTION_ID)
);

CREATE TABLE FEEDBACK_SUBMISSION
(
FEEDBACK_SUBMISSION_ID INT NOT NULL,
FEEDBACK_ANSWER VARCHAR(100) NOT NULL,
FEEDBACK_QUESTION_ID INT NOT NULL,
TRAIL_INSTANCE_ID VARCHAR(10) NOT NULL,
CONSTRAINT FEEDBACK_SUBMISSION_PK PRIMARY KEY (FEEDBACK_SUBMISSION_ID),
CONSTRAINT FEEDBACK_SUBMISSION_FK1 FOREIGN KEY (FEEDBACK_QUESTION_ID)
REFERENCES FEEDBACK_QUESTION(FEEDBACK_QUESTION_ID),
CONSTRAINT FEEDBACK_SUBMISSION_FK2 FOREIGN KEY (TRAIL_INSTANCE_ID)
REFERENCES TRAIL_INSTANCE(TRAIL_INSTANCE_ID)
);

CREATE TABLE TEAM
(
TEAM_ID INT NOT NULL,
TEAM_POINTS INT NOT NULL,
TRAIL_INSTANCE_ID VARCHAR(10) NOT NULL,
CONSTRAINT TEAM_PK PRIMARY KEY (TEAM_ID, TRAIL_INSTANCE_ID),
CONSTRAINT TEAM_FK1 FOREIGN KEY (TRAIL_INSTANCE_ID)
REFERENCES TRAIL_INSTANCE(TRAIL_INSTANCE_ID)
);

CREATE TABLE PARTICIPANT
(
USER_ID INT NOT NULL,
USERNAME VARCHAR(100) NOT NULL,
TEAM_ID INT NOT NULL,
isLeader TINYINT NOT NULL,
CONSTRAINT PARTICIPANT_PK PRIMARY KEY (USER_ID),
CONSTRAINT PARTICIPANT_FK1 FOREIGN KEY (TEAM_ID)
REFERENCES TEAM(TEAM_ID)
);

CREATE TABLE NARRATIVE
(
NARRATIVE_ID INT NOT NULL,
NARRATIVE_TITLE VARCHAR(100) NOT NULL,
NARRATIVE VARCHAR(1000) NOT NULL,
CONSTRAINT NARRATIVE_PK PRIMARY KEY (NARRATIVE_ID)
);

CREATE TABLE HOTSPOT
(
HOTSPOT_NAME VARCHAR(50) NOT NULL,
LATITUDE VARCHAR(20) NOT NULL,
LONGTITUDE VARCHAR(20) NOT NULL,
NARRATIVE_ID INT NOT NULL,
CONSTRAINT HOTSPOT_PK PRIMARY KEY (HOTSPOT_NAME),
CONSTRAINT HOTSPOT_FK2 FOREIGN KEY (NARRATIVE_ID)
REFERENCES NARRATIVE(NARRATIVE_ID)
);

CREATE TABLE TRAIL_HOTSPOT
(
TRAIL_ID INT NOT NULL,
HOTSPOT_NAME VARCHAR(50) NOT NULL,
CONSTRAINT TRAIL_HOTSPOT_PK PRIMARY KEY (TRAIL_ID, HOTSPOT_NAME),
CONSTRAINT TRAIL_HOTSPOT_FK1 FOREIGN KEY (TRAIL_ID)
REFERENCES TRAIL(TRAIL_ID),
CONSTRAINT TRAIL_HOTSPOT_FK2 FOREIGN KEY (HOTSPOT_NAME)
REFERENCES HOTSPOT(HOTSPOT_NAME)
);

CREATE TABLE MISSION
(
MISSION_ID INT NOT NULL,
HOTSPOT_NAME VARCHAR(50) NOT NULL,
CONSTRAINT MISSION_PK PRIMARY KEY (MISSION_ID),
CONSTRAINT MISSION_FK1 FOREIGN KEY (HOTSPOT_NAME)
REFERENCES HOTSPOT(HOTSPOT_NAME)
);

CREATE TABLE TRAIL_MISSION
(
TRAIL_ID INT NOT NULL,
MISSION_ID INT NOT NULL,
CONSTRAINT TRAIL_MISSION_PK PRIMARY KEY (TRAIL_ID,MISSION_ID),
CONSTRAINT TRAIL_MISSION_FK1 FOREIGN KEY (TRAIL_ID)
REFERENCES TRAIL(TRAIL_ID),
CONSTRAINT TRAIL_MISSION_FK2 FOREIGN KEY (MISSION_ID)
REFERENCES MISSION(MISSION_ID)
);

CREATE TABLE QUIZ
(
QUIZ_ID INT NOT NULL,
QUIZ_QUESTION VARCHAR(1000) NOT NULL,
QUIZ_ANSWER VARCHAR(1000) NOT NULL,
MISSION_ID INT NOT NULL,
CONSTRAINT QUIZ_PK PRIMARY KEY (QUIZ_ID),
CONSTRAINT QUIZ_FK1 FOREIGN KEY (MISSION_ID)
REFERENCES MISSION(MISSION_ID)
);

CREATE TABLE QUIZ_OPTION
(
QUIZ_ID INT NOT NULL,
QUIZ_OPTION_ID INT NOT NULL,
QUIZ_OPTION VARCHAR(1000) NOT NULL,
CONSTRAINT QUIZ_OPTION_PK PRIMARY KEY (QUIZ_ID, QUIZ_OPTION_ID),
CONSTRAINT QUIZ_OPTION_FK1 FOREIGN KEY (QUIZ_ID)
REFERENCES QUIZ(QUIZ_ID)
);

CREATE TABLE SUBMISSION_QUESTION
(
QUESTION_ID INT NOT NULL,
QUESTION VARCHAR(1000) NOT NULL,
MISSION_ID INT NOT NULL,
CONSTRAINT SUBMISSION_QUESTION_PK PRIMARY KEY (QUESTION_ID),
CONSTRAINT SUBMISSION_QUESTION_FK FOREIGN KEY (MISSION_ID)
REFERENCES MISSION(MISSION_ID)
);

CREATE TABLE SUBMISSION
(SUBMISSION_ID INT NOT NULL,
SUBMISSION_IMAGE_URL VARCHAR(100) NOT NULL,
TEAM_ID INT NOT NULL,
TRAIL_INSTANCE_ID VARCHAR(10) NOT NULL,
QUESTION_ID INT NOT NULL,
CONSTRAINT SUBMISSION_PK PRIMARY KEY (SUBMISSION_ID),
CONSTRAINT SUBMISSION_FK1 FOREIGN KEY (TEAM_ID)
REFERENCES TEAM(TEAM_ID),
CONSTRAINT SUBMISSION_FK2 FOREIGN KEY (QUESTION_ID)
REFERENCES SUBMISSION_QUESTION(QUESTION_ID),
CONSTRAINT SUBMISSION_FK3 FOREIGN KEY (TRAIL_INSTANCE_ID)
REFERENCES TRAIL_INSTANCE(TRAIL_INSTANCE_ID)
);

CREATE TABLE TEAM_HOTSPOT_STATUS
(
HOTSPOT_NAME VARCHAR(50) NOT NULL,
TRAIL_INSTANCE_ID VARCHAR(10) NOT NULL,
TEAM_ID INT NOT NULL,
ISCOMPLETED TINYINT NOT NULL,
CONSTRAINT TEAM_HOTSPOT_STATUS_PK PRIMARY KEY (HOTSPOT_NAME, TRAIL_INSTANCE_ID, TEAM_ID),
CONSTRAINT TEAM_HOTSPOT_STATUS_FK1 FOREIGN KEY (HOTSPOT_NAME)
REFERENCES HOTSPOT(HOTSPOT_NAME),
CONSTRAINT TEAM_HOTSPOT_STATUS_FK2 FOREIGN KEY (TRAIL_INSTANCE_ID)
REFERENCES TEAM(TRAIL_INSTANCE_ID),
CONSTRAINT TEAM_HOTSPOT_STATUS_FK3 FOREIGN KEY (TEAM_ID)
REFERENCES TEAM(TEAM_ID)
);

CREATE TABLE ADMIN
(
USERNAME VARCHAR(50) NOT NULL,
USER_PASSWORD VARCHAR(50) NOT NULL,
CONSTRAINT ADMIN_PK PRIMARY KEY (USERNAME)
);

CREATE TABLE MULTIMEDIA
(
MULTIMEDIA_ID INT NOT NULL,
MULTIMEDIA_URL VARCHAR(50) NOT NULL,
CONSTRAINT MULTIMEDIA_PK PRIMARY KEY (MULTIMEDIA_ID)
);

CREATE TABLE DRAG_AND_DROP
(
DRAGANDDROP_ID INT NOT NULL,
DRAGANDDROP_QUESTION VARCHAR(1000) NOT NULL,
DRAGANDDROP_ANSWER VARCHAR(1000) NOT NULL,
MISSION_ID INT NOT NULL,
CONSTRAINT DRAGANDDROP_PK PRIMARY KEY (DRAGANDDROP_ID),
CONSTRAINT DRAGANDDROP_FK1 FOREIGN KEY (MISSION_ID)
REFERENCES MISSION(MISSION_ID)
);