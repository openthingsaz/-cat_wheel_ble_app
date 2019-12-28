<template>
    <div class="page">
      <header>
        <div class="left">
          <button @click="$router.back()">
            <img src="img/left_arrow.png"/>
          </button>
        </div>
        <div class="center">
          <b>the Little Cat</b>
        </div>
        <div class="right">
<!--          <button @click="$router.push('tmp-setting')">-->
<!--            <img src="img/infor_butt.png"/>-->
<!--          </button>-->
        </div>
      </header>
      <div id="battery">
        <div v-if="device && battery >= 0">
          Wheel Battery
          <img :src="batteryInfo.img">
          <span :style="{color:batteryInfo.color}">{{battery}}%</span>
        </div>
        <div class="no-device" v-else>
          Device not connected
        </div>
      </div>
      <div class="body">
        <div id="palette">
          <div class="row" :style="{width: `${windowWidth - 72}px`}">
            <div @click="setColorPos(0)" :class="{item: true, selected: colorInfo.colorPos === 0}" :style="{width: `${paletteSize}px`, height: `${paletteSize}px`, backgroundColor: palette[0]}"></div>
            <div @click="setColorPos(1)" :class="{item: true, selected: colorInfo.colorPos === 1}" :style="{width: `${paletteSize}px`, height: `${paletteSize}px`, backgroundColor: palette[1]}"></div>
            <div @click="setColorPos(2)" :class="{item: true, selected: colorInfo.colorPos === 2}" :style="{width: `${paletteSize}px`, height: `${paletteSize}px`, backgroundColor: palette[2]}"></div>
            <div @click="setColorPos(3)" :class="{item: true, selected: colorInfo.colorPos === 3}" :style="{width: `${paletteSize}px`, height: `${paletteSize}px`, backgroundColor: palette[3]}"></div>
            <div @click="setColorPos(4)" :class="{item: true, offBtn: true, selected: colorInfo.colorPos === 4}" :style="{width: `${paletteSize}px`, height: `${paletteSize}px`}"></div>
          </div>
          <div class="row" :style="{width: `${(windowWidth - 72 - (paletteSize * 5))/4*3+(paletteSize * 4)}px`}">
            <div @click="setColorPos(5)" :class="{item: true, empty: colorInfo.color0 === null, selected: colorInfo.colorPos === 5}" :style="{width: `${paletteSize}px`, height: `${paletteSize}px`, backgroundColor: palette[4]}"></div>
            <div @click="setColorPos(6)" :class="{item: true, empty: colorInfo.color1 === null, selected: colorInfo.colorPos === 6}" :style="{width: `${paletteSize}px`, height: `${paletteSize}px`, backgroundColor: palette[5]}"></div>
            <div @click="setColorPos(7)" :class="{item: true, empty: colorInfo.color2 === null, selected: colorInfo.colorPos === 7}" :style="{width: `${paletteSize}px`, height: `${paletteSize}px`, backgroundColor: palette[6]}"></div>
            <div @click="setColorPos(8)" :class="{item: true, randomBtn: true, selected: colorInfo.colorPos === 8}" :style="{width: `${paletteSize}px`, height: `${paletteSize}px`}"></div>
          </div>
        </div>

        <div style="margin-top: 50px;">
          <color-picker @input="onPickerInput" @change="onPickerChange"/>
        </div>

      </div>
      <img src="img/cat-3.png" id="cat3">
    </div>
