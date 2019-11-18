<template>
  <v-app>
      <router-view name="bluetoothConnect" @select="checkDevice"></router-view>
      <!--    <router-view name="login" @login="login"></router-view>-->
      <v-content id="main">
        <div id="progress" v-show="connecting">
          <v-progress-circular
            :size="50"
            color="primary"
            indeterminate
          ></v-progress-circular>
        </div>

        <transition name="page">
          <router-view name="page"></router-view>
        </transition>
      </v-content>
  </v-app>
</template>

<script>
  import Vue from 'vue'
  import {connect, db} from "./assets/js/db"
  import {Confirm} from "./assets/js/dialog"
  import {bytesToString, write} from "./assets/js/bleUtill"
  import catHeader from './components/home/cat-header.vue'
  // import splash from './components/splash.vue';

  export default {
    components: {
      "cat-header": catHeader,
      // splash
    },
    data () {
      return {
        ready: false,
        connecting: false,
        cordova: Vue.cordova,
        clipped: false,
        drawer: true,
        items: [{
          icon: 'bubble_chart',
          title: 'Inspire'
        }],
        miniVariant: false,
        right: true,
        rightDrawer: false,
        title: 'Vuetify.js'
      }
    },
    created () {
      this.cordova.on('deviceready', () => {
          // Handle the device ready event.
          StatusBar.backgroundColorByHexString("#001632");
          StatusBar.styleLightContent(true);
          connect(db => {
              this.ready = true;
              navigator.splashscreen.hide();
          })
          if (this.cordova.device.platform === 'Android') {
              document.addEventListener('backbutton', this.onBackKeyDown, false)
          }

          // if(this.$store.getters.user){
          //   this.afterLogin()
          // } else{
          //   this.$router.replace("/login")
          // }
          this.afterLogin(); // 현재 로그인 없음
          this.wheelChecker();
      });
    },
    methods: {
      onDeviceConnect: function () {
            bluetoothSerial.subscribe('\n', (data)=>{
                data = data.trim();
                if (data.length){
                    console.log(data);
                    if (!isNaN(data))
                        this.$store.commit('setWheelPos', parseInt(data));
                }
            });
        },
      checkDevice: function (flag) {
        this.connecting = true;
        const device = this.$store.getters.device
        if (device && device.id) {
            ble.isConnected(device.id, () => {
              this.connecting = false;
              this.onDeviceConnect();
          }, () => {
              ble.connect(device.id, () => { // 연결 2회 시도
                this.connecting = false;
                this.onDeviceConnect();
            }, (e) => {
               this.connecting = false;
              this.$store.commit('setDevice', null);
              this.$router.push("connect-dialog");
              if (flag) {
                  navigator.notification.alert(e, "연결 실패");
              }
            });
          });
        } else {
          this.$router.push("connect-dialog")
        }
      },
      login(user){
        // this.$store.commit('setUser', user)
        // this.$router.replace("/")
        // this.afterLogin()
      },
      afterLogin(){
          ble.isEnabled(this.checkDevice, () => {
              ble.enable(this.checkDevice);
          });
      },
      onBackKeyDown () {
        if (this.$store.getters.isBackButtonDisabled){
          return
        }
        // Handle the back-button event on Android. By default it will exit the app.
        if(this.$routerHistory.hasPrevious()){
          this.$router.back();
        } else{
          Confirm("종료하시겠습니까?", "확인", function() {
            navigator.app.exitApp();
          })
        }
      },
      wheelChecker() {
          setInterval(() => {
              const now = new Date();
              const cat = this.$store.getters.curCat;
              const wheel = this.$store.getters.wheel;
              let calorie = (wheel.move / 360 * 1.1 * Math.PI) * (0.06 + (cat.weight-5)/100);

              if (cat.id !== 0 && wheel.firstUpdate != null && (now - wheel.lastUpdate > 1500 || now - wheel.firstUpdate > 10000)) {
                  console.log([cat.id, Math.round(wheel.firstUpdate/1000), Math.round((wheel.lastUpdate-wheel.firstUpdate)/1000), wheel.move, calorie] );
                  connect(db => {
                      db.transaction(tx => {
                          tx.executeSql(
                              'INSERT INTO logs_v2 VALUES (?,?,?,?,?)',
                              [cat.id, Math.round(wheel.firstUpdate/1000), Math.round((wheel.lastUpdate - wheel.firstUpdate)/1000), wheel.move, calorie],
                              () => {
                                  this.$store.commit('insertEnd');
                              },
                              err => {
                                  console.error(err);
                              }
                          );
                      }, err => {
                          console.error(err);
                      })
                  })
              }
          }, 500);
      }
    }
  }
</script>

<style>
  #progress {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%,-50%);
  }
	body {
    padding-top: constant(safe-area-inset-top);
    padding-top: env(safe-area-inset-top);
	}
  .footer{ /* Apply this to v-bottom-nav if necessary. */
    margin-bottom: constant(safe-area-inset-bottom);
    margin-bottom: env(safe-area-inset-bottom);
  }
</style>
