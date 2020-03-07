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
      <div class="right"></div>
    </header>
    <div id="subheader">
      <div>
        Today's
        Burnt
        Calories
      </div>
    </div>
    <div id="chartButtons">
      <button :class="{active: chartView===0}" @click="loadData(0)">DAILY</button>
      <button :class="{active: chartView===1}" @click="loadData(1)">WEEKLY</button>
      <button :class="{active: chartView===2}" @click="loadData(2)">MONTHLY</button>
    </div>
    <div id="chartTitle">
      <button @click="prevDate()">
        <img src="img/left_arrow_cat.png">
      </button>
      <span>{{chartTitle}}</span>
      <button @click="nextDate()">
        <img src="img/right_arrow_cat.png">
      </button>
    </div>
    <div id="chart">
      <chart :chart-data="chartData" :options="chartOptions" :height="chartHeight"></chart>
    </div>
    <div class="safe-bottom"></div>
  </div>
</template>
<script>
    import {mapGetters} from 'vuex'
    import {connect} from '../../assets/js/db'
    import moment from 'moment'
    import chart from './chart.vue'

    export default {
        components: {chart: chart},
        data: function () {
            return {
                chartData: null,
                chartHeight: window.innerHeight - 200,
                chartOptions: {
                    layout: {
                        padding: {
                            left: 8,
                            right: 16,
                            top: 16,
                            bottom: 0
                        }
                    },
                    animation: {
                        duration: 0
                    },
                    legend: {
                        display: false
                    },
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true,
                                suggestedMin: 0,
                                stepSize: 0.1,
                                fontColor: '#fff',
                            },
                            scaleLabel: {
                                display: true,
                                labelString: "Calories Burned (kcal)",
                                fontColor: "rgba(255,255,255,0.7)",
                                padding: 0
                            },
                            gridLines: {
                                display: true,
                                color: "rgba(255,255,255,0.1)",
                                zeroLineWidth:2,
                                zeroLineColor: "rgba(255,255,255,0.4)",
                            },

                        }],
                        xAxes: [{
                            ticks: {
                                fontColor: "#FFFFFF",
                            },
                            gridLines: {
                                display: true,
                                color: "rgba(255,255,255,0.1)",
                                zeroLineWidth:2,
                                zeroLineColor: "rgba(255,255,255,0.4)",
                            },

                        }]
                    }
                },
                dataSet: {},
                chartView: -1,
                curDate: moment().startOf('day').unix() * 1000
            }
        },
        computed: {
            chartTitle: function () {
                if (this.chartView === 0) {
                    return moment(this.curDate).format('YYYY-MM-DD');
                } else if (this.chartView === 1) {
                    const curDate = moment(this.curDate);
                    const  stDate = curDate.clone().startOf('week');
                    const  enDate = stDate.clone().date(stDate.date()+6);

                    const stDateInfo = [stDate.year(), stDate.month(), stDate.date()];
                    const enDateInfo = [enDate.year(), enDate.month(), enDate.date()];
                    if (stDateInfo[0] === enDateInfo[0] && stDateInfo[1] === enDateInfo[1]) {
                        return stDate.format('YYYY-MM-DD') + ' ~ ' + enDate.format('DD');
                    } else if (stDateInfo[0] === enDateInfo[0]) {
                        return stDate.format('YYYY-MM-DD') + ' ~ ' + enDate.format('MM-DD');
                    } else {
                        return stDate.format('YYYY-MM-DD') + ' ~ ' + enDate.format('YYYY-MM-DD');
                    }
                } else if (this.chartView === 2) {
                    return moment(this.curDate).format('MMM YYYY');
                }
            },
            ...mapGetters([
                'curCat'
            ])
        },
        methods: {
            dump() {
                const stDate = moment("2019-01-01 00:00:00");
                const enDate = moment("2020-01-01 00:00:00");
                connect(db => db.transaction(tx => {
                    const cat = this.$store.getters.curCat;
                    tx.executeSql('DELETE FROM logs_v2 WHERE cat = ?', [cat.id], () => {}, err => console.error(err));
                    while (stDate.unix() < enDate.unix()) {
                        const hour = stDate.hour();
                        const hourPerMap = [1, 1, 1, 1, 1, 2, 4, 5, 7, 9, 12, 22, 35, 9, 7, 5, 5, 4, 3, 3, 2, 1, 1, 1]
                        if (Math.random()*100 < hourPerMap[hour]) {
                            const sec = Math.round(Math.random() * 120);
                            const move = sec * Math.round(Math.random() * 200);
                            const calorie = (move / 100) * (0.06 + (cat.weight-5)/100);
                            const args = [cat.id, stDate.unix(), sec, move, calorie]
                            console.log(stDate.format("YYYY-MM-DD HH:mm:ss"), args);
                            tx.executeSql('INSERT INTO logs_v2 VALUES (?,?,?,?,?)', args, () => {}, err => console.error(err));
                        }
                        stDate.hour(hour + 1);
                    }
                }, err => console.error(err)));

            },
            setChartData(){
                let labels = [];
                if (this.chartView === 0) {
                    labels = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'];
                } else if (this.chartView === 1) {
                    labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thr', 'Fri', 'Sat'];
                } else if (this.chartView === 2) {
                    const curDate = moment(this.curDate);
                    labels = Array.from(Array(curDate.month(curDate.month() + 1).date(0).date()).keys()).map(i => i  < 9 ? '0' + (i+1) : i+1 + '');
                }
                const data = Array.from(Array(labels.length).keys()).map(i => 0);
                for (const item of this.dataSet) {
                    data[item.stdt] = Math.round(item.calorie * 10)/10;
                }
                this.chartData = {
                    labels,
                    datasets: [
                        {
                            label: 'Calories Burned (kcal)',
                            backgroundColor: 'rgba(247, 121, 121, 0.2)',
                            borderColor: 'rgba(247, 121, 121, 1)',
                            borderWidth: 2,
                            pointBorderWidth: 0,
                            pointHitRadius: 4,
                            pointBackgroundColor: 'rgba(247, 121, 121, 1)',

                            data
                        }
                    ]
                }
            },
            prevDate() {
                const curDate = moment(this.curDate);
                if (this.chartView === 0) {
                    curDate.date(curDate.date()-1);
                } else if (this.chartView === 1) {
                    curDate.date(curDate.date()-7);
                } else if (this.chartView === 2) {
                    curDate.month(curDate.month()-1);
                }
                this.curDate = curDate.unix() * 1000;
                this.loadData(null);
            },
            nextDate() {
                const curDate = moment(this.curDate);
                if (this.chartView === 0) {
                    curDate.date(curDate.date()+1);
                } else if (this.chartView === 1) {
                    curDate.date(curDate.date()+7);
                } else if (this.chartView === 2) {
                    curDate.month(curDate.month()+1);
                }
                this.curDate = curDate.unix() * 1000;
                this.loadData(null);
            },
            loadData(type) {
                const catId = this.$store.getters.curCatId;
                if (catId === 0) {
                    return;
                }

                if (type != null) {
                    this.chartView = type;
                    this.curDate = moment().startOf('day').unix() * 1000;
                }

                const curDate = moment(this.curDate).startOf('day');

                let query = null;
                let stDate = curDate;
                let enDate = curDate;
                if (this.chartView === 0) {
                    query = "SELECT SUM(calorie) as calorie, (stdt-?)/3600 stdt FROM logs_v2 WHERE cat = ? and stdt >= ? AND stdt < ? GROUP BY (stdt-?)/3600";
                    stDate = curDate.clone();
                    enDate = curDate.clone().date(curDate.date()+1);
                } else if (this.chartView === 1) {
                    query = "SELECT SUM(calorie) as calorie, (stdt-?)/86400 stdt FROM logs_v2 WHERE cat = ? and stdt >= ? AND stdt < ? GROUP BY (stdt-?)/86400";
                    stDate = curDate.clone().date(curDate.date()-curDate.day());
                    enDate = stDate.clone().date(stDate.date()+7);
                } else if (this.chartView === 2) {
                    query = "SELECT SUM(calorie) as calorie, (stdt-?)/86400 stdt FROM logs_v2 WHERE cat = ? and stdt >= ? AND stdt < ? GROUP BY (stdt-?)/86400";
                    stDate = curDate.clone().date(1);
                    enDate = stDate.clone().month(stDate.month()+1);
                }

                connect(db => db.transaction(tx => {
                        tx.executeSql(
                            query, [stDate.unix(), catId, stDate.unix(), enDate.unix(), stDate.unix()],
                            (tx, res) => {
                                this.dataSet = Array.from(Array(res.rows.length).keys()).map(i => res.rows.item(i));
                                this.setChartData();
                                console.log(JSON.parse(JSON.stringify(this.dataSet)));
                            },
                            err => {
                                console.error(err);
                            }
                        )
                    }, err => console.error(err)
                ));
            }
        },
        mounted() {
            // this.dump();
            this.loadData(0)
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
        margin: 0 16px;

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
    font-size: 16px;

    & > div {
      display: flex;
      height: 36px;
      justify-content: center;
      align-items: center;
    }
  }

  #chartButtons {
    margin-top: 16px;
    margin-left: 16px;
    margin-right: 16px;
    height: 42px;
    display: flex;
    border: 1px solid #2EB7BD;
    button {
      height: 42px;
      flex: 1 1 0;
      color: #2eb7bd;
      &.active {
        background-color: #2EB7BD;
        color: #ffffff;
      }
    }
  }

  #chartTitle{
    display: flex;
    margin-top: 24px;
    height: 36px;
    justify-content: space-between;
    align-items: center;
    color: #ffffff;
    padding: 0 16px;
    &>button {
      text-align: center;
      width: 30px;
      height: 30px;
      padding-top: 3px;
      background-color: #2eb7bd;
      border-radius: 50%;

      &:first-child {
        padding-right: 3px;
      }
      &:last-child {
        padding-left: 3px;
      }

      &>img {
        width: 24px;
        height: 24px;
      }
    }
    &>span {
      font-size: 16px;
    }
  }
</style>

