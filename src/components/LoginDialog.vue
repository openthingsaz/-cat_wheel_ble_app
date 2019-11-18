<template>
    <v-dialog
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
      v-model="opened"
      @input="close"
    >
      <v-card>
        <form @submit.prevent="submit" novalidate>
          <v-layout row wrap class="pl-3 pr-3">
            <v-flex xs8 offset-xs2>
              <div>
                <v-text-field
                  label="ID"
                  v-model="id"
                ></v-text-field>
              </div>
              <div>
                <v-text-field
                  label="PW"
                  v-model="pw"
                  type="password"
                ></v-text-field>
              </div>
              <v-btn
                color="primary"
                class="ml-0 mr-0"
                raised
                type="submit"
              >LOGIN</v-btn>
            </v-flex>
          </v-layout>
        </form>
      </v-card>
    </v-dialog>
</template>
<script>
  import {Confirm, Alert} from "../assets/js/dialog"
  import Vue  from 'vue'

  export default {
    data: function () {
      return {
        id: "",
        pw: "",
        opened: false
      };
    },
    methods: {
      submit(){
        if (this.id === "user" && this.pw === "password") {
          this.$emit('login', {name: "User"})
          this.close()
        }else{
          Alert("ID 혹은 비밀번호가 일치하지 않습니다.", "Error")
        }
      },
      close(){
        this.$store.commit('activeBackButton')
        this.opened = false;
      }
    },
    mounted() {
      this.opened = true
      this.$store.commit('disableBackButton')
      Vue.cordova.on('deviceready', () => {
        document.addEventListener('backbutton', ()=> {
          if (this.opened) {
            Confirm("종료하시겠습니까?", "확인", function() {
              navigator.app.exitApp();
            })
          }
        }, false)
      })
    },
  };
</script>
<style lang="scss" scoped>
  form{
    padding-top: 35vh;
    button{
      width: 100%;
      margin-top: 12px;
    }
  }
</style>

