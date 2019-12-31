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
        <div class="bleBtn item-right" @click="onConnectBtnClick">
          <img v-if="device" src="img/bleBtnOn.png"/>
          <img v-else src="img/bleBtnOff.png"/>
        </div>
      </div>
      <div id="circlePointer">
        <circlePointer></circlePointer>
          <div id="wheelDp" v-if="device">
            <div v-if="wheel.synced" class="txt">
<!--            <div class="txt">-->
              <span>{{curWheelMoveDistanceStr}}</span>
              <span>{{curWheelMoveDistanceUnit}}</span>
            </div>
            <div v-if="!wheel.synced">
              <v-progress-circular
                :size="100"
                :width="6"
                color="indigo darken-4"
                indeterminate
              ></v-progress-circular>
            </div>
          </div>
      </div>
    </div>

    <div class="footer">
      <div class="footerBtn" @click="$router.push('/chart/distance')">
        <div>
          <span>
            Traveled <br>
            Distance
          </span>
        </div>
        <div>
          <div>{{wheelMoveDistanceStr}}</div>
           <span>{{wheelMoveDistanceUnit}}</span>
        </div>
      </div>

      <div class="footerBtn" @click="$router.push('/chart/turn')">
        <div>
          <span>
            Number of <br>
            B612 Planet<br>
            Rotation
          </span>
        </div>
        <div>
          <div>{{wheelCount}}</div>
        </div>
      </div>

      <div class="footerBtn" @click="$router.push('/chart/burn')">
        <div>
          <span>
            Today's <br>
            Burnt <br>
            Calories
          </span>
        </div>
        <div>
          <div>{{calorieStr}}</div>
          <span>kcal</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import Vue from 'vue';
  import {mapGetters} from 'vuex'

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
        wheelMoveDistanceStr() {
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

        curWheelMoveDistanceStr() {
            const distance = this.$store.getters.wheel.currentMove/100;
            if (distance < 1000) {
                return Math.round(distance);
            } else if (distance < 10000){
                return (distance/1000).toFixed(2);
            } else {
                return (distance/1000).toFixed(1);
            }
        },
        curWheelMoveDistanceUnit() {
            return (this.$store.getters.wheel.currentMove/100) < 1000 ? 'm' : 'km';
        },

        calorieStr() {
            const calorie = this.$store.getters.calorie;
            return calorie.toFixed(1);
        },
        ...mapGetters([
            'device',
            'wheelMoveDistance',
            'wheel',
            'calorie',
            'wheelCount',
            'mode'
        ]),
    },
    methods: {
      onConnectBtnClick: function () {
          this.$router.push('connect-dialog');
      }
    },
    mounted() {

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
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    .top-btns {
      margin-top: 0;
      margin-bottom: 0;
      padding: 0 16px;
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

    #circlePointer {
      padding-bottom: 12px;
      position: relative;
    }

    #wheelDp {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);

      .txt {
        color: #273269;

        span:first-child {
          font-size: 80px;
        }

        span:last-child {
          font-size: 45px;
        }
      }
    }
  }

  .footer {
    display: flex;
    flex: 0 0 0;
    justify-content: space-between;
    padding: 20px 15px 15px 15px;
  }


.footerBtn {
  padding: 0;
  border-radius: 12px;
  background-color: rgba(#384452, 0.8);
  text-align: center;
  height: 125px;
  width: 112px;
  display: flex;
  flex-direction: column;
  &>div:first-child {
    flex: 0;
    color: #2db7bd;
    font-size: 15px;
    line-height: 1.4;
    flex-basis: 80px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  &>div:last-child {
    flex:1 0 0;
    color: #ffffff;
    text-align: center;
    padding: 0 4px;
    font-size: 0;

    &::before {
      content: '';
      display: block;
      margin: 0 auto;
      width: 75%;
      background-color: #626C77;
      height: 1px;
    }
    div {
      display: inline;
      font-size: 16px;
      font-weight: 500;
      line-height: 40px;
    }

    span {
      font-size: 14px;
      margin-left: 2px;
      margin-top: 2px;
      line-height: 38px;
    }
  }
}

</style>

