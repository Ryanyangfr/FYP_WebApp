//Shows leaderboard and activity feed for ongoing trail 
<template>
    <div class="Leaderboard">
        <div class="card">
            <div class="card-title">
                <h5>Leaderboard</h5>
                <div class="leaderboard-feed-btns">
                    <button class="leaderboard-btn" @click="showLeaderboard()">Leaderboard</button>
                     <button class ="feed-btn" @click="showFeed()">Activity Feed</button>
                </div>
            </div>
                <form @submit.prevent="getData" class="search-bar">
                    <select placeholder="Select Trail ID" v-model="trail_instance_id">
                        <option v-for="trailID in allTrailInstances" :key="trailID">
                            {{trailID}}
                        </option> 
                    </select> 
                    <button type="submit" class="search-btn"><i class="ti-search"></i></button> 
                </form>

                <table class="leaderboard-table" v-if="isLeaderboard">
                    <tr class="leaderboard-table-header">
                        <td>Position</td>
                        <td>Team</td>
                        <td>Points</td>
                        <td>Hotspots Completed</td>
                        <td>Timing</td>
                        <td>Actions</td>
                    </tr>

                    <tr class = "leaderboard-data" v-for="(item,index) in items" :key="index">
                        <td>{{index+1}}</td>
                        <td class="team-data">Team {{item.team}}</td>
                        <td class="points-data">{{item.points}}</td>
                        <td>{{item.hotspots_completed}}</td>
                        <td><div v-if="item.timeEnded=='0:0:0'"><button class="end-btn" @click="calcEndTime(item)">End</button></div>
                            <div v-else>{{item.timeEnded}} </div></td>
                        <td><button @click="editLeaderboard(item.team,item.points,item.hotspots_completed)" class="edit-leaderboard-btn"><i class="ti-pencil-alt"></i></button></td>
                    </tr>
                </table>

                <table v-if="isFeed" class="feed-table">
                    <tr class = "feed-data" v-for="activity in activityList" :key="activity.timestamp">
                        <td class="activity-data">{{activity.activity}}</td>
                        <td class="timestamp-data">{{activity.timestamp}}</td>
                    </tr>
                </table>
        </div>

        <!--edit leaderboard begins-->
        <div class="black-blur-bg" v-if="showEdit"> 
            <div class="edit-leaderboard-form">
                <div class="edit-leaderboard-header">
                    <h5>Edit leaderboard</h5>
                    <button class="close-edit-leaderboard" @click="closeEdit()"><font-awesome-icon icon="times"/></button>
                </div>
                <hr>
                
                <form class="edit-leaderboard-body" @submit.prevent="onSubmitToEdit">
                    <div class="edit-leaderboard-input">
                        <input type="text" id="team-num-input" v-model="curr_team_num" disabled>
                        <label for="team-num-input">Team</label>
                    </div>
                    <div class="edit-leaderboard-input">
                        <input type="text" id="points-input" v-model="curr_points" required>
                        <label for="points-input">Points to be added</label>
                    </div>
                    <div class="edit-leaderboard-input">
                        <input type="text-area" id="hotspots-input" v-model="curr_hotspots" disabled>
                        <label for="curr_hotspots">Hotspots</label>
                    </div>
                    <div>
                        <button type="submit" class="edit-leaderboard-submit">Save</button>
                    </div>
                </form>
               
            </div>
        </div>
        <!--edit leaderboard ends-->
    </div>
</template>

<script>
import axios from 'axios'
import io from 'socket.io-client';

