import Vue from 'vue';
import Vuex from 'vuex';
import moment from 'moment'
Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    mode: null,
    battery: -1,
    colors: localStorage.getItem('_colors') ? JSON.parse(localStorage.getItem('_colors')) : [],
    cats: localStorage.getItem('_cats') ? JSON.parse(localStorage.getItem('_cats')) : [],
    curCatId: 1,
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
      reverse: JSON.parse(localStorage.getItem('_reverse')) || true,
      term: parseInt(localStorage.getItem('_term')) || 100,
      reqTerm: parseInt(localStorage.getItem('_req_term')) || 5000
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
      return state.battery;
    },

    mode(state){
      return state.mode;
    },

    cats(state){
      return state.cats;
    },
    curCatId(state){
      return state.curCatId;
    },
    curCat(state){
      return state.cats.find(cat => cat.id === state.curCatId) ||
        {id: 1, birth: moment().format("YYYY-MM-DD"), weight: null, rib: null, leg: null, image: "img/middle_empty_cat_image.png"};
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
      }
    },

    user(state){
      return state.user;
    },

    wheel(state){
      return state.wheel;
    },

    wheelCount(state) {
      return Math.floor((state.wheel.move + state.wheel.todayMove)/100/1.1/Math.PI);
    },

    wheelMoveDistance(state) {
      return (state.wheel.move + state.wheel.todayMove) / 100;
    },

    calorie(state) {
      if (state.curCatId !== 0) {
        const cat = state.cats.find(cat => cat.id === state.curCatId);
        if (cat && cat.weight) {
          return state.wheel.todayCalorie + (state.wheel.move / 100) * (0.06 + (cat.weight-5)/100)
        }
      }
      return 0
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
      // const now = new Date().getTime()
      // let move = Math.abs(state.wheel.position - pos)
      // if (state.wheel.position === pos) {
      //   return
      // }
      //
      // move = move <= 180 ? move : 360 - move
      // state.wheel.move += move
      // state.wheel.position = pos
      // state.wheel.lastUpdate = now
      //
      // if (!state.wheel.firstUpdate) {
      //   state.wheel.firstUpdate = now
      // }
    },

    resetTmp(state) {
      const cat = state.cats.find(cat => cat.id === state.curCatId);
      state.wheel.firstUpdate = null
      state.wheel.lastUpdate = null
      state.wheel.todayCalorie += (state.wheel.move / 100) * (0.06 + (cat.weight-5)/100);
      state.wheel.todayMove += state.wheel.move
      state.wheel.move = 0
    },

    setTodayWheelData(state, data) {
      state.wheel.todayCalorie = data[0];
      state.wheel.todayMove = data[1];
      state.wheel.move = 0;
    },

    setBattery(state, val) {
      state.battery = val;
    },

    setMode(state, val) {
      state.mode = val;
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
    },
  },
});
