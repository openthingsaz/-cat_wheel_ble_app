<template>
    <v-dialog
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
      v-model="opened"
      @input="close"
    >
      <v-card>
        <img src="img/cat-1.png" alt="" id="img1" :class="{show: !connecting}">
        <div id="img2" :class="{show: connecting}">
          <div class="shine"></div>
          <img src="img/cat-2.png" alt="" >
        </div>
        <div id="connectStatus">
          <img id="loadingImg" src="img/loading.png" alt="" :class="{show: !connecting}">
          <img id="loadFinishImg" src="img/load-finish.png" alt="" :class="{show: connecting}">
<!--          <span id="loadTxt" @click="connecting=!connecting">{{connecting ? "Connected Device" : "Device Searching"}}</span>-->
          <span id="loadTxt">{{connecting ? "Connected Device" : "Device Searching"}}</span>
        </div>
      </v-card>
    </v-dialog>
</template>
<script>
  import Vue from 'vue';
  import {mapGetters} from 'vuex'
  import itemList from './itemList.vue';
  export default {
    components: {
      itemList
    },
    data: function () {
      return {
        connecting: false,
        opened: false,
      };
    },
    computed: {
        ...mapGetters([
            'device',
        ]),
    },
    methods: {
      close(){
        this.$store.commit('activeBackButton')
        this.opened = false;
        setTimeout(()=>{
          this.$router.replace("/");
        }, 250)
      },
    },
    mounted() {
      this.$store.commit('disableBackButton');
      if (this.$store.getters.device) {
          ble.disconnect(this.$store.getters.device.id, function () {

          }, function () {

          });
          this.$store.commit('setDevice', null);
          this.$emit('reset');
          this.close();
          return;
      }

      this.opened = true;
      Vue.cordova.on('deviceready', () => {
          // 스캔 시작
          const deviceList = [];
          ble.startScanWithOptions([], { reportDuplicates: false }, device => {
              /*
              * device 객체 형식
              * {
              *   "name": "TI SensorTag", // 디바이스 이름
              *   "id": "BD922605-1B07-4D55-8D09-B66653E51BBA", // 디바이스 ID
              *   "rssi": -79,
              * }
              * */
              if (device.name && device.name.trim() === "the Little Cat-B612") {
                  deviceList.push(device);
              }
              // alert(`#${device.name || "NO_NAME"}#  ${device.name === "the Little Cat-B612" ? "is match" : "is not match"}\nID:${device.id}`);
          }, function (a,b,c) {
              console.log(a,b,c);
          });

          setTimeout(() => {
              ble.stopScan(() => console.log('stop scanning'), () => console.log('stop scanning'));

              if (deviceList.length) {
                  debugger
                  deviceList.sort((a,b) => a.rssi - b.rssi);
                  this.$store.commit('setDevice', deviceList[0]);
                  this.$emit('select', true);
                  this.connecting = true;
                  setTimeout(() => {
                      this.close();
                  }, 2000)
              } else{
                  this.close();
              }
          }, 2500);
      })
    }
  };
</script>
<style lang="scss" scoped>
  #deviceList {
    padding-bottom: 68px;
  }

  .v-card {
    background: #262e3e url("../../../static/img/bg.png") no-repeat center center;
    background-size: cover;
  }

  #progress{
    position: fixed;
    z-index: 5555;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    .v-progress-circular{
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-25px, -25px);
    }
  }
  .back-button-wrapper{
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 16px;
    button{
      width: 33%;
      min-width: 120px;
      display: block;
      margin: 0 auto;
    }
  }

  #img1 {
    position: absolute;
    width: 45%;
    left: 5%;
    bottom: 30px;
    visibility: hidden;
    transform: translateY(10px);
    opacity: 0;
    transition: .3s;
    animation: float 3s ease-in-out infinite;
    @keyframes float {
      0% {
        transform: translateY(10px);
      }
      50% {
        transform: translateY(0px);
      }
      100% {
        transform: translateY(10px);
      }
    }

    &.show {
      visibility: visible;
      transform: translateY(0);
      opacity: 1;
    }
  }
  #img2 {
    position: absolute;
    top: 55%;
    left: 5%;
    width: 90%;
    transform: translateY(-50%) translateY(10px);
    visibility: hidden;
    opacity: 0;
    transition: .3s;
    &.show {
      visibility: visible;
      transform: translateY(-50%) translateY(0);
      opacity: 1;
      .shine {
        &::after {
          box-shadow: 0 0 30px 40px rgba(255,255,145,.25);
          transition: .7s .4s;
        }
      }
    }
    img {
      display: block;
      width: 100%;
    }
    .shine {
      overflow: hidden;
      position: absolute;
      top: 5%;
      left: 8%;
      right: 5%;
      bottom: 14%;
      border-radius: 49%;
      &::after {
        content: "";
        display: block;
        position: absolute;
        border-radius: 50%;
        top: -2%;
        right: -16%;
        width: 47%;
        height: 45%;
        background-color: rgba(255,255,145,.4);
        box-shadow: 0 0 10px 0 rgba(255,255,145,.4);
      }
    }
  }

  #connectStatus {
    position: absolute;
    left: 0;
    right: 0;
    text-align: center;
    bottom: 50%;
    padding-bottom: 40px;
  }
  #loadingImg, #loadFinishImg  {
    display: none;
    margin: 0 auto;
    &.show {
      display: block;
    }
  }

  #loadingImg {
    animation: loading 5s infinite linear;
    @keyframes loading {
      from {
        transform: rotate(0deg);
      }
      to{
        transform: rotate(360deg);
      }
    }
  }

  #loadTxt {
    display: block;
    text-align: center;
    bottom: 0;
    position: absolute;
    left: 0;
    right: 0;
    color: #2eb8be;
  }
</style>

