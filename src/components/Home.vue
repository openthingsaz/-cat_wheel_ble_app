<template>
  <div id="home" class="page">
    <header>
      <cat-header></cat-header>
    </header>
    <div class="body">
      <div class="top-btns wrapper">
        <div class="ledBtn">
          <img src="img/ledBtn.png" @click="$router.push('/led-setting')"/>
        </div>
        <div class="bleBtn item-right" @click="$router.push('/connect-dialog')">
          <img v-if="device" src="img/bleBtnOn.png"/>
          <img v-else src="img/bleBtnOff.png"/>
        </div>
      </div>
      <div style="margin-top: -18px; padding: 8px 0; overflow: hidden;">
        <circlePointer></circlePointer>
      </div>
    </div>

    <div class="footer">
      <div class="footerBtn" @click="$router.push('/chart/distance')">
        <div>
          Today <br>
          Distance
        </div>
        <div>
          <div>{{wheelMoveDistance}}</div>
           <span>{{wheelMoveDistanceUnit}}</span>
        </div>
      </div>

      <div class="footerBtn" @click="$router.push('/chart/turn')">
        <div>
          Today <br>
          Wheel turn
        </div>
        <div>
          <div>{{wheelCount}}</div>
        </div>
      </div>

      <div class="footerBtn" @click="$router.push('/chart/burn')">
        <div>
          Today <br>
          Burn
        </div>
        <div>
          <div>{{calorie}}</div>
          <span>kcal</span>
        </div>
      </div>
    </div>


<!--    <div class="graph" :style="{'height': `${graphHeight}px`}">-->
<!--      <img src="img/graph.jpg">-->
<!--    </div>-->
<!--    <v-btn-->
<!--      id="addConnectFAB"-->
<!--      color="pink"-->
<!--      dark-->
<!--      small-->
<!--      absolute-->
<!--      bottom-->
<!--      right-->
<!--      fab-->
<!--      @click="$router.push('connect-dialog')"-->
<!--    >-->
<!--      CONNECT-->
<!--    </v-btn>-->
  </div>
