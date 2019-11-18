<template>
  <div class="wheel-picker">
    <main class="wheel-picker--main">
      <div class="wheel-picker--main--wheelbox">
        <div class="wheel" ref="parent" @touchend="onTouchEnd" @touchstart="onTouchMove" @touchmove="onTouchMove" :style="{ width: wheelSize + 'px', height: wheelSize + 'px', position: 'relative', margin: '0 auto'}">
          <img :src="image.src" alt="Color Wheel" :style="image.style" draggable="false"/>
          <span class="wheel--picker" :style="{
            width: pickerSize + 'px',
            height: pickerSize + 'px',
            backgroundColor: 'white',
            borderRadius: '50%',
            border: '1px solid black',
            top: pickerTop === null ? '50%' : pickerTop + 'px',
            left: pickerTop === null ? '50%' : pickerLeft + 'px',
            position: 'absolute',

            transform: pickerTop === null ? 'translate(-4px, -4px)' : ''
           }"></span>
        </div>
      </div>
    </main>
  </div>
</template>
<script>
  import {rgb_to_hsv, hsv_to_rgb, hsv2Hex} from 'colorsys'
  export default {
      data: function() {
          return {
              wheelSize: 300,
              pickerSize: 8,
              pickerTop: null,
              pickerLeft: null,
              image: {
                  src: 'img/palette.png',
                  style: {
                      width: '100%', height: 'auto', 'user-select': 'none'
                  }
              },
              color: "#ffffff"
          }
      },
      methods: {
          onTouchMove(e) {
              let parent = this.$refs.parent;
              let offsetX = parent.getBoundingClientRect().left,
                  offsetY = parent.getBoundingClientRect().top

              let clientX = e.changedTouches[0].clientX;
              let clientY = e.changedTouches[0].clientY;
              let x = Math.round(clientX - offsetX),
                  y = Math.round(clientY - offsetY);
              this.captureMovement(x, y);
              return true;
          },

          onTouchEnd() {
              console.log("change" + this.color);
              this.$emit('change',this.color);
          },

          hsbHue: function(hue) {
              hue = hue * 180 / Math.PI

              let map = {}, to, from, a, b, c, d

              from = [[0, 60],  [60, 120],  [120, 240], [240, 360]]
              to = [[0, 120], [120, 180], [180, 240], [240, 360]]

              if (hue === 360) {
                  return hue
              }

              for (let x in to) {
                  if (hue >= to[x][0] && hue <= to[x][1]) {
                      a = to[x][0]
                      b = to[x][1]
                      c = from[x][0]
                      d = from[x][1]
                  }
              }

              return c + (hue - a) * ((d - c)/(b - a))
          },

          captureMovement: function(x, y) {
              let maxR = this.wheelSize / 2
              let rx = maxR - x,
                  ry = maxR - y

              let r = Math.sqrt(rx * rx + ry * ry)
              let angle = Math.atan2(ry, rx)

              angle = angle < 0 ? angle += Math.PI * 2 : angle

              if (r > maxR) {
                  r = maxR
                  x = (maxR - (maxR * Math.cos(angle)))
                  y = (maxR - (maxR * Math.sin(angle)))
              }

              x = Math.round(x)
              y = Math.round(y)

              const h = this.hsbHue(angle)
              const s = Math.floor((r / maxR) * 100)

              this.pickerLeft = x - (this.pickerSize / 2)
              this.pickerTop = y - (this.pickerSize / 2)

              this.color = hsv2Hex(h, s, 100);
              this.$emit('input',this.color);
              console.log('input', this.color);
          }
      }
  };
</script>
<style lang="scss" scoped>
  .color-picker {
    width: 100%;
    position: relative;

    .preview{
      box-sizing: border-box;
      position: absolute;
      left: 4px;
      top: 0;
      width: 48px;
      height: 58px;
      border: rgba(0, 0, 0, 0.1) 1px solid;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
    }
    .controls{
      padding-left: 64px;
      .control {
        box-sizing: border-box;
        width: 100%;
        height: 20px;
        border-radius: 11px;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);

        & + .control {
          margin-top: 18px;
        }

        input[type=range] {
          -webkit-appearance: none;
          width: 100%;
          background: transparent;
          margin: 0;

          &:focus {
            outline: none;
          }

          &::-webkit-slider-thumb {
            box-sizing: border-box;
            -webkit-appearance: none;
            border: 1px solid #ddd;
            height: 20px;
            width: 20px;
            border-radius: 7px;
            background: #ffffff;
            cursor: pointer;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
          }
        }
      }

    }
  }
</style>

