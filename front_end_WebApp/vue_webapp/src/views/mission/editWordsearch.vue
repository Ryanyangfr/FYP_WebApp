<template>
    <div class="EditWordsearch">
       <div class="card">
            <div class="card-title">
                <h5>Edit Wordsearch</h5>
            </div>
            <form @submit.prevent="wordsearchOnSubmitToEdit">
                <div>
                    <div class="view-mission-body">
                        <div class="view-mission-input">
                            <label for="add-mission-title-input">Title</label>
                            <input name="add-mission-title-input" type="text" placeholder="Title" v-model="wordsearch_title"> 
                        </div>

                          <div v-for="(input, index) in words" :key="index" class="words-body">
                            <div class="view-mission-input">
                                    <label for="add-mission-title-input">Word {{index+1}}</label>
                                    <input name="add-mission-title-input" type="text" placeholder="word" v-model="input.word">
                            </div>

                        </div>

                        <div class="submit-btn-area">
                            <router-link to='/mission'><button class="cancel-btn" type="button">Cancel</button></router-link>
                            <button class="submit-btn" type="submit">Save</button>
                        </div>  
                    </div>
                </div> 
            </form>
            
        </div>
    </div>
</template>

<script>  
import axios from 'axios'
export default {
    name: "editWefie",
    data() {
        return{
            wordsearch_title: "",
            words: [], //size has to be 5 always
            wordsearch_ID: 0,
            
        }  
    },

    computed: {
        selectedWordsearchTitle(){
          return this.$store.state.selectedWordsearchTitle
        },

        selectedWords(){
          return this.$store.state.selectedWords
        },

        selectedWordsearchID(){
            return this.$store.state.selectedWordsearchID
        }
    },

    methods: {
        //submits the edited wordsearch words
        //needs to check the number of chars in each word cannot be more than 10
      wordsearchOnSubmitToEdit(){
        let wordsToBeSubmitted = []
        for(var index in this.words){
            let currentWord = this.words[index].word;

                if( currentWord.length > 0) {
                    wordsToBeSubmitted.push(this.words[index].word);
                }
        }

        let postBody = {
            id: this.wordsearch_ID,
            title: this.wordsearch_title,
            words: wordsToBeSubmitted,
        }

        axios.post('//amazingtrail.ml/api/edit/editWordsearch', postBody)
        .then(response => {
            let data = response.data
            this.$router.push({ path: this.redirect || '/mission' })
        })
      }
    },

    mounted(){
      if (!this.$session.exists()) {
          this.$router.push('/')
      }
    
    //on page loads, get all the wordsearch title of the selected wordsearch, the words and the ID of that wordsearch
      this.wordsearch_title = this.$store.state.selectedWordsearchTitle
      this.words = this.$store.state.selectedWords
      this.wordsearch_ID = this.$store.state.selectedWordsearchID

    //ensure the size of "words" needs to be 5
    let numWordsMissing = 5 - this.words.length;

    for (let i = 0; i < numWordsMissing; i++) {
        this.words.push({word: ""});
    }

    }
}
</script>

<style scoped>
    @import url("https://fonts.googleapis.com/css?family=Roboto+Condensed|Roboto|Poppins");
    @import '../../assets/themify-icons.css';

    label{
        font-family: 'lato', sans-serif
    }

    .EditWordsearch .card{
        padding: 18px;
        margin: 18px;
        border-radius: 3px;
        border: none;
        font-family: 'Roboto Condensed', sans-serif; 
    }

    .card .card-title{
        font-size: 20px;
        margin-bottom: 50px;
    }

    .card-title h5{
        display: flex;
        float: left;
    }

    .EditWordsearch div{
        min-width: inherit;
    }

    .words-body label{
        margin-right: 90px;
        font-size: 14px;
        font-weight: 600;
        pointer-events: none;
        transition: all 0.3s ease 0s;
        white-space: nowrap;
        float: left;
        display: flex;
        height: inherit;
        min-width: 11%
    }

    .words-body{
        display: flex;
        flex-direction: column;
    }

   .view-mission-input label{
        margin-right: 90px;
        font-size: 14px;
        font-weight: 600;
        pointer-events: none;
        transition: all 0.3s ease 0s;
        white-space: nowrap;
        float: left;
        display: flex;
        height: inherit;
        min-width: 11%

    }

    .view-mission-input{
        float: left;
        display: flex;
        margin-left: 30px;
        margin-bottom: 25px;
        font-family: 'Lato', sans-serif;
        position: relative;
    }

    .view-mission-input input{
        height: 40px;
        outline: none;
        border: 1px solid #CED4DA;
        border-radius: 4px;
        padding: 10px;
        font-size: 14px;
        min-width:75%;
        font-family: 'Roboto', sans-serif;
    }

    .view-mission-body{
        display: flex;
        flex-direction: column;
        width:100%;
    }

    .submit-btn-area{
        width: 100%;
        overflow: hidden;
        float: right;
    }

    .EditWordsearch .submit-btn{
        float:right;
        background: none;
        border: none;
        background-color: #645cdd;
        border-radius: 4px;
        min-width: 8%;
        min-height: 40px;
        padding:8px 10px 8px 10px;
        margin-right: 20px;
        text-align: center;
        cursor: pointer;
        align-items: center;
        font-family: 'Roboto', sans-serif;
        font-size: 20px;
        color: white;
        margin-top: 50px;
    }

     .EditWordsearch .submit-btn:hover{
        background-color: #5a52c4;
     }

     .EditWordsearch .cancel-btn{
        float:right;
        background-color: #ACACAC;
        color: white;
        border:none;
        border-radius: 4px;
        min-width: 8%;
        min-height: 40px;
        padding:8px 10px 8px 10px;
        margin-right: 45px;
        text-align: center;
        cursor: pointer;
        align-items: center;
        font-family: 'Roboto', sans-serif;
        font-size: 18px;
        color: white;
        margin-top: 50px;
    }

    .EditWordsearch .cancel-btn:hover{
        background-color: #b2a7a7
    }

    .EditWordsearch .cancel-btn a{
        text-decoration: none!important;
        color: white
    }


</style>