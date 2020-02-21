<template>
  <v-app>
    <router-view name="bluetoothConnect" @select="checkDevice" @reset="reset"></router-view>
    <!--    <router-view name="login" @login="login"></router-view>-->
    <v-content id="main">
<!--      <div id="progress" v-show="connecting">-->
<!--        <v-progress-circular-->
<!--          :size="50"-->
<!--          color="primary"-->
<!--          indeterminate-->
<!--        ></v-progress-circular>-->
<!--      </div>-->

      <transition name="page">
        <router-view name="page"></router-view>
      </transition>
    </v-content>
  </v-app>
</template>

<script>
    import moment from 'moment'
    import Vue from 'vue'
    import {connect, db} from "./assets/js/db"
    import {Confirm} from "./assets/js/dialog"
    import {getCRC, getMoveData, hexArrToInt, setTimeSync, getPowerMode, getDeviceBattery} from "./assets/js/bleUtill"
    import catHeader from './components/home/cat-header.vue'
    import { mapGetters } from 'vuex'


    export default {
        components: {
            "cat-header": catHeader,
            // splash
        },
        computed: {
            ...mapGetters([
                'device',
            ]),
        },
        data() {
            return {
                getMoveDataTimeout: null,
                getDeviceBatteryInterval: null,
                ready: false,
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
        created() {
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
            });
        },
        methods: {
            onDeviceConnect: function () {
                this.$store.commit('setSynced', false);
                let buffer = [];
                window.testDeviceId = this.$store.getters.device.id;
                ble.startNotification(this.$store.getters.device.id, "6E400001-B5A3-F393-E0A9-E50E24DCCA9E", "6E400003-B5A3-F393-E0A9-E50E24DCCA9E", data => {
                    buffer = buffer.concat(Array.from(new Uint8Array(data)));
                    console.log(buffer);
                    let stxPos = 0;
                    while (true) {
                        let flag = false;
                        stxPos = buffer.indexOf(2, stxPos);
                        if (stxPos === -1) {
                            break;
                        } else if (buffer.length > stxPos + 7) {
                            const dataLength = hexArrToInt(buffer.slice(stxPos + 1, stxPos + 3));
                            const dataLength2 = hexArrToInt(buffer.slice(stxPos + 3, stxPos + 5));
                            if (
                                dataLength === dataLength2 &&
                                buffer.length > stxPos + dataLength + 7 &&
                                buffer[stxPos + dataLength + 7] === 3 &&
                                hexArrToInt(getCRC(buffer.slice(stxPos + 5, stxPos + dataLength + 7))) === 0
                            ) {
                                const fnCode = buffer[stxPos + 5];
                                const cmdData = buffer.slice(stxPos + 6, stxPos + dataLength + 5);
                                console.log("CMD IN " + buffer.splice(0, stxPos + dataLength + 8).map(a => "0x" + a.toString(16)).join(" "));
                                flag = true;
                                stxPos = 0;
                                this.commandRun(fnCode, cmdData);
                            }
                        }
                        if (!flag) {
                            stxPos++;
                        }
                    }
                }, e => console.error(e));
                getPowerMode();
                setTimeout(() => setTimeSync(this.$store.getters.device.id), 500);
                setTimeout(() => getPowerMode(this.$store.getters.device.id), 1000);
                this.getMoveDataTimeout = setTimeout(() => this.getMoveData(), 1500);
                this.getDeviceBatteryLoop();
            },
            getDeviceBatteryLoop: function(){
                if (this.getDeviceBatteryInterval) {
                    clearInterval(this.getDeviceBatteryInterval);
                }
                setTimeout(() => {
                    getDeviceBattery(this.$store.getters.device && this.$store.getters.device.id);
                    this.getDeviceBatteryInterval = setInterval(() => getDeviceBattery(this.$store.getters.device && this.$store.getters.device.id), 10000);
                }, 100);
            },
            getMoveData: function () {
                if (this.$store.getters.device && this.$store.getters.device.id) {
                    getMoveData(this.$store.getters.device.id);
                }
            },
            commandRun: function (cmd, data) {
                console.log(cmd, data);
                if (cmd === 0x11) { // GET_BAT
                    this.$store.commit('setBattery', Math.min(hexArrToInt(data), 100));
                } else if (cmd === 0x20) { // GET_MOVE_DATA
                    let lastTimestamp = localStorage.getItem("_last_move") ||-1;
                    for (let i = 0; i < Math.floor(data.length / 12); i++) {
                        const stPos = i * 12;
                        const timestamp = hexArrToInt(data.slice(stPos, stPos + 4));
                        if (lastTimestamp < timestamp) {
                            lastTimestamp = timestamp;
                            this.insertMoveData(
                                timestamp,
                                hexArrToInt(data.slice(stPos + 4, stPos + 8)),
                                hexArrToInt(data.slice(stPos + 8, stPos + 12))
                            )
                        }
                    }
                    this.$store.commit('setSynced', data.length < 84);
                    localStorage.setItem("_last_move", lastTimestamp + "");
                    this.getMoveDataTimeout = setTimeout(() => this.getMoveData(), 1500);
                    this.getTodayData();
                } else if (cmd === 0x30) {
                    this.$store.commit('setMode', hexArrToInt(data));
                }
            },
            getTodayData() {
                connect(db => {
                    db.transaction(tx => {
                        const catId = this.$store.getters.curCatId;
                        const today = moment().startOf('day');
                        const tomorrow = today.clone().date(today.date() + 1);
                        if (catId !== 0) {
                            tx.executeSql(
                                "SELECT SUM(move) as today_move, sum(calorie) as today_calorie FROM logs_v2 WHERE cat = ? and stdt >= ? AND stdt < ?", [catId, today.unix(), tomorrow.unix()],
                                (tx, res) => {
                                    if (res.rows.length) {
                                        let item = res.rows.item(0);
                                        console.log(item);
                                        this.$store.commit('setTodayWheelData', [item['today_calorie'] || 0, item['today_move'] || 0])
                                    } else {
                                        this.$store.commit('setTodayWheelData', [0, 0]);
                                    }
                                },
                                err => {
                                    console.error(err);
                                }
                            );

                            const startTimestamp = this.$store.getters.startTimestamp;
                            console.log(startTimestamp);
                            console.log(new Date(startTimestamp * 1000));
                            tx.executeSql(
                                "SELECT SUM(move) as cur_move FROM logs_v2 WHERE cat = ? and stdt >= ?", [catId, startTimestamp],
                                (tx, res) => {
                                    if (res.rows.length) {
                                        let item = res.rows.item(0);
                                        this.$store.commit('setCurrentMove', item['cur_move'])
                                    } else {
                                        this.$store.commit('setCurrentMove', 0)
                                    }
                                },
                                err => {
                                    console.error(err);
                                }
                            )
                        } else {
                            this.$store.commit('setCurrentMove', 0)
                            this.$store.commit('setTodayWheelData', [0, 0]);
                        }

                    }, err => {
                        console.error(err);
                    })
                })
            },
            checkDevice: function (flag) {
                const device = this.$store.getters.device
                if (device && device.id) {
                    ble.isConnected(device.id, () => {
                        this.onDeviceConnect();
                    }, () => {
                        ble.connect(device.id, () => { // 연결 2회 시도
                            this.onDeviceConnect();
                        }, (e) => {
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
            reset() {
                clearTimeout(this.getMoveDataTimeout);
            },
            login(user) {
                // this.$store.commit('setUser', user)
                // this.$router.replace("/")
                // this.afterLogin()
            },
            afterLogin() {
                this.getTodayData();
                ble.isEnabled(this.checkDevice, () => {
                    ble.enable(this.checkDevice);
                });
            },
            onBackKeyDown() {
                if (this.$store.getters.isBackButtonDisabled) {
                    return
                }
                // Handle the back-button event on Android. By default it will exit the app.
                if (this.$routerHistory.hasPrevious()) {
                    this.$router.back();
                } else {
                    Confirm("종료하시겠습니까?", "확인", function () {
                        navigator.app.exitApp();
                    })
                }
            },
            insertMoveData(timestamp, move, sec) {
                // console.log("NOW: " + Math.floor(new Date().getTime() / 1000) + "   VAL: " + timestamp);
                // console.log(new Date(timestamp * 1000), move, sec);
                const cat = this.$store.getters.curCat;
                const calorie = (move / 100) * (0.06 + (cat.weight - 5) / 100);
                if (cat.id !== 0) {
                    const args = [cat.id, timestamp, sec, move, calorie];
                    connect(db => db.transaction(tx => {
                        // console.log(`INSERT ${args}`);
                        tx.executeSql('INSERT INTO logs_v2 VALUES (?,?,?,?,?)', args, () => {
                        }, err => console.error(err));
                    }, err => {
                        console.error(err);
                    }))
                }
            }
        }
    }
</script>

<style>
  #progress {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  body {
    padding-top: constant(safe-area-inset-top);
    padding-top: env(safe-area-inset-top);
  }

  .footer { /* Apply this to v-bottom-nav if necessary. */
    margin-bottom: constant(safe-area-inset-bottom);
    margin-bottom: env(safe-area-inset-bottom);
  }
</style>
