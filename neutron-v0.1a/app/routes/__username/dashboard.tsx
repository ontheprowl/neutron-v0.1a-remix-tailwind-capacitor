
import { useNavigate, useOutletContext } from '@remix-run/react'
import { useCycle } from 'framer-motion'
import { useEffect, useMemo } from 'react'
import MessageIcon from '~/assets/images/messageIcon.svg'
import { NeutronDefaultChart } from '~/components/visualizations/NeutronCharts'
import NucleiZeroState from '~/components/layout/NucleiZeroState';
import moment from 'moment';
import SectionUnderConstructionComponent from '~/components/layout/SectionUnderConstructionComponent'




// export const loader: LoaderFunction = async ({})=>{

// }




export default function ARDashboard() {

    console.log("PROPS AT DASHBOARD LEVEL...")

    const { businessData } = useOutletContext()



    let navigate = useNavigate();


    const [currentPeriod, cycleCurrentPeriod] = useCycle('30d', '60d', '90d', 'excess')

    const chartData = useMemo(() => {
        return { outstanding: { '30d': businessData?.outstanding['30d'], '60d': businessData?.outstanding['60d'], '90d': businessData?.outstanding['90d'], 'excess': businessData?.outstanding['excess'] }, revenue: { '30d': businessData?.revenue['30d'], '60d': businessData?.revenue['60d'], '90d': businessData?.revenue['90d'], 'excess': businessData?.revenue['excess'] }, sales: { '30d': businessData?.revenue['30d'] + businessData?.outstanding['30d'], '60d': businessData?.revenue['60d'] + businessData?.outstanding['60d'], '90d': businessData?.revenue['90d'] + businessData?.outstanding['90d'], 'excess': businessData?.revenue['excess'] + businessData?.outstanding['excess'] } }
    }, [businessData])


    const periodOptions = ['30d', '60d', '90d', 'excess']

    // useEffect(() => {
    //     setTimeout(() => {
    //         setCurrentPeriod(periodOptions[Math.floor(Math.random() * periodOptions.length)])
    //     }, 4000)
    // }, [currentPeriod])



    // useEffect(() => {
    //     const chart_container = document.getElementById('visualizations_panel');

    //     // if (chart_container) {
    //     //     intializeNeutronChart(chart_container, 'Outstanding Amounts (From Specified Date)', [
    //     //         {
    //     //             time: moment().subtract('30', 'days').format("YYYY-MM-DD"), value: businessData?.outstanding['30d']
    //     //         },
    //     //         {
    //     //             time: moment().subtract('60', 'days').format("YYYY-MM-DD"), value: businessData?.outstanding['60d']
    //     //         },
    //     //         {
    //     //             time: moment().subtract('90', 'days').format("YYYY-MM-DD"), value: businessData?.outstanding['90d']
    //     //         },
    //     //         {
    //     //             time: moment().subtract('200', 'days').format("YYYY-MM-DD"), value: businessData?.outstanding['excess']
    //     //         },
    //     //     ]
    //     //     )
    //     // }

    // }, [businessData, currentPeriod])


    const outstandingDiff = businessData.last_outstanding[currentPeriod] > 0 ? ((businessData?.outstanding[currentPeriod] - businessData.last_outstanding[currentPeriod]) / businessData?.last_outstanding[currentPeriod]) * 100 : 0;
    const dsoDiff = businessData.last_dso[currentPeriod] > 0 ? ((businessData?.dso[currentPeriod] - businessData.last_dso[currentPeriod]) / businessData?.last_dso[currentPeriod]) * 100 : 0;
    const revenueDiff = businessData.last_revenue[currentPeriod] > 0 ? ((businessData?.revenue[currentPeriod] - businessData.last_revenue[currentPeriod]) / businessData?.last_revenue[currentPeriod]) * 100 : 0;

    return (
        <div className="flex flex-col space-y-3 h-full">
            <div className="flex flex-row space-x-3  h-1/5">
                <div id="primary_metric" className="w-1/3 bg-primary-base flex flex-col text-white p-5 space-y-6 justify-between shadow-lg rounded-xl">
                    <div className="flex flex-row justify-between">
                        <h1 className=" text-5xl transition-all">Rs. {Math.ceil(businessData?.outstanding[currentPeriod]).toLocaleString('en-IN')}</h1>
                    </div>

                    <div className="flex flex-row justify-between">
                        <span className=" text-lg">
                            Total Outstanding
                        </span>
                        {outstandingDiff && outstandingDiff > 0 ? <span className=" text-2xl text-success-light">
                            {Math.ceil(outstandingDiff)}%
                        </span> : <></>}
                    </div>
                </div>
                <div id="secondary_metric" className="w-1/3 bg-white flex flex-col text-black p-5 space-y-6 justify-between shadow-lg rounded-xl">
                    <h1 className=" text-5xl">{Math.ceil(businessData?.dso[currentPeriod])}</h1>
                    <div className="flex flex-row justify-between">
                        <span className=" text-lg">
                            Days Sales Outstanding
                        </span>
                        {dsoDiff && dsoDiff > 0 ? <span className=" text-2xl text-warning-dark">
                            {Math.ceil(dsoDiff)}%
                        </span> : <></>}
                    </div>
                </div>
                <div id="tertiary_metric" className="w-1/3 flex flex-col bg-white p-5 space-y-6 justify-between text-black shadow-lg rounded-xl">
                    <h1 className=" text-5xl">Rs. {Math.ceil(businessData?.revenue[currentPeriod]).toLocaleString('en-IN')}</h1>
                    <div className="flex flex-row justify-between">
                        <span className=" text-lg">
                            Revenue (Realized)
                        </span>
                        {revenueDiff && revenueDiff > 0 ? <span className=" text-2xl text-warning-dark">
                            {Math.ceil(revenueDiff)}%
                        </span> : <></>}
                    </div>
                </div>
            </div>
            <div className="flex flex-row space-x-3 h-2/5">
                <div id="actions" className="w-2/5 h-full flex flex-col bg-primary-light text-black shadow-lg rounded-xl">
                    <div className="flex flex-row h-auto justify-between p-5 pb-3">
                        <h2 className="text-black">
                            Actions
                        </h2>
                        <button onClick={() => {
                            cycleCurrentPeriod()
                        }} className='font-gilroy-medium p-3 w-auto transition-all active:opacity-80 hover:bg-primary-dark text-base text-white bg-primary-base rounded-xl whitespace-nowrap'>Current Period: {currentPeriod == "excess" ? 'Beyond 90d' : `Last ${currentPeriod}`}
                        </button>
                        {/* <h2 className=" text-error-dark">
                            {businessData?.pending_actions?.length ? businessData?.pending_actions?.length : 0} ACTIONS ARE PENDING
                        </h2> */}
                    </div>

                    <ul className="h-full grid grid-cols-1 divide-y overflow-y-scroll divide-black m-5 mt-0">
                        {businessData?.pending_actions?.length > 0 ? businessData?.pending_actions?.map((action) => {
                            return (<li key={action?.id} className="flex flex-row items-center justify-start space-x-10">
                                <img src={MessageIcon} alt="messageIcon" className="w-5" />
                                <span>{action?.name}</span>
                            </li>);
                        }) : <SectionUnderConstructionComponent />}
                    </ul>
                </div>
                <div className="w-3/5 h-full p-6 bg-white text-black shadow-lg rounded-xl">
                    <div id="visualizations_panel" className='h-full w-full p-2'>
                        <NeutronDefaultChart data={chartData} />
                    </div>
                </div>

            </div>
            <div className="flex flex-row space-x-3 h-2/5">
                <div id="receivables_queue" className="w-1/2 bg-white flex flex-col text-black shadow-lg rounded-xl">
                    <div className='flex flex-row justify-between items-center m-5'>
                        <div className='flex flex-col w-auto'>
                            <h1>Receivables Queue (Ordered by Amount)</h1>
                            <span className=' text-error-dark'>
                                From total {Object.keys(businessData?.customers).length} clients
                            </span>
                        </div>
                        <button onClick={() => {
                            navigate('/invoices', { preventScrollReset: true })
                        }} className='bg-primary-base hover:bg-primary-dark transition-all p-2.5 font-gilroy-regular text-white rounded-lg'>
                            View All Invoices
                        </button>
                    </div>
                    <ul className=' m-5 mt-0 h-[400px] overflow-y-scroll divide-y-2'>
                        {businessData?.receivables[currentPeriod]?.length > 0 ? businessData?.receivables[currentPeriod].sort((a, b) => {
                            if (b?.balance < a?.balance) {
                                return -1
                            } else {
                                return 1
                            }
                        }).map((invoice, index) => {
                            return (
                                <li key={index} className='flex flex-row items-center py-3 justify-between'>
                                    <div className='flex flex-col space-y-2'>
                                        <span className='font-gilroy-bold text-base'>{String(invoice?.customer_name).toUpperCase()}</span>
                                        <span className='font-gilroy-medium text-sm text-secondary-text'>{String(invoice?.company_name).toUpperCase()}</span>
                                    </div>
                                    <div className='flex flex-row space-x-4 items-center'>
                                        <span className='text-secondary-text font-gilroy-medium text-base'>
                                            {invoice?.due_days}
                                        </span>
                                        <span className=' bg-neutral-light p-3 max-w-sm min-w-fit rounded-lg text-lg'>Rs. {(invoice?.balance).toLocaleString('en-IN')}</span>
                                    </div>
                                </li>)
                        }) : <NucleiZeroState entity={'invoices'} cta={'Sync Data'} ></NucleiZeroState>}
                    </ul>
                </div>
                <div id="top_debtors" className="w-1/2 bg-white flex flex-col text-black shadow-lg rounded-xl">
                    <div className='flex flex-row justify-between items-center m-5'>
                        <div className='flex flex-col w-auto'>
                            <h1>Top Debtors</h1>
                        </div>
                        <button onClick={() => {
                            navigate('/customers', { preventScrollReset: true })
                        }} className='bg-primary-base hover:bg-primary-dark transition-all p-2.5 font-gilroy-regular text-white rounded-lg'>
                            View All Customers
                        </button>
                    </div>
                    <ul className='m-5 mt-0 h-[400px] overflow-y-scroll divide-y-2'>
                        {businessData?.customers?.length > 0 ? businessData?.customers.filter((customer) => {
                            return customer?.outstanding_receivable_amount > 0
                        }).sort((a, b) => {
                            if (a?.outstanding_receivable_amount > b?.outstanding_receivable_amount) {
                                return -1
                            } else {
                                return 1
                            }
                        }).map((customer, index) => {
                            return (
                                <li key={index} className='flex flex-row items-center py-3 justify-between'>
                                    <div className='flex flex-col space-y-2'>
                                        <span className='font-gilroy-bold text-base'>{String(customer?.first_name + " " + customer?.last_name).toUpperCase()}</span>
                                        <span className='font-gilroy-medium text-sm text-secondary-text'>{String(customer?.contact_name).toUpperCase()}</span>
                                    </div>
                                    <div className='flex flex-row space-x-4 items-center'>
                                        <span className='text-secondary-text uppercase font-gilroy-medium text-base'>
                                            {customer?.place_of_contact_formatted}
                                        </span>
                                        <span className=' bg-neutral-light p-3 max-w-sm min-w-fit rounded-lg text-lg'>Rs. {Number(customer?.outstanding_receivable_amount).toLocaleString('en-IN')}</span>
                                    </div>
                                </li>)
                        }) : <NucleiZeroState entity={"customers"} cta='Sync Data'></NucleiZeroState>
                        }
                    </ul>
                </div>

            </div>
        </div>)
}