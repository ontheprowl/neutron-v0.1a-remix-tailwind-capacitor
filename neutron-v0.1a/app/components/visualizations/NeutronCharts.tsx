import { Chart as ChartJS, Legend, CategoryScale, BarElement, Tooltip, LinearScale, Title, BarController } from 'chart.js';
import React from 'react';
import { useMemo } from 'react';
import { Bar, Chart } from 'react-chartjs-2';




export const NeutronDefaultChart = React.memo(NeutronChart);

function NeutronChart({ data }: { data: { outstanding: { '30d': number, '60d': number, '90d': number, 'excess': number }, revenue: { '30d': number, '60d': number, '90d': number, 'excess': number }, sales: { '30d': number, '60d': number, '90d': number, 'excess': number } } }) {
    ChartJS.register(
        CategoryScale,
        LinearScale,
        BarElement,
        BarController,
        Title,
        Tooltip,
        Legend
    );
    const options = {
        plugins: {
            // title: {
            //     display: true,
            //     text: ' Ageing Balances',
            // },
        },
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                stacked: true,
            },
            y: {
                stacked: true,
            },
        },
    };

    const labels = ['30d', '60d', '90d', 'Beyond 90 Days'];

    const chartData = {
        labels,
        datasets: [
            {
                label: 'Total Sales',
                data: [data?.sales?.['30d'], data?.sales?.['60d'], data?.sales?.['90d'], data?.sales?.['excess']],
                backgroundColor: '#000000',
            },
            {
                label: 'Total Outstanding',
                data: [data?.outstanding?.['30d'], data?.outstanding?.['60d'], data?.outstanding?.['90d'], data?.outstanding?.['excess']],
                backgroundColor: '#BCB0E0',
            },
            {
                label: 'Realized Revenue',
                data: [data?.revenue?.['30d'], data?.revenue?.['60d'], data?.revenue?.['90d'], data?.revenue?.['excess']],
                backgroundColor: '#6950ba',
            },
        ],
    };

    return (
        <Bar redraw={false} className='w-full h-full' datasetIdKey='id' options={options}
            data={chartData} >
        </Bar>)

}