</template>
<script>
    import {hex2Rgb, rgb2Hex}  from 'colorsys';
    import colorPicker from './colorPicker.vue'
    import {getDeviceBattery, setLedColor, setLedRandomColor, write} from "../../assets/js/bleUtill"
    import { mapGetters } from 'vuex'

    export default {
        components:{
          'color-picker': colorPicker
        },
        data: function () {
            return {
                paletteSize: 50,
                windowWidth: window.innerWidth,
                windowHeight: window.innerHeight,
                colorInfo: {...this.$store.getters.curColor},
                pickerColor: "#ffffff",
            }
        },
        computed: {
            batteryInfo() {
                let color;
                let img;
                let battery = this.battery;
                if (battery < 5) {
                    color = "#f00";
                    img = "img/charge_bar_0.png";

                } else if (battery < 20) {
                    color = "#f00";
                    img = "img/charge_bar_1.png";

                } else if (battery < 40) {
                    color = "#f00";
                    img = "img/charge_bar_2.png";

                } else if (battery < 60) {
                    color = "#f00";
                    img = "img/charge_bar_3.png";

                } else if (battery < 80) {
                    color = "#f00";
                    img = "img/charge_bar_4.png";
                } else {
                    color = "#f00";
                    img = "img/charge_bar_5.png";
                }

                return {color, img}
            },
            palette() {
                return [
                    "#ffffff",
                    "#36ff00",
                    "#ff0018",
                    "#0062ff",
                    this.colorInfo.color0 || "rgba(0,0,0,0)",
                    this.colorInfo.color1 || "rgba(0,0,0,0)",
                    this.colorInfo.color2 || "rgba(0,0,0,0)"
                ]
            },
            ...mapGetters([
                'curCat', 'battery', 'curColor', 'device'
            ])
        },
        methods: {
            onPickerChange(e) {
                if (this.colorInfo.colorPos === 5) {

                    this.save(e);
                } else if (this.colorInfo.colorPos === 6) {
                    this.save(e);
                } else if (this.colorInfo.colorPos === 7) {
                    this.save(e);
                }
            },
            setColorPos(idx) {
                this.colorInfo.colorPos = idx;
                let color;
                if (idx === 8) {
                    // random color
                    setLedRandomColor(this.$store.getters.device && this.$store.getters.device.id);
                    return;
                } else if (idx === 4) {
                  color = "#000000";
                } else if (idx < 4) {
                    color = ["#ffffff", "#36ff00", "#ff0018", "#0062ff",][idx]
                } else {
                    if (this.colorInfo.colorPos === 5) {
                        if (this.colorInfo.color0 === null) {
                          color = this.colorInfo.color0 = this.pickerColor;
                        } else {
                          color = this.colorInfo.color0;
                        }
                    } else if (this.colorInfo.colorPos === 6) {
                        if (this.colorInfo.color1 === null) {
                          color = this.colorInfo.color1 = this.pickerColor;
                        } else {
                          color = this.colorInfo.color1;
                        }
                    } else if (this.colorInfo.colorPos === 7) {
                        if (this.colorInfo.color2 === null) {
                          color = this.colorInfo.color2 = this.pickerColor;
                        } else {
                          color = this.colorInfo.color2;
                        }
                    }
                }
                this.save(color);
            },

            save(color) {
                this.$store.commit('setColor', this.colorInfo);
                const parsedColor = hex2Rgb(color);
                setLedColor(this.$store.getters.device && this.$store.getters.device.id, parsedColor.r, parsedColor.g, parsedColor.b);
            },

            onPickerInput(e) {
                this.pickerColor = e;
                if (this.colorInfo.colorPos === 5) {
                    this.colorInfo.color0 = e;
                } else if (this.colorInfo.colorPos === 6) {
                    this.colorInfo.color1 = e;
                } else if (this.colorInfo.colorPos === 7) {
                    this.colorInfo.color2 = e;
                }
            },
            sendCommend(cmd) {
                if (!this.$store.getters.device) return;
                write(this.$store.getters.device.id, cmd+"\n", function (a, b, c) {
                    console.log("success: ", a, b, c);
                }, function (a, b, c) {
                    console.log("failure: ", a, b, c);
                });
            },
            resize() {
                this.windowHeight = window.innerHeight;
                this.windowWidth = window.innerWidth;
            }
        },
        created() {
            document.addEventListener("resize", this.resize);
        },
        mounted(){

        },
        destroyed() {
            document.removeEventListener("resize", this.resize);
        },
    };
</script>
<style lang="scss" scoped>
  #cat3 {
    position: fixed;
    bottom: 0;
    right: 25px;
    width: 100px;
  }
  .page {
    height: 100vh;
    max-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  header {
    flex: 0 0 auto;
    height: 44px;
    display: flex;
    align-items: center;

    .center {
      text-align: center;
      flex: 0 0 auto;
      color: #2db7bd;
    }

    .left, .right {
      padding-top: 5px;
      flex: 1 1 0;

      button {
        outline: none;
        height: 44px;
        padding: 0 16px;
        margin:0 16px;

        img {
          display: block;
          width: 12px;
        }
      }
    }

    .right {
      text-align: right;
      & button > img{
        width: 26px;

      }
    }
  }

  #battery {
    height: 36px;
    background-color: #0A3444;
    color: #2EB7BD;
    font-size: 18px;

    &>div {
      display: flex;
      height: 36px;
      justify-content: center;
      align-items: center;
      img {
        margin: 0 12px;
        width: 36px;
      }
    }

    .no-device {
      font-size: 16px;
    }

  }

  .body {
    flex: 1 1 auto;
    overflow-y: scroll;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding-bottom: 90px;
  }

  #palette{
    .row {
      margin-top: 16px;
      margin-right: auto;
      margin-left: auto;
      display: flex;
      justify-content: space-between;

      .item {
        position: relative;
        border-radius: 50%;
        background-repeat: no-repeat;
        background-position: center center;
        background-size: contain;

        &.empty {
          background-image: url(../../../static/img/addible_empty_circle.png);
        }

        &.offBtn {
          background-image: url(../../../static/img/off_button.png);
        }

        &.randomBtn {
          background-image: url(../../../static/img/rainbow_circle_white.png);
        }

        &.selected::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-repeat: no-repeat;
          background-position: center center;
          background-size: contain;
          background-image: url(../../../static/img/rainbow_circle.png);
        }

      }
    }
  }

  .footer {
    display: flex;
    flex: 0 0 0;
    justify-content: space-between;
    padding: 12px;

    button {
      flex: 0 0 0;
      color: #fff;
      background-color: #2db7bd;
      height: 32px;
      border-radius: 16px;
      min-width: 80px;
      padding: 0 12px;

    }
  }




  .btns{
    padding-left: 16px;
    padding-right: 16px;
    .btn-precolor{
      margin-top: 16px;
      button{
        width: 100%;
        color: #ffffff;
        margin: 0;
      }
    }
  }

  .custom-color{
    padding: 24px;
    .subheading{
      color: #ffffff;
    }

    .vc-slider{
      width: 100%;
      margin-top: 16px;
    }
  }

</style>

