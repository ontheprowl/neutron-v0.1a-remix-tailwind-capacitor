
import { useNavigate, useOutletContext } from '@remix-run/react'
import MessageIcon from '~/assets/images/messageIcon.svg'



// export const loader: LoaderFunction = async ({})=>{

// }




export default function ARDashboard() {

    console.log("PROPS AT DASHBOARD LEVEL...")

    const { businessData } = useOutletContext()
    console.dir(businessData)

    let navigate = useNavigate();


    return (
        <div className="flex flex-col space-y-3 h-full">
            <div className="flex flex-row space-x-3  h-1/5">
                <div id="primary_metric" className="w-1/3 bg-primary-base flex flex-col text-white p-5 space-y-6 justify-between shadow-lg rounded-xl">
                    <h1 className=" text-5xl">Rs. {businessData?.outstanding}</h1>
                    <div className="flex flex-row justify-between">
                        <span className=" text-lg">
                            Total Outstanding
                        </span>
                        {businessData?.last_outstanding && <span className=" text-2xl text-success-light">
                            {((businessData?.outstanding - businessData.last_outstanding) / businessData?.last_outstanding) * 100}%
                        </span>}
                    </div>
                </div>
                <div id="secondary_metric" className="w-1/3 bg-white flex flex-col text-black p-5 space-y-6 justify-between shadow-lg rounded-xl">
                    <h1 className=" text-5xl">{businessData?.dso}</h1>
                    <div className="flex flex-row justify-between">
                        <span className=" text-lg">
                            Days Sales Outstanding
                        </span>
                        {businessData?.last_dso && <span className=" text-2xl text-warning-dark">
                            {((businessData?.dso - businessData.last_dso) / businessData?.last_dso) * 100}
                        </span>}
                    </div>
                </div>
                <div id="tertiary_metric" className="w-1/3 flex flex-col bg-white p-5 space-y-6 justify-between text-black shadow-lg rounded-xl">
                    <h1 className=" text-5xl">80</h1>
                    <div className="flex flex-row justify-between">
                        <span className=" text-lg">
                            Days Sales Outstanding
                        </span>
                        <span className=" text-2xl">
                            +15%
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex flex-row space-x-3 h-2/5">
                <div id="actions" className="w-2/5 h-full flex flex-col bg-primary-light text-black shadow-lg rounded-xl">
                    <div className="flex flex-row h-auto justify-between p-5 pb-3">
                        <h2 className="text-black">
                            Actions
                        </h2>
                        <h2 className=" text-error-dark">
                            4 ACTIONS ARE PENDING
                        </h2>
                    </div>
                    <ul className="h-full grid grid-cols-1 divide-y divide-black m-5 mt-0">
                        <li className="flex flex-row items-center justify-start space-x-10">
                            <img src={MessageIcon} alt="messageIcon" className="w-5" />
                            <span> Action 1 </span>
                        </li>
                        <li className="flex flex-row items-center justify-start space-x-10">
                            <img src={MessageIcon} alt="messageIcon" className="w-5" />
                            <span> Action 1 </span>

                        </li>
                        <li className="flex flex-row items-center justify-start space-x-10">
                            <img src={MessageIcon} alt="messageIcon" className="w-5" />
                            <span> Action 1 </span>

                        </li>
                        <li className="flex flex-row items-center justify-start space-x-10">
                            <img src={MessageIcon} alt="messageIcon" className="w-5" />
                            <span> Action 1 </span>

                        </li>
                        <li className="flex flex-row items-center justify-start space-x-10">
                            <img src={MessageIcon} alt="messageIcon" className="w-5" />
                            <span> Action 1 </span>

                        </li>
                    </ul>
                </div>
                <div id="visualizations_panel" className="w-3/5 p-5 bg-white text-black shadow-lg rounded-xl">
                    <h2 className="text-black">
                        Ageing Balance
                    </h2>
                </div>

            </div>
            <div className="flex flex-row space-x-3 h-2/5">
                <div id="receivables_queue" className="w-1/2 bg-white flex flex-col text-black shadow-lg rounded-xl">
                    <div className='flex flex-row justify-between items-center m-5'>
                        <div className='flex flex-col w-auto'>
                            <h1>Receivables Queue</h1>
                            <span className=' text-error-dark'>
                                From total 5 Clients
                            </span>
                        </div>
                        <button onClick={() => {
                            navigate('/invoices', { preventScrollReset: true })
                        }} className='bg-primary-base hover:bg-primary-dark transition-all p-2.5 font-gilroy-regular text-white rounded-lg'>
                            View All Invoices
                        </button>
                    </div>
                    <ul className=' m-5 mt-0 h-full divide-y-2'>
                        {businessData?.receivables.map((invoice) => {
                            return (
                                <li key={invoice?.invoice_id} className='flex flex-row items-center justify-between'>
                                    <div className='flex flex-col space-y-2'>
                                        <span className='font-gilroy-bold text-base'>{invoice?.customer_name}</span>
                                        <span className='font-gilroy-medium text-sm text-secondary-text'>{invoice?.company_name}</span>
                                    </div>
                                    <div className='flex flex-row space-x-4 items-center'>
                                        <span className='text-secondary-text font-gilroy-medium text-base'>
                                            {invoice?.due_days}
                                        </span>
                                        <span className=' bg-neutral-light p-3 rounded-lg text-lg'>Rs.{invoice?.balance}</span>
                                    </div>
                                </li>)
                        })}
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
                    <ul className=' m-5 mt-0 h-full'>

                    </ul>
                </div>

            </div>
        </div>)
}