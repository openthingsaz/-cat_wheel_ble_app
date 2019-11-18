<template>
  <div class="page pt-4 pl-3 pr-3">
    <form @submit.prevent="submit" novalidate>
      <v-layout row wrap>
        <v-flex xs6 class="pr-2">
          <v-btn color="white" round  block :outline="reverse" @click="setReverse(false)">A -&gt; B</v-btn>
        </v-flex>
        <v-flex xs6 class="pl-2">
          <v-btn color="white" round  block :outline="!reverse" @click="setReverse(true)">B -&gt; A</v-btn>
        </v-flex>

        <v-flex xs12>
          <v-text-field
            label="Offset"
            color="white"
            suffix="deg"
            dark
            v-model="offset"
          ></v-text-field>
        </v-flex>

        <v-flex xs12>
          <v-text-field
            label="Term"
            color="white"
            suffix="ms"
            dark
            v-model="term"
          ></v-text-field>
        </v-flex>

        <v-flex xs12>
          <v-text-field
            label="Position Request Term"
            color="white"
            suffix="ms"
            dark
            v-model="reqTerm"
          ></v-text-field>
        </v-flex>

        <v-flex xs12 class="wrapper">
          <v-btn light type="submit" class="item-right mr-0">SAVE</v-btn>
        </v-flex>

      </v-layout>
    </form>
  </div>
</template>
<script>
  export default {
    components:{
    },
    data: function () {
      const wheel = this.$store.getters.wheel
      return {
        offset: wheel.offset,
        term: wheel.term,
        reqTerm: wheel.reqTerm,
        reverse: wheel.reverse,
      }
    },
    methods: {
      submit() {
        this.$store.commit('setReverse', this.reverse);
        this.$store.commit('setTerm', parseInt(this.term));
        this.$store.commit('setOffset', parseInt(this.offset) % 360);
        this.$store.commit('setReqTerm', parseInt(this.reqTerm));
        this.$router.replace("/")
      },
      setReverse(state) {
        this.reverse = state;
      }

    },
    created() {

    }
  };
</script>
<style lang="scss" scoped>

</style>

