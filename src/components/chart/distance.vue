<template>
  <div class="page">
    <header>
      <div class="left">
        <button @click="$router.back()">
          <img src="img/left_arrow.png"/>
        </button>
      </div>
      <div class="center">
        <b>{{curCat.name}}</b>
      </div>
      <div class="right"></div>
    </header>


    <div id="subheader">
      <div>
        Distance
      </div>
    </div>

    <div class="Distance">
     ss

    </div>
    <div class="footer"></div>
  </div>
</template>
<script>
    import { mapGetters } from 'vuex'

    export default {
        components:{
        },
        data: function () {
            return {
            }
        },
        computed: {
            ...mapGetters([
                'curCat'
            ])
        },
        methods: {
        },
        created() {
        },
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
  }

  #subheader {
    height: 36px;
    background-color: #0A3444;
    color: #2EB7BD;
    font-size: 18px;

    &>div {
      display: flex;
      height: 36px;
      justify-content: center;
      align-items: center;
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

  }
</style>

