<template>
    <v-dialog
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
      v-model="opened"
      @input="close"
    >
      <v-card>
        <v-card-title class="headline">연결할 디바이스를 선택하세요.</v-card-title>
        <div>

          <v-list id="deviceList" two-line>
            <template v-if="device">
              <v-divider></v-divider>
              <itemList
                :device="device"
                :connected="true"
                @connect="onDeviceItemConnect"
                @disconnect="onDeviceItemDisconnect"
              ></itemList>
            </template>
            <v-divider></v-divider>
            <template
              v-for="deviceItem in deviceList"
             >
              <itemList
                v-if="!device || device.id != deviceItem.id"
                :device="deviceItem"
                :connected="false"
                @connect="onDeviceItemConnect"
              ></itemList>

              <v-divider></v-divider>
            </template>
          </v-list>
        </div>
        <div class="back-button-wrapper">
          <v-btn @click="close" raised round fill>BACK</v-btn>
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
      onDeviceItemConnect: function (device) {
        this.connecting = false;
        if (device) {
          this.$store.commit('setDevice', device);
          this.$emit('select', true);
        }
        this.close()
      },

      onDeviceItemDisconnect: function () {
        this.$store.commit('setDevice', null);
      },
      close(){
        this.$store.commit('activeBackButton')
        this.opened = false;
        setTimeout(()=>{
          this.$router.replace("/");
        }, 250)
      },
      backButton(){
          if (this.opened) {
            this.close();
          }
      }
    },
    mounted() {
      this.opened = true;
      this.$store.commit('disableBackButton')
      Vue.cordova.on('deviceready', () => {
          const self = this;

          // 스캔 시작
          ble.startScanWithOptions([], { reportDuplicates: false }, function(device) {
              /*
              * device 객체 형식
              * {
              *   "name": "TI SensorTag", // 디바이스 이름
              *   "id": "BD922605-1B07-4D55-8D09-B66653E51BBA", // 디바이스 ID
              *   "rssi": -79,
              * }
              * */
              if (!device.name) {
                  device.name = device.id;
              }
              self.deviceList.push(device);
          }, function (a,b,c) {
              console.log(a,b,c);
          });

          document.addEventListener('backbutton', this.backButton, false)
      })

    },
    created() {

    },
    destroyed() {
        ble.stopScan(() => console.log('stop scanning'), () => console.log('stop scanning'));
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

