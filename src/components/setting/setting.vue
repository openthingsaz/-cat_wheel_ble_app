<template>
    <div class="page" id="setting">
      <v-bottom-sheet v-model="bottomSheet">
        <v-list>
          <v-subheader>Selection</v-subheader>
          <v-list-tile
            @click="pickImage(1)"
          >
            <v-list-tile-avatar>
              <v-list-tile-action>
                <v-icon>photo_camera</v-icon>
              </v-list-tile-action>
            </v-list-tile-avatar>
            <v-list-tile-title>Take a Photo</v-list-tile-title>
          </v-list-tile>

          <v-list-tile
            @click="pickImage(0)"
          >
            <v-list-tile-avatar>
              <v-list-tile-action>
                <v-icon>photo_library</v-icon>
              </v-list-tile-action>
            </v-list-tile-avatar>
            <v-list-tile-title>Photo Album</v-list-tile-title>
          </v-list-tile>

          <v-list-tile
            @click="deleteImage"
          >
            <v-list-tile-avatar>
              <v-list-tile-action>
                <v-icon>delete</v-icon>
              </v-list-tile-action>
            </v-list-tile-avatar>
            <v-list-tile-title>Delete Photo</v-list-tile-title>
          </v-list-tile>
        </v-list>
      </v-bottom-sheet>
      <header>
        <div class="left">
          <button @click="$router.back()">
            <img src="img/left_arrow.png"/>
          </button>
        </div>
        <div class="center">
          <b>{{title}}</b>
        </div>
        <div class="right"></div>
      </header>
      <div class="body">
        <div id="catImg">
          <button :class="{hidden:isFirst}" @click="() => !isFirst && prevCat()" class="left">
            <img src="img/left_arrow_cat.png"/>
          </button>
          <img :src="catForm.image" @click="bottomSheet=true" />
          <button :class="{hidden:isLast}" @click="() => !isLast && nextCat()" class="right">
            <img src="img/right_arrow_cat.png"/>
          </button>
        </div>

        <div id="catProfile" class="cw-list">
          <div class="cw-list-title">
            Cat profile
          </div>

          <ul>
            <li>
              <span class="cw-list-label">Name</span>
              <span class="cw-list-value">
                <input class="cw-list-input" type="text" v-model="catForm.name">
              </span>
            </li>
            <li>
              <span class="cw-list-label">Birthday</span>
              <span class="cw-list-value" style="overflow: hidden">
                <input class="cw-list-input" style="margin-right: -20px; width: 110px; border:none" type="date" v-model="catForm.birth">
              </span>
            </li>
          </ul>
        </div>
        <div id="catBMI" class="cw-list">
          <div class="cw-list-title">
            Learn the Cat <b>BMI</b> <span class="sub">(Body Mass Index)</span>
          </div>

          <img src="img/learn_the_cat_bmi.png" id="BMIInfo" />
          <ul>
            <li>
              <span class="cw-list-label">Body weight</span>
              <span class="cw-list-value">
                <input style="width: 30px" class="cw-list-input" type="number" v-model="catForm.weight">kg
              </span>
            </li>
            <li>
              <span class="cw-list-label">Rib cage</span>
              <span class="cw-list-value">
                <input style="width: 30px" class="cw-list-input" type="number" v-model="catForm.rib">cm
              </span>
            </li>
            <li>
              <span class="cw-list-label">Lower leg</span>
              <span class="cw-list-value">
                <input style="width: 30px" class="cw-list-input" type="number" v-model="catForm.leg">cm
              </span>
            </li>
            <li class="border-top">
              <span class="cw-list-label">BMI (Body Mass Index)</span>
              <span class="cw-list-value" :style="{color: BMIInfo.color}" v-if="BMIInfo.validated">
                {{BMIInfo.bmi}} ({{BMIInfo.text}})
              </span>
              <span class="cw-list-value" v-else>
                -
              </span>
            </li>
          </ul>
        </div>
      </div>
      <div class="footer">
        <button @click="setGuest">Guest</button>
        <button @click="deleteCat">Delete</button>
        <button @click="saveCat">Save</button>
      </div>
    </div>
