import { Link, useOutletContext } from '@remix-run/react';
import MessagesQuotaIcon from '~/assets/images/messagesQuotaIcon.svg'
import WhatsappQuotaIcon from '~/assets/images/whatsappQuotasIcon.svg'



export default function SettingsScreen() {

    const testOrders = [
        {
            id: '#2121212122211',
            date: '14 Dec 2020'
        }, {
            id: '#2121212122211',
            date: '14 Dec 2020'
        }, {
            id: '#2121212122211',
            date: '14 Dec 2020'
        }, {
            id: '#2121212122211',
            date: '14 Dec 2020'
        }
    ]

    const { metadata, businessData } = useOutletContext();


    return (
        <div className="flex flex-col space-y-4 h-full">
            <div id="current_plan" className="bg-white px-6 py-4 space-y-6 flex flex-col rounded-xl drop-shadow-lg h-fit">
                <h1>Billing & Quotas</h1>
                <div id="current_plan" className="flex flex-row items-center justify-between">
                    <div className="flex flex-col space-y-2">
                        <span className="">{businessData?.current_plan?.name}</span>
                        <span className="text-sm font-gilroy-medium">Renewal in {businessData?.current_plan?.expires_in}</span>
                    </div>
                    <div className=" text-3xl">
                        Rs. {businessData?.current_plan?.monthly_rates}
                    </div>
                </div>
                <div id="quotas" className="flex flex-row h-16 space-x-4">
                    <div id="messages_quota" className="border-2 rounded-lg flex flex-row justify-between border-dashed w-1/2 px-4">
                        <div className="flex flex-row items-center space-x-2">
                            <img className='h-12' src={MessagesQuotaIcon} alt="" />
                            <span>Emails</span>
                        </div>
                        <div id="utilization" className=' items-center justify-end flex flex-row  m-2 w-2/5'>
                            <span className='font-gilroy-medium text-sm mr-3'>Used</span>
                            <span className='text-3xl text-success-base'>{businessData?.current_plan?.usage?.email}</span>
                            <span className='text-3xl'>/</span>
                            <span className='text-3xl'>{businessData?.current_plan?.quotas?.email}</span>
                        </div>
                    </div>
                    <div id="whatsapp_quota" className="border-2 rounded-lg flex flex-row justify-between border-dashed w-1/2 px-4">
                        <div className="flex flex-row items-center space-x-2">
                            <img className='h-12' src={WhatsappQuotaIcon} alt="" />
                            <span>Whatsapp</span>
                        </div>
                        <div id="utilization" className=' items-center justify-end flex flex-row  m-2 w-2/5'>
                            <span className='font-gilroy-medium text-sm mr-3'>Used</span>
                            <span className='text-3xl text-success-base'>{businessData?.current_plan?.quotas?.whatsapp}</span>
                            <span className='text-3xl'>/</span>
                            <span className='text-3xl'>{businessData?.current_plan?.quotas?.whatsapp}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex flex-row h-full space-x-4">
                <div className='bg-white flex flex-col space-y-4 px-3 py-2 rounded-lg w-1/3 drop-shadow-xl'>
                    <h1 className='text-xl'>Billing History</h1>
                    <ul className='mx-5 h-full divide-y-2 overflow-y-scroll'>
                        <div className='flex flex-row text-secondary-text justify-between p-5 text-sm'>
                            <span className='w-1/2'>ORDER ID</span>
                            <span className='w-1/2 text-left'>DATE</span>
                        </div>
                        {testOrders.map((order) => {

                            return (
                                <li key={order.id} className='flex flex-row font-gilroy-medium justify-between p-5 text-sm'>
                                    <span className='w-1/2'>{order.id}</span>
                                    <span className='w-1/2 text-left'>{order.date}</span>
                                </li>)
                        })}
                    </ul>
                </div>
                <div className='flex flex-col w-2/3 space-y-4 drop-shadow-xl'>
                    <div className='bg-white flex flex-col space-y-4 rounded-lg h-1/3 p-5'>
                        <h1 className='text-xl'>Starter</h1>
                        <div className='flex flex-col space-y-6 font-gilroy-medium'>
                            <span>Perfect for companies using Neutron for the first time</span>

                            <a className='font-gilroy-regular text-primary-base hover:underline decoration-primary-base' href="https://www.neutron.money/pricing">Plan Details</a>
                        </div>
                    </div>
                    <div className='bg-white rounded-lg h-1/3 p-5'>
                        <h1 className='text-xl'>Basic</h1>
                        <div className='flex flex-col space-y-6 font-gilroy-medium'>
                            <span>Perfect for small and medium businesses dealing with less than 500 invoices in a month</span>

                            <a className='font-gilroy-regular text-primary-base hover:underline decoration-primary-base' href="https://www.neutron.money/pricing">Plan Details</a>
                        </div>
                    </div>
                    <div className='bg-white rounded-lg h-1/3 p-5'>
                        <h1 className='text-xl'>Enterprise</h1>
                        <div className='flex flex-col space-y-6 font-gilroy-medium'>
                            <span>Perfect for small and medium businesses dealing with more than 500 invoices in a month</span>

                            <a className='font-gilroy-regular text-primary-base hover:underline decoration-primary-base' href="https://www.neutron.money/pricing">Plan Details</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>)
}