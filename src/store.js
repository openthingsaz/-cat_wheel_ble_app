import Vue from 'vue';
import Vuex from 'vuex';
import moment from 'moment'
import {hsv_to_rgb} from 'colorsys'
import {write} from './assets/js/bleUtill'
Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    battery: 30,
    colors: localStorage.getItem('_colors') ? JSON.parse(localStorage.getItem('_colors')) : [],
    cats: localStorage.getItem('_cats') ? JSON.parse(localStorage.getItem('_cats')) : [],
    curCatId: localStorage.getItem('_curCatId') ? parseInt(localStorage.getItem('_curCatId')) : 0,
    isBackButtonDisabled: false,
    user: JSON.parse(localStorage.getItem('_user')),
    point: {
      "angle": 0,
      random: {
        hex: "",
        timer: 0,
        count: 0,
      },
    },
    device: JSON.parse(localStorage.getItem('device')),
    wheel: {
      insertTimeout: null,
      transaction: false,
      todayMove: 0,
      todayCalorie: 0,
      firstUpdate: null,
      lastUpdate: null,
      move: 0,
      position: null,
      offset: parseInt(localStorage.getItem('_offset')) || 0,
      reverse: JSON.parse(localStorage.getItem('_reverse')) || false,
      term: parseInt(localStorage.getItem('_term')) || 0,
      reqTerm: parseInt(localStorage.getItem('_req_term')) || 500
    },
  },

  actions: {
  },

  getters: {
    isBackButtonDisabled(state){
      return state.isBackButtonDisabled
    },

    device(state){
      return state.device
    },

    pointAngle(state) {
      return state.point.angle;
    },

    battery(state){
      return state.battery
    },

    cats(state){
      return state.cats;
    },
    curCatId(state){
      return state.curCatId;
    },
    curCat(state){
      return state.curCatId === 0 ?
        {id: 0, birth: moment().format("YYYY-MM-DD"), weight: null, rib: null, leg: null, image: "img/middle_empty_cat_image.png"} :
        state.cats.find(cat => cat.id === state.curCatId);
    },
    curColor(state) {
      let color;
      color = state.colors.find(item => item.id === state.curCatId);
      return color || {
        id: state.curCatId,
        colorPos: null,
        color0: null,
        color1: null,
        color2: null,
        autoOff: false,
        timeoutSec:null
      }
    },

    user(state){
      return state.user;
    },

    wheel(state){
      return state.wheel;
    },

    wheelCount(state) {
      return Math.floor((state.wheel.move + state.wheel.todayMove)/360);
    },

    wheelMoveDistance(state) {
      return (state.wheel.move + state.wheel.todayMove) / 360 * 1.1 * Math.PI;
    },

    calorie(state) {
      if (state.curCatId !== 0) {
        const cat = state.cats.find(cat => cat.id === state.curCatId);
        return state.wheel.todayCalorie + (state.wheel.move / 360 * 1.1 * Math.PI) * (0.06 + (cat.weight-5)/100)
      } else{
        return 0
      }
    }
  },

  mutations: {
    disableBackButton(state){
      state.isBackButtonDisabled = true;
    },

    activeBackButton(state){
      state.isBackButtonDisabled = false;
    },

    setDevice(state, device) {
      state.device = device;
      if (device){
        localStorage.setItem('device', JSON.stringify(device));
      } else{
        localStorage.removeItem('device');
      }
    },

    setPointAngle(state, angle) {
      state.point.angle = angle;
    },

    deleteCat(state, id) {
      state.cats = state.cats.filter(item => item.id !== id);
      state.colors = state.colors.filter(item => item.catId !== id);
      localStorage.setItem("_cats", JSON.stringify(state.cats))
      localStorage.setItem("_colors", JSON.stringify(state.colors))
    },

    setCat(state, cat) {
      state.cats = state.cats.filter(item => item.id !== cat.id).concat(cat);
      localStorage.setItem("_cats", JSON.stringify(state.cats))
    },

    setCatId(state, id) {
      state.curCatId = id;
      state.wheel.move = 0;
      localStorage.setItem("_curCatId", id)
    },

    setColor(state, color) {
      state.colors = state.colors.filter(item => item.id !== color.id).concat(color);
      clearInterval(state.point.random.timer);
      state.point.random.timer = 0;
      state.point.random.count = 0;
      localStorage.setItem("_colors", JSON.stringify(state.colors))
    },


    setUser(state, user) {
      state.user = user;
      localStorage.setItem("_user", JSON.stringify(state.user))
    },

    logout(state){
      state.user = null
      localStorage.removeItem("_user")
      localStorage.removeItem("_cat")
    },

    setWheelPos(state, pos) {
      const now = new Date().getTime()
      let move = Math.abs(state.wheel.position - pos)
      if (state.wheel.position === pos) {
        return
      }

      move = move <= 180 ? move : 360 - move
      state.wheel.move += move
      state.wheel.position = pos
      state.wheel.lastUpdate = now

      if (!state.wheel.firstUpdate) {
        state.wheel.firstUpdate = now
      }
    },

    resetTmp(state) {
      const cat = state.cats.find(cat => cat.id === state.curCatId);
      state.wheel.firstUpdate = null
      state.wheel.lastUpdate = null
      state.wheel.todayCalorie += (state.wheel.move / 360 * 1.1 * Math.PI) * (0.06 + (cat.weight-5)/100);
      state.wheel.todayMove += state.wheel.move
      state.wheel.move = 0
    },

    setTodayWheelData(state, data) {
      state.wheel.todayCalorie = data[0];
      state.wheel.todayMove = data[1];
      state.wheel.move = 0;
    },

    startRandomColor(state){
      const update = ()=>{
        let count = state.point.random.count;
        console.log(count, 99, 100);
        let {r,g,b} = hsv_to_rgb(count, 99, 100)
        state.point.random.hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        const cmd = `RGB${(r+"").padStart(3, "0")},${(g+"").padStart(3, "0")},${(b+"").padStart(3, "0")}`;
        write(state.device.id, cmd+"\n");

        if (count === 360) {
          state.point.random.count = 0;
        }
        state.point.random.count++;
      }

      clearInterval(state.point.random.timer);
      state.point.random.count = 0;
      state.point.random.timer = setInterval(update, 1000/30)
    },



    // setting
    setOffset(state, offset) {
      state.wheel.offset = offset;
      localStorage.setItem("_offset", offset)
    },

    setReverse(state, reverse) {
      state.wheel.reverse = reverse;
      localStorage.setItem("_reverse", reverse)
    },

    setTerm(state, term) {
      state.wheel.term = term;
      localStorage.setItem("_term", term)
    },

    setReqTerm(state, term) {
      state.wheel.reqTerm = term;
      localStorage.setItem("_req_term", term)
    }
  },
});
