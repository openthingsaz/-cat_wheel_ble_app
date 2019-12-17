<template>
    <v-dialog
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
      v-model="opened"
      @input="close"
    >
      <v-card>
        연결중
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
        deviceList: [],
        opened: false
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
      this.opened = true;
      this.$store.commit('setDevice', null);
      this.$emit('reset');
      this.$store.commit('disableBackButton');
      Vue.cordova.on('deviceready', () => {
          // 스캔 시작
          ble.startScanWithOptions([], { reportDuplicates: false }, device => {
              /*
              * device 객체 형식
              * {
              *   "name": "TI SensorTag", // 디바이스 이름
              *   "id": "BD922605-1B07-4D55-8D09-B66653E51BBA", // 디바이스 ID
              *   "rssi": -79,
              * }
              * */
              if (device.name === "the Little Cat-B612") {
                  this.deviceList.push(device);
              }
          }, function (a,b,c) {
              console.log(a,b,c);
          });

          setTimeout(() => {
              ble.stopScan(() => console.log('stop scanning'), () => console.log('stop scanning'));

              if (this.deviceList.length) {
                  this.deviceList.sort((a,b) => a.rssi - b.rssi);
                  this.$store.commit('setDevice', this.deviceList[0]);
                  this.$emit('select', true);
              }
              this.close();
          }, 3000);
      })
    }
  };
</script>
<style lang="scss" scoped>
  #deviceList {
    padding-bottom: 68px;
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
</style>

