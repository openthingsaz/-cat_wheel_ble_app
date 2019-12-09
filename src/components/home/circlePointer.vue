<template>
<!--    <div id="circleWrapper" @touchmove="touchMove" @click="click">-->
<!--        <div class="wheelInfo">-->
<!--            <ul class="clear">-->
<!--                <li>-->
<!--                    <span>{{wheelMoveDistanceText}}</span>-->
<!--                    <span class="unit">{{wheelMoveDistanceUnit}}</span>-->
<!--                </li>-->

<!--            </ul>-->
<!--        </div>-->
<!--    </div>-->
  <div id="circleWrapper"  :style="{width: `${size}px`, height: `${size}px`, margin: '0 auto'}"
       @touchmove="touchMove" @click="click">
    <div id="point" :style="{
      transform: `rotate(${(pointAngle)}deg)`,
    }">
        <div :style="{backgroundColor: curColorValue}"></div>
    </div>
    <img src="img/cat_black2.png" id="catBakImg">
  </div>
</template>
<script>
    import { mapGetters } from 'vuex'
    import {setLedPos, write} from "../../assets/js/bleUtill"
    export default {
        name: 'circlePointer',
        data() {
            return {
                isDistroyed: null,
                windowWidth: window.innerWidth,
                windowHeight: window.innerHeight,
                circle: {
                    top:0,
                    height:0
                },
              lastSendDate: (new Date()).getTime(),
                graphTop: 0
            }
        },

        computed:{
            size() {
                var per = 60;
                var wOff = 140;
                var hoff = 440;
                return Math.min(this.windowHeight-hoff, Math.max(this.windowWidth*per*0.01, this.windowWidth-wOff))
            },
          wheelMoveDistance(){
            return this.$store.getters.wheelMoveDistance
          },

          wheelMoveDistanceText(){
            return (this.wheelMoveDistance < 1000 ? this.wheelMoveDistance : this.wheelMoveDistance/1000).toFixed(1)
          },

          wheelMoveDistanceUnit(){
            return this.wheelMoveDistance < 1000 ? 'm' : 'km'
          },

          calorie(){
            return this.$store.getters.calorie.toFixed(1)
          },
          curColorValue() {
              return [
                  "#ffffff",
                  "#1EAA39",
                  "#E50012",
                  "#036EB7",
                  "rgba(0,0,0,0)",
                  this.curColor.color0 || "rgba(0,0,0,0)",
                  this.curColor.color1 || "rgba(0,0,0,0)",
                  this.curColor.color2 || "rgba(0,0,0,0)",
                  "#ffffff"
              ][this.curColor.colorPos || 0];
          },
          ...mapGetters([
              'wheelCount',
              'pointAngle',
              'curColor',
          ]),
        },
        methods: {
            touchMove(e) {
                this.setPointPos(e.touches[0].clientX - (this.windowWidth-this.size)/2, e.touches[0].clientY - 217);
            },
            click(e) {
                this.setPointPos(e.clientX - (this.windowWidth-this.size)/2, e.clientY- 217);
            },
            setPointPos(x1, y1) {
                if (this.curColorValue === "rgba(0,0,0,0)") return;

                x1 -= this.size/2;
                y1 -= this.size*0.442;
                let angle = Math.atan2(y1, x1);
                angle += angle<0 ? Math.PI*2 : 0;
                angle /= Math.PI*2;
                angle = Math.round(angle*360) % 360;
                if (this.pointAngle !== angle) {
                    this.$store.commit('setPointAngle', angle);
                    const now = (new Date()).getTime();
                    const wheel = this.$store.getters.wheel;
                    if (now - this.lastSendDate > wheel.term) {
                        this.lastSendDate = now;
                        angle+=90;
                        angle%=360;
                        const _angle = ((wheel.reverse ? 360 - angle - wheel.offset: angle + wheel.offset) + 360) % 360;
                        setLedPos(this.$store.getters.device && this.$store.getters.device.id, _angle);
                    }
                }
            },


            sendCommend(cmd) {
                if (!this.$store.getters.device) return;

                write(this.$store.getters.device.id, cmd+"\n", function (a, b, c) {
                    console.log("success: ", a);
                }, function (a, b, c) {
                    console.log("failure: ", a, b, c);
                });
            },

            resize() {
                this.windowHeight = window.innerHeight;
                this.windowWidth = window.innerWidth;
            }
        },
        mounted() {
            this.$nextTick(function() {
                window.addEventListener('resize', this.resize);
                this.resize()
            })
        },
        beforeDestroy() {
            window.removeEventListener('resize', this.resize);
        },
    };
</script>
<style lang="scss" scoped>
  #circleWrapper {
    border: 5px solid #515253;
    border-radius: 50%;
    position: relative;
    box-sizing: content-box;
  }

  #point{
    width: 50%;
    height: 50%;
    top: 0;
    left: 50%;
    position: absolute;
    transform-origin: left bottom;
    z-index: 1;
    div{
      position: absolute;
      display: block;
      width: 22px;
      height: 22px;
      bottom: -11px;
      left: 100%;
      transform: translateX(-9px);
      box-sizing: border-box;
      background-color: #fff;
      border-radius: 50%;
      box-shadow: 0 0 4px 2px rgba(0,0,0,0.25);
      }
    }

    #wheel{
      width: 100%;
      display: block;
    }

    #catBakImg {
      width: 100%;
      display: block;
      position: absolute;
      bottom: 0;
      left: 0;
    }
/*
    .wheelInfo{
        position: absolute;
        top: 44.2%;
        left: 0;
        right: 0;
        text-align: center;
        font-size: 24px;
        transform: translateY(-50%);
        color: #ffffff;
        ul{
            list-style: none;
            padding: 0;
        }

        li {
            width: 100%;
            float: left;
            padding: 8px 0;
            span {
                box-sizing: border-box;
                text-align: right;
                width: 58%;
                float: left;
                display: inline-block;
                line-height: 1em;
                font-size: 44px;
                font-weight: bold;
                &.unit {
                    font-size: 20px;
                    padding-top: 20px;
                    padding-left: 8px;
                    width: 42%;
                    line-height: 1em;
                    text-align: left;

                }
            }
        }
    }*/
</style>

