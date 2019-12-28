<template>
  <div class="header-wrapper">
    <div class="header">
      <div class="left">
        <div>
          <div>{{curCat.id !== 0 ? curCat.name : "guest"}}</div>
          <div>{{curCat.id !== 0 ? `${birthAsAgeStr}` : "- weeks"}}</div>
        </div>
      </div>
      <a class="img" @click="$router.push('/setting')">
        <template>
          <img :src="curCat.image || 'img/middle_empty_cat_image.png'"/>
        </template>
<!--        <template v-else>-->
<!--          <img src="img/middle_empty_cat_image.png" />-->
<!--        </template>-->
      </a>
      <div class="right">
        <button class="yes-device" v-if="device && battery >= 0 && mode" @click="setPowerModeAlert">
          <v-progress-circular
            :size="64"
            :width="8"
            color="white"
            :value="battery"
            :rotate="275"
          >
            <b>{{battery}}</b>%
          </v-progress-circular>
        </button>
        <img src="img/right-no-device.png" class="no-device" v-else>
      </div>
    </div>
  </div>
</template>
<script>
    import moment from 'moment';
    import { mapGetters } from 'vuex'
    import {Confirm} from '../../assets/js/dialog'
    import {setPowerMode} from '../../assets/js/bleUtill'
    export default {
        name: 'cat-header',
        data() {
            return {

            }
        },
        methods: {
          exit() {
              Confirm("종료하시겠습니까?", "확인", function() {
                  navigator.app.exitApp();
              })
          },
          setPowerModeAlert() {
              navigator.notification.confirm(this.$store.getters.mode === 1 ? "Do you want to change mode to save mode?" :  "Do you want to change mode to power mode?" , buttonIndex => {
                  const isSaveMode = this.$store.getters.mode === 1 && buttonIndex === 1 || this.$store.getters.mode === 2 && buttonIndex === 2;
                  this.$store.commit('setMode', isSaveMode ? 2 : 1);
                  setPowerMode(
                      this.$store.getters.device.id,
                      isSaveMode
                  );
              }, "Confirm");
          }
        },
        computed: {
            birthAsAgeStr() {
                var diff = moment().unix() - moment(this.$store.getters.curCat.birth).unix();
                if (diff > 3600 * 27 * 365) {
                    var ageOfYear = Math.floor(diff / (3600 * 27 * 365));
                    return `${ageOfYear} year${ageOfYear>1?'s':''}`;
                } else {
                    var ageOfWeek = Math.floor(diff / (3600 * 27 * 7));
                    return `${ageOfWeek} week${ageOfWeek>1?'s':''}`;
                }
            },
            ...mapGetters([
                'curCat', 'mode', 'device', 'battery'
            ])
        },
        mounted() {

        },
    };
</script>
<style lang="scss" scoped>
  .header-wrapper {
    display:flex;
    padding: 40px 24px 32px 24px;
    width: 100%;
  }

  .header {
    display: flex;
    align-items: stretch;
    flex: 1 0 auto;
    border: 1px solid #2db7bd;
    background-color: rgba(#2db7bd, 0.2);
    height:82px;
    border-radius: 46px;

    .img {
      flex: 0 0 80px;
      width: 80px;
      height: 80px;
      img {
        display: block;
        width: 80px;
        height: 80px;
        border-radius: 50%;
        border: 2px solid #fff;
        box-shadow: 0 0 10px 0 #bbdd7c;
      }
    }

    .left {
      flex: 1 1 0;
      display: flex;
      align-items: center;

      &>div {
        text-align: center;
        margin-left: 20px;
        line-height: 1;
        color: #ffffff;
        &>div:first-child {
          font-size: 16px;
          margin-bottom: 4px;
        }

        &>div:last-child {

        }
      }
    }

    .right {
      flex: 1 1 0;
      justify-content: flex-end;
      align-items: center;
      display: flex;
      .no-device {
        width: 80px;
        height: 80px;
      }

      .yes-device {
        width: 80px;
        height: 80px;
        outline: none;
        padding: 0;
      }
    }
  }


    header{
      position: relative;
      margin-top: 12px;
      height: 80px;
    }

    .image {
        position: relative;
        z-index: 2;
        float: left;
        width: 80px;
        height: 80px;
        margin-left: 12px;
        overflow: hidden;
        border: 12px solid #fff;
        border-radius: 50%;
        box-sizing: border-box;
        background-size: cover;
        background-position: center center;
    }

  #catInfoNotFound{
    color: #fff;
    font-size: 18px;
    text-align: center;
    line-height: 80px;
  }
</style>

