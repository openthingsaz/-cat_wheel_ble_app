<script>
    import {Line, mixins} from 'vue-chartjs'
    const { reactiveProp } = mixins;
    export default {
        extends: Line,
        props: ['options'],
        mixins: [reactiveProp],
        mounted () {
            console.log(this.options);
            this.renderChart(this.chartData, this.options)
        }
    }
</script>
