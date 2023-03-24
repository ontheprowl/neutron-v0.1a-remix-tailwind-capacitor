import type { ChartOptions } from "lightweight-charts";
import { createChart } from "lightweight-charts";

const defaultChartOptions: ChartOptions = { layout: { textColor: 'black', background: { type: 'solid', color: 'white' } }, autoSize: true };


const NeutronDefaultChart = (container: HTMLElement, title: string, data: Array<{ time: string, value: number }>) => {

    const neutronChart = createChart(container, defaultChartOptions);
    const histogramSeries = neutronChart.addHistogramSeries({
        color: "#BCB0E0",
        baseLineColor: "#FFFFFF",
        priceLineColor: '#6950BA',
        title: title
    });
    histogramSeries.setData(data);
    return neutronChart;
}




export function intializeNeutronChart(container: HTMLElement, title: string, data: Array<{ time: string, value: number }>) {

    const chart = NeutronDefaultChart(container, title, data);

    chart.timeScale().fitContent();
}