</template>
<script>
  import Vue from 'vue';
  import {mapGetters} from 'vuex'
  import moment from 'moment'

  import catHeader from './home/cat-header.vue';
  import circlePointer from './home/circlePointer.vue';
  import itemList from './home/itemList.vue';
  import {connect} from "../assets/js/db"

  export default {
    components: {
      circlePointer,
      itemList,
      'cat-header': catHeader
    },
    data: function () {

      return {
      };
    },
    computed: {
        graphHeight(){
          return window.innerHeight;
        },
        wheelMoveDistance() {
            const distance = this.$store.getters.wheelMoveDistance;
            if (distance < 1000) {
                return Math.round(distance);
            } else if (distance < 10000){
                return (distance/1000).toFixed(2);
            } else {
                return (distance/1000).toFixed(1);
            }
        },
        wheelMoveDistanceUnit() {
            return this.$store.getters.wheelMoveDistance < 1000 ? 'm' : 'km';
        },
        calorie() {
            const calorie = this.$store.getters.calorie;
            if (calorie < 100) {
                return calorie.toFixed(2);
            } else {
                return calorie.toFixed(1);
            }
        },
        ...mapGetters([
            'device',
            'wheelCount'
        ]),
    },
    methods: {
      share(){

        // write(this.$store.getters.device.id, "BAT\n", function () { }, function (e) {
        //   console.log(e);
        // });

        // db.executeSql(
        //   "SELECT stdt * 1000 as stdt, (stdt+sec) * 1000 as endt, sec, move, calorie FROM logs",
        //   [],
        //   (res) => {
        //     const arr = [['Start datetime', 'End datetime', 'Exercise time (second)', 'Expend calories (cal)', 'Distance (m)', 'Wheels']]
        //     for (let i = 0; i < res.rows.length; i++){
        //       const item = res.rows.item(i)
        //       arr.push([
        //         moment(item.stdt).format("YYYY-MM-DD HH:mm:ss"),
        //         moment(item.endt).format("YYYY-MM-DD HH:mm:ss"),
        //         item.sec,
        //         item.calorie.toFixed(2),
        //         (item.move / 360 * 1.1 * Math.PI).toFixed(1),
        //         Math.floor(item.move / 360),
        //       ])
        //     }
        //
        //     (async () => {
        //       try{
        //         const logs = await csvStringify(arr);
        //         const cat = this.$store.getters.cat;
        //         if (!cat) return;
        //
        //         const catInfo = await csvStringify([
        //           ["Birth", 'Weight (kg)', 'Bust (cm)', 'Leg length (cm)', "Fat"],
        //           [cat.birth, cat.weight, cat.bust, cat.legLength, parseFloat(((((cat.bust/0.7062) - cat.legLength) / 0.9156) - cat.legLength).toFixed(1))]
        //         ]);
        //
        //         window.cordova.plugins.email.open({
        //           to: ['skytreewing@hanmail.net'],
        //           subject: `Cat Wheel 로그데이터 전송`,
        //           body: `Cat Wheel 로그데이터 전송`,
        //           attachments: [`base64:cat_info.csv//${btoa(catInfo)}`, `base64:logs.csv//${btoa(logs)}`]
        //         })
        //
        //       } catch (e) {
        //           console.error(e);
        //       }
        //
        //     })()
        //   },
        //   err => {
        //     console.error(err);
        //   }
        // )
      }
    },
    mounted() {
        connect(db => {
            db.transaction(tx => {
                const catId = this.$store.getters.curCatId;
                const today = moment().startOf('day');
                const tomorrow = today.clone().date(today.date()+1);
                if (catId !== 0) {
                    tx.executeSql(
                        "SELECT SUM(move) as today_move, sum(calorie) as today_calorie FROM logs_v2 WHERE cat = ? and stdt >= ? AND stdt < ?", [catId, today.unix(), tomorrow.unix()],
                        (tx, res) => {
                            console.log(res.rows);
                            if (res.rows.length) {
                                let item = res.rows.item(0);
                                console.log(item);
                                this.$store.commit('setTodayWheelData',[item['today_calorie'],item['today_move']])
                            }
                        },
                        err => {
                            console.error(err);
                        }
                    )
                } else {
                    this.$store.commit('setTodayWheelData', [0, 0]);
                }

            }, err => {
                console.error(err);
            })
        })

    },
    created() {

    }
  };
</script>{
<style lang="scss" scoped>

  #home {
    height: 100vh;
    max-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  header {
    flex: 0 0 auto;
  }

  .body {
    flex: 1 1 auto;
    overflow-y: scroll;
    .top-btns{
      margin-top: 0;
      margin-bottom: 0;
      padding-left: 8px;
      padding-right: 8px;
    }


    .top-btns {
      padding: 32px 32px 0 32px;
      .ledBtn{
        padding: 8px;
        img{
          display: block;
          width: 45px;
        }
      }

      .bleBtn{
        padding: 8px;
        img{
          display: block;
          width: 45px;

        }
      }
    }


  }

  .footer {
    display: flex;
    flex: 0 0 0;
    justify-content: space-between;
    padding: 36px 24px;
  }


.footerBtn {
  padding: 8px 0;
  border-radius: 12px;
  background-color: #384452;
  text-align: center;
  height: 110px;
  width: 90px;
  display: flex;
  flex-direction: column;
  &>div:first-child {
    flex: 0;
    color: #2db7bd;
    font-size: 16px;
  }

  &>div:last-child {
    flex:1 0 0;
    color: #ffffff;
    text-align: center;
    margin-top: 4px;
    padding: 0 4px;

    &::before {
      content: '';
      display: block;
      margin: 0 auto 12px auto;
      width: 20%;
      background-color: #626C77;
      height: 2px;
    }

    font-size: 0;
    div {
      display: inline;
      font-size: 14px;
      font-weight: 500;
    }

    span {
      font-size: 12px;
      margin-left: 2px;
    }
  }
}

</style>

