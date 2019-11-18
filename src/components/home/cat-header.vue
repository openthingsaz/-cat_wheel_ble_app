<template>
  <div class="header-wrapper">
    <div class="header">
      <div class="left">
        <img src="img/cat_head.png">
        <div>
          <div>{{curCat.id !== 0 ? curCat.name : "guest"}}</div>
          <div>{{curCat.id !== 0 ? `${birthAsAgeStr}` : "- weeks"}}</div>
        </div>
      </div>
      <a class="img" @click="$router.push('/setting')">
        <template>
          <img :src="curCat.image"/>
        </template>
<!--        <template v-else>-->
<!--          <img src="img/middle_empty_cat_image.png" />-->
<!--        </template>-->
      </a>
      <div class="right">
        <button @click="exit"><img src="img/right_off_button.png"/></button>
      </div>
    </div>
  </div>
<!--    <div class="clear">-->
<!--      <div v-if="cat" @click="$router.push('/setting')">-->
<!--        <div class="image" :style="{'background-image': `url()`}"></div>-->
<!--        <div class="barBg"></div>-->
<!--        <div class="bar">-->
<!--          <div class="nameLabel">-->
<!--            <div class="name">{{cat.name}}</div>-->
<!--          </div>-->
<!--          <div class="ageLabel">-->
<!--            <span class="age">{{birthAsAgeWeek}}</span>-->
<!--            <span>Week</span>-->
<!--          </div>-->
<!--        </div>-->
<!--        <div class="weightLabel">-->
<!--          <div class="weight">-->
<!--            {{weightBeforeDot}}.<span class="afterDot">{{weightAfterDot}}</span>-->
<!--          </div>-->
<!--          <div class="unit">kg</div>-->
<!--        </div>-->
<!--      </div>-->
<!--      <div id="catInfoNotFound" v-else>-->
<!--        <span v-if="$route.path==='/edit-cat-info'">고양이 정보를 설정해 주세요.</span>-->
<!--        <v-btn raised color="white" v-else @click="$router.push('/edit-cat-info')">고양이 정보를 설정해 주세요.</v-btn>-->
<!--      </div>-->
<!--    </div>-->
</template>
<script>
    import moment from 'moment';
    import { mapGetters } from 'vuex'
    import {Confirm} from '../../assets/js/dialog'
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
                'curCat',
            ])
        },
        mounted() {

        },
    };
</script>
<style lang="scss" scoped>
  .header-wrapper {
    display:flex;
    padding: 32px;
    width: 100%;
  }

  .header {
    display: flex;
    align-items: stretch;
    flex: 1 0 auto;
    border: 1px solid #2db7bd;
    background-color: #093140;
    height:84px;
    border-radius: 42px;


    .img {
      flex: 0 0 82px;
      width: 82px;
      height: 82px;
      img {
        display: block;
        width: 82px;
        height: 82px;
        border-radius: 50%;
      }
    }

    .left {
      flex: 1 1 0;
      display: flex;
      align-items: center;

      img {
        width: 28px;
        display: block;
        margin-left: 12px;
      }

      &>div {
        margin-left: 16px;
        line-height: 20px;
        color: #ffffff;
      }
    }

    .right {
      flex: 1 1 0;
      justify-content: flex-end;
      align-items: center;
      display: flex;
      button {
        width: 60px;
        height: 60px;
        margin-right: 8px;
        outline: none;
        padding: 0;
        img {
          width: 60px;
          height: 60px;
        }
      }
    }
  }


    header{
      position: relative;
      margin-top: 12px;
      height: 90px;
    }

    .image {
        position: relative;
        z-index: 2;
        float: left;
        width: 90px;
        height: 90px;
        margin-left: 12px;
        overflow: hidden;
        border: 12px solid #fff;
        border-radius: 50%;
        box-sizing: border-box;
        background-size: cover;
        background-position: center center;
    }

    .barBg{
        z-index: 1;
        position: absolute;
        top: 0;
        left: 55px;
        right: 55px;
        background-color: #ffffff;
        height: 24px;
    }
    .bar{
        z-index: 3;
        position: absolute;
        top: 0;
        left: 94px;
        right: 94px;
        height: 24px;
        line-height: 24px;
        color: #0090ff;
        font-size: 16px;
        letter-spacing: -1px;
        .nameLabel{
            float: left;
        }

        .ageLabel{
            float: right;
        }
    }

    .weightLabel{
        position: relative;
        z-index: 2;
        float: right;
        width: 90px;
        height: 90px;
        border-radius: 50%;
        margin-right: 12px;
        background-color: #ffffff;
        color: #0090ff;

        .weight{
            position: absolute;
            top: 0;
            bottom: 0;
            left: 0;
            right: 4px;
            line-height:96px;
            font-size: 36px;
            text-align: center;
            letter-spacing: -2px;
            span{
                font-size: 18px;
            }
        }

        .unit{
            position: absolute;
            right: 12px;
            top: 15px;
            font-size: 20px;
        }
    }

  #catInfoNotFound{
    color: #fff;
    font-size: 18px;
    text-align: center;
    line-height: 90px;
  }
</style>