</template>
<script>
  import moment from 'moment'
  import {Alert, Confirm} from "../../assets/js/dialog"
    export default {
        components: {},
        data: function () {
            const curCat = this.$store.getters.curCat;
            return {
                bottomSheet: false,
                catForm: {...curCat},
                curViewCatId: curCat.id
            }
        },
        computed: {
            BMIInfo() {
                let bmi, color, text;

                if (!this.catForm.rib || !this.catForm.leg) {
                    return {
                        validated: false
                    }
                }

                bmi = ((((this.catForm.rib/0.7062) - this.catForm.leg) / 0.9156) - this.catForm.leg)

                if (bmi <= 10) {
                    color = "#000";
                    text = "Under";
                } else if (bmi <= 30) {
                    color = "#AAC24C";
                    text = "Normal";
                } else{
                    color = "#FF3534";
                    text = "Over";
                }

                bmi = bmi.toFixed(1);
                return {
                    validated: true,
                    bmi, color, text
                }
            },

            cats() {
                return this.$store.getters.cats.sort((a, b) => a.id - b.id);
            },
            isFirst() {
                if (this.cats.length === 0)
                    return true;

                if (this.curViewCatId === 0)
                    return false;

                for (const cat of this.cats)
                    if (cat.id < this.curViewCatId)
                        return false;
                return true;
            },
            isLast() {
                return this.curViewCatId === 0;
            },
            title() {
                return this.curViewCatId === 0 ? "the Little Cat" : this.catForm.name;
            }
        },
        methods: {
            prevCat() {
                let idx = 0;
                if (this.curViewCatId === 0) {
                    const cat = this.cats[this.cats.length-1];
                    this.curViewCatId = cat.id;
                    this.catForm = cat;
                    return;
                }

                for (const cat of this.cats) {
                    if (cat.id === this.curViewCatId) {
                        this.curViewCatId = this.cats[idx - 1].id;
                        this.catForm = this.cats.find(item => item.id === this.curViewCatId);
                        return;
                    }
                    idx++;
                }
            },
            nextCat() {
                let idx = 0;
                for (const cat of this.cats) {
                    if (cat.id === this.curViewCatId) {
                        if (idx +1 === this.cats.length) {
                            this.curViewCatId = 0;
                            this.catForm = {id: 0, birth: moment().format("YYYY-MM-DD"), weight: null, rib: null, leg: null, image: "img/middle_empty_cat_image.png"};
                        } else {
                            this.curViewCatId = this.cats[idx + 1].id;
                            this.catForm = this.cats.find(item => item.id === this.curViewCatId);
                        }
                        return;
                    }
                    idx++;
                }
            },
            setGuest() {
                this.$store.commit('setCatId', 0);
                this.$router.back();
            },
            deleteCat() {
                if (this.curViewCatId === 0) return;
                Confirm("The stored information will be deleted. Are you sure you want to delete?", "delete", () => {
                    if (this.$store.getters.curCatId === this.curViewCatId) {
                        this.$store.commit('setCatId', 0);
                    }

                    this.$store.commit('deleteCat', this.curViewCatId);
                    this.curViewCatId = 0;
                    this.catForm = {id: 0, birth: moment().format("YYYY-MM-DD"), weight: null, rib: null, leg: null, image: "img/middle_empty_cat_image.png"};
                })
            },
            saveCat() {
                if (this.catForm.name.trim().length === 0) {
                    Alert("There is no name.", "Warning")
                    return;
                }
                const id = this.curViewCatId === 0 ? new Date().getTime() : this.curViewCatId;
                this.$store.commit('setCatId', id);
                this.$store.commit('setCat', {
                    id,
                    name: this.catForm.name,
                    birth: this.catForm.birth,
                    weight: this.catForm.weight,
                    rib: this.catForm.rib,
                    leg: this.catForm.leg,
                    image: this.catForm.image
                });
                this.catForm.id = id;
                this.curViewCatId = id;
                this.$router.back();
            },
            pickImage(type){
                navigator.camera.getPicture((a, b, c)=>{
                    this.catForm.image = `data:image/jpeg;base64,${a}`
                }, (a, b, c)=>{
                    console.error(a, b, c);
                }, {
                    quality: 100,
                    destinationType: 0,
                    allowEdit: true,
                    sourceType: type,
                    targetWidth: 500,
                    targetHeight: 500,
                });

                this.bottomSheet = false;
            },
            deleteImage() {
                this.catForm.image = "img/middle_empty_cat_image.png";
                this.bottomSheet = false;
            }
        }
    };
</script>
<style lang="scss" scoped>

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

    .left {
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
      padding-top: 5px;
      flex: 1 1 0;
    }
  }

  .body {
    flex: 1 1 auto;
    overflow-y: scroll;
    display: flex;
    flex-direction: column;
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

  #catImg{
    display: flex;
    justify-content: space-between;
    margin-top: 8px;

    & > img {
      width: 95px;
      height: 95px;
      border-radius: 50%;
      margin: 0 auto;
      display: block;
    }

    &>button {
      &>img {
        width: 40px;
        display: block;
      }

      &.left {
        padding-left: 16px;
      }

      &.right {
        padding-right: 16px;
      }

      &.hidden {
        visibility: hidden;
      }
    }
  }

  #catBMI {
    margin-top: 24px;

    .sub {
      font-size: 10px;
    }

    .border-top {
      border-top: 1px solid #ddd;
    }
  }

  #BMIInfo {
    display: block;
    margin: 4px auto;
    box-sizing: border-box;
    width: 72%;
  }




</style>