export default {
    data() {
        return{
            items: [],
            trail_instance_id: '',
            showEdit: false,
            curr_hotspots: 0,
            curr_team_num:0,
            curr_points: 0,
            isLeaderboard: true,
            isFeed: false,
            activityList: [],
            allTrailInstances: [],
            socket : io('wss://amazingtrail.ml', { transports: ['websocket'] })
        }
    },

    computed:{
        trailStartTime(){
            return this.$store.state.trailStartTime;
        }
    },

    methods: {
        //get all the teams and their points
        getData() {
            const baseURI = '//amazingtrail.ml/api/team/getAllTeamPoints?trail_instance_id=' + this.trail_instance_id;
            axios.get(baseURI)
            .then(response => {
                this.items = response.data;

            })
        },

        //show the edit points popup
        editLeaderboard(team_num, points, hotspots_completed){
            if(this.showEdit){
                this.showEdit = false;
            } else{
                this.showEdit = true;
            }

            this.curr_hotspots = hotspots_completed;
            this.curr_team_num = team_num;
            this.currpoints = points;
        },

        //submit edited score for the team
        onSubmitToEdit(){
            var postBody = {
                "team": this.curr_team_num,
                "points": this.curr_points
            }

            axios.post('//amazingtrail.ml/api/team/updateScoreAdmin', postBody)
            .then(response => {
                let data = response.data
                this.$router.go();
               
            })

        },

        //when leaderbaord clicks on leaderboard, shows leaderboard
        //by default, showleaderboard == true
        showLeaderboard(){
            this.isLeaderboard = true;
            this.isFeed = false
        },

        //show activity feed page instead of leaderboard
        showFeed(){
            this.isLeaderboard = false;
            this.isFeed = true
        },

        //close the edit popup 
        closeEdit(){
            if(this.showEdit){
                this.showEdit = false;
            } else{
                this.showEdit = true;
            }

            this.curr_hotspots = "";
            this.curr_team_num = "";
            this.currpoints = "";    
        },

        //calculate the end time of the team then update the db 
        calcEndTime(item) {
            let now = new Date().getTime();
            let time = now - this.$store.state.trailStartTime;
            
             var postBody = {
                "team": item.team,
                "timeEnded": time
            }

            axios.post('//amazingtrail.ml/api/team/updateTeamEndTime', postBody)
            .then(response => {
            });

            item.timeEnded = this.convertTime(time);
        },

        //convert time to hh:mm:ss
        convertTime(time) {
            let hours = Math.floor((time % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            let minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
            let seconds = Math.floor((time % (1000 * 60)) / 1000);
            
            return hours + ":" + minutes + ":" + seconds;
        }
    },
    mounted(){
        if (!this.$session.exists()) {
            this.$router.push('/')
        }

        //on page laod, get the current trail ID 
        axios.get('//amazingtrail.ml/api/getCurrentTrailInstanceID')
        .then(response => {
            let data = response.data;
            for(var row in data){
                this.trail_instance_id  = data[row]
            }
        })

        //get the team's activity 
        axios.get('//amazingtrail.ml/api/team/activityFeed')
        .then(response => {
            let data = response.data;
            for(var row in data){
                let activity = "Team " + data[row].team + " completed their mission at " + data[row].hotspot
                this.activityList.push({activity: activity, timestamp: data[row].time});
            }
        })

        axios.get('//amazingtrail.ml/api/getAllTrailInstances')
        .then(res => {
            let data = res.data;
            this.allTrailInstances = data
        });

        //get team's activity via socket to update activity feed in real time 
        this.socket.on('activityFeed', (data) => {
            let activity = "Team " + data.team + " completed their mission at " + data.hotspot
            this.activityList.unshift({activity: activity, timestamp: data.time});
        })

        const baseURI = '//amazingtrail.ml/api/team/getAllTeamPoints';
        axios.get(baseURI)
        .then(response => {
            this.items = response.data;
            this.items.sort((a,b) => b.points-a.points || a.timeEnded - b.timeEnded);

            this.items.forEach((item) => {
                let time = item.timeEnded;
                item.timeEnded = this.convertTime(time);
            })
        })
    }
}
</script>

<style scoped>

    @import url("https://fonts.googleapis.com/css?family=Roboto+Condensed|Roboto|Lato|Permanent+Marker");
    @import '../../assets/themify-icons.css';

    label{
        font-family: 'lato', sans-serif
    }
    .card{
        padding: 18px;
        margin: 18px;
        border-radius: 3px;
        border: none;
        font-family: 'Roboto Condensed', sans-serif; 
    }

    .card .card-title{
        /*display: flex;*/
        /*float: left;*/
        font-size: 20px;
    }

    .card-title h5{
        display: flex;
        float: left;
    }

    .search-bar{
        display: flex;
        flex-direction: row;
        margin: 25px 35px 25px 35px;
        height:60px;
        align-self: center;
        transition: all 0.3s ease 0s;
        width: 95%;
    }

    .search-bar select{
        flex-grow: 2;
        background-color: white;
        border-left: 1px solid #ededed;
        border-top: 1px solid #ededed;
        border-bottom: 1px solid #ededed;
        border-right: 0;
        border-radius: 5px 0 0 5px;
        padding-left: 20px;
        font-family: 'Lato', sans-serif;
        font-size: 15px;
        /*background-color: #ffc107;*/
    }

    .search-btn{
        border:none;
        padding-right: 18px;
        /* background-color: pink; */
        /*color:#BAB1B3;*/
        font-size: 20px;
        border-right: 1px solid #ededed;
        border-top: 1px solid #ededed;
        border-bottom: 1px solid #ededed;
        border-radius: 0 5px 5px 0;
        border-left: 0;
        cursor: pointer;
        width: 50px;
        background-color: white;
    }

    .search-bar select:focus{
        outline: none !important;
        border-left:2px solid #645cdd;
        border-top:2px solid #645cdd;
        border-bottom:2px solid #645cdd;
        border-right: 0px;
       
    }

    .search-bar select:focus~ .search-btn{
        outline: none;
        border-right:2px solid #645cdd;
        border-top:2px solid #645cdd;
        border-bottom:2px solid #645cdd;
    }

    .leaderboard-table{
        margin: 18px;
        font-size: 20px;
        font-family: "Roboto", sans-serif;
       
    }

    .leaderboard-table td{
        text-align: center;
    }

    
    .leaderboard-table tr:nth-child(even) {
        background-color: #f2f2f2;
        border-top: 1px solid #DEE2E6;
        border-bottom: 1px solid #DEE2E6;
    }

    .leaderboard-table tr:nth-child(2){
        /* background-color: #FFA90B */
    }

    .leaderboard-table tr:nth-child(3) {
       /* background-color: #CeCeCe */
    }

    .leaderboard-table tr:nth-child(4) {
       /* background-color: #ED9D5D */
    }

    .leaderboard-data td{
        text-overflow: ellipsis;
        max-height: 10px;
        padding: 15px;
    }

    .edit-leaderboard-btn{
        border: none;
        background: none;
    }

    .end-btn{
        cursor: pointer;
        background-color: #645cdd;;
        border: none;
        border-radius: 5px;
        color: white;
        font-size:15px;
        padding:12px;
        text-align: center;
        cursor: pointer;
        min-width: 60px
    }

    .end-btn:hover{
        background-color: #6200EE;
    }

    .leaderboard-data i{
        font-size: 20px;
        /* color: #536479 */
        color: black
    }

    .leaderboard-data a{
        font-size: 20px;
        color: #536479
    }

    .leaderboard-table-header td{
        font-size: 15px;
        padding: 10px;
        min-height: 100px;
        font-weight: 600;
        border-top: 1px solid #DEE2E6;
        border-bottom: 2px solid #DEE2E6;
    }

    .leaderboard-title-header{
        min-width: 200px;
    }

    .timestamp-data{
        padding: 18px;
        font-style: italic;
        font-size: 17px
    }

    .activity-data{
        text-align: left;
        padding-left: 100px;
        font-size: 18px;
    }

    .leaderboard-feed-btns{
        display: flex;
        flex-direction: row;
        float: right;
        margin-top: 10px;
        margin-right: 10px;
        font-size: 18px;
    }

    .leaderboard-btn{
        background-color: white;
        border: 1px solid #645cdd;
        color: #645cdd;
        border-radius: 5px 0 0 5px;
        padding-left: 10px;
        padding-right: 10px;
        font-family: 'Roboto', sans-serif;
        cursor: pointer;
        height:40px
    }

    .leaderboard-btn:focus, .leaderboard-btn:hover, .leaderboard-btn:active,
    .feed-btn:focus, .feed-btn:hover, .feed-btn:active{
        background-color: #645cdd;
        box-shadow: 0 0 4px #5A52C4;
        color: white;
    }

    .feed-btn{
        border:none;
        padding-left: 10px;
        padding-right: 10px;
        background-color: white;
        color: #645cdd;
        border: 1px solid #645cdd;
        border-radius: 0 5px 5px 0;
        font-family: 'Roboto', sans-serif;
        cursor: pointer;
    }

    /* edit leaderboard starts */
    .black-blur-bg{
        width:100%;
        height: 100%;
        background-color: rgb(0, 0, 0, 0.7);
        position: fixed;
        top:0;
        z-index: 4;
        display:flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
    }

    .edit-leaderboard-form{
        width:50%;
        height:85%;
        background:white;
        opacity: 100%;
        z-index: 500;
        border-radius: 3px;
        font-family: 'Roboto', sans-serif;
        font-weight: 600;
        
    }

    .edit-leaderboard-header{
        max-width: 100%;
        padding:18px;
    }

    .edit-leaderboard-form h5{
        display: flex;
        float: left;
    }

    .close-edit-leaderboard{
        background: none;
        border: none;
        color: #868686;
        cursor: pointer;
        float: right;
        font-size: 18px;
    }

    .edit-leaderboard-input{
        float: left;
        display: flex;
        margin-left: 30px;
        margin-bottom: 45px;
        font-family: 'Lato', sans-serif;
        position: relative;
    }

    .edit-leaderboard-body{
        padding-top: 25px;
        display: flex;
        flex-direction: column;
        width:100%;
    }

    .edit-leaderboard-input label{
        top: -25px;
        position: absolute;
        font-size: 13px;
        pointer-events: none;
        transition: all 0.3s ease 0s;
    }

    .edit-leaderboard-input input:focus ~ label,
    .edit-leaderboard-input input:valid ~ label,
    .edit-leaderboard-input input:-webkit-autofill + label{
        font-size: 14px
    }

    .edit-leaderboard-input input{
        margin-left: 5px;
        height: 40px;
        outline: none;
        border: 1px solid #CED4DA;
        border-radius: 4px;
        padding: 10px;
        font-size: 14px;
        width:90%;
        font-family: 'Roboto', sans-serif;
    }

    .edit-leaderboard-input input:focus{
        outline: none !important;
        border:1px solid #6200EE;
        box-shadow: 0 0 2px #645cdd;
    }

    .edit-leaderboard-submit{
        background-color: #6200EE;
        border: none;
        border-radius: 4px;
        color: white;
        font-size:15px;
        display: flex;
        float: right;
        padding:10px 20px 10px 20px;
        margin-right: 25px;
        margin-bottom: 25px;
        text-align: center;
        cursor: pointer;
        align-items: center;
        position: relative;
        font-family: "Roboto", sans-serif
        
    }
</style>



