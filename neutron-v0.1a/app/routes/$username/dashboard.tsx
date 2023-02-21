
import MessageIcon from '~/assets/images/messageIcon.svg'



export default function ARDashboard() {


    return (
        <div className="flex flex-col space-y-3 h-full">
            <div className="flex flex-row space-x-3  h-1/5">
                <div id="primary_metric" className="w-1/3 bg-primary-base flex flex-col text-white p-5 space-y-6 justify-between shadow-lg rounded-xl">
                    <h1 className=" text-5xl">Rs. 1,20,000</h1>
                    <div className="flex flex-row justify-between">
                        <span className=" text-lg">
                            Total Outstanding
                        </span>
                        <span className=" text-2xl text-success-light">
                            +15%
                        </span>
                    </div>
                </div>
                <div id="secondary_metric" className="w-1/3 bg-white flex flex-col text-black p-5 space-y-6 justify-between shadow-lg rounded-xl">
                    <h1 className=" text-5xl">80</h1>
                    <div className="flex flex-row justify-between">
                        <span className=" text-lg">
                            Days Sales Outstanding
                        </span>
                        <span className=" text-2xl text-warning-dark">
                            +15%
                        </span>
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
                        <button className='bg-primary-base hover:bg-primary-dark transition-all p-2.5 font-gilroy-regular text-white rounded-lg'>
                            View All
                        </button>
                    </div>
                    <ul className=' m-5 mt-0 h-full'>

                    </ul>
                </div>
                <div id="top_debtors" className="w-1/2 bg-white flex flex-col text-black shadow-lg rounded-xl">
                    <div className='flex flex-row justify-between items-center m-5'>
                        <div className='flex flex-col w-auto'>
                            <h1>Top Debtors</h1>
                        </div>
                        <button className='bg-primary-base hover:bg-primary-dark transition-all p-2.5 font-gilroy-regular text-white rounded-lg'>
                            View All
                        </button>
                    </div>
                    <ul className=' m-5 mt-0 h-full'>

                    </ul>
                </div>

            </div>
        </div>)
}