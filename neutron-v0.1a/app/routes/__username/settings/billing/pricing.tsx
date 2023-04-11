import { useNavigate } from "@remix-run/react";
import { useState } from "react";
import DiscountGraphic from '~/assets/images/discount.svg';
import Tick from '~/assets/images/plans_tick.svg';
import { NeutronPlan } from "~/components/layout/NeutronPlans";
import BackIcon from '~/assets/images/back.png'

export default function PricingPage() {


    const [plansPeriod, setPlansPeriod] = useState('Annually');


    let navigate = useNavigate();

    return (
        <div className="flex flex-col items-center space-y-2 h-full">
            <button className="self-start p-3 px-6 ml-5   hover:bg-primary-light active:opacity-80 transition-all text-xl   rounded-full" onClick={()=>{
                navigate(-1)
            }}><img className="h-6" src={BackIcon} alt="back_icon"/></button>
            <div className=" border-2 rounded-full font-gilroy-medium p-1 bg-primary-base flex flex-row space-x-4 text-white">
                <button onClick={() => { setPlansPeriod('Annually') }} className={`p-3 px-7 rounded-full transition-all ${plansPeriod === "Annually" ? 'bg-accent-base' : ''}`}>Annually</button>
                <button onClick={() => { setPlansPeriod('Monthly') }} className={`p-3 px-7 rounded-full transition-all ${plansPeriod === "Monthly" ? 'bg-accent-base' : ''}`}>Monthly</button>
            </div>
            <img src={DiscountGraphic} className="" alt="discount_graphic" />
            <div id="plans" className="  flex p-10 pt-5 flex-row space-x-6 w-full h-screen overflow-y-scroll">
                <NeutronPlan slabs={[
                    {
                        category: "Payment Reminders",
                        benefits: [
                            "150 email reminders to your customers",
                            "150 email reminders to your customers",
                        ]
                    },
                    {
                        category: "Collection Workflows",
                        benefits: [
                            "2 smart workflows",
                            "25 customers per smart workflow",
                        ]
                    },
                    {
                        category: "Reports",
                        benefits: [
                            "Invoice status tracking",
                            "Customer status tracking",
                            "Ageing Balances",
                        ]
                    },
                    {
                        category: "Integrations",
                        benefits: [
                            "Tally",
                            "Zoho",
                        ]
                    },
                    {
                        category: "Users",
                        benefits: [
                            "2 Team Member accounts",
                        ]
                    },
                ]} title={"Starter"} description={"Perfect for companies using Neutron for the first time"} price={"Free"} />
                <NeutronPlan slabs={[
                    {
                        category: "Payment Reminders",
                        benefits: [
                            "3500 email reminders to your customers",
                            "1000 email reminders to your customers",
                            "Automatic SMS (Coming Soon)",
                        ]
                    },
                    {
                        category: "Collection Workflows",
                        benefits: [
                            "Unlimited smart workflows",
                            "Unlimited customers per smart workflow",
                        ]
                    },
                    {
                        category: "Reports",
                        benefits: [
                            "Invoice status tracking",
                            "Customer status tracking",
                            "Ageing Balances",
                            "Credit control",
                            "Team Activity",
                            "Cashflow Analysis",
                            "Custom Reports"
                        ]
                    },
                    {
                        category: "Integrations",
                        benefits: [
                            "Tally",
                            "Zoho",
                            "Request an integration",
                        ]
                    },
                    {
                        category: "Users",
                        benefits: [
                            "5 Team Member accounts",
                            "Role-based access",
                        ]
                    },
                ]} title={"Basic"} description={"Perfect for small and medium businesses dealing with less than 500 invoices in a month"} price={{
                    Monthly: {
                        original: "5999",
                        current: "2999"
                    },
                    Annually: {
                        original: "4999",
                        current: "2399",
                    }
                }} period={plansPeriod} />

                <NeutronPlan slabs={[
                    {
                        category: "Payment Reminders",
                        benefits: [
                            "8500 email reminders to your customers",
                            "2000 email reminders to your customers",
                            "Automatic SMS (Coming Soon)",
                            "Custom Email Domain (Coming Soon)",

                        ]
                    },
                    {
                        category: "Collection Workflows",
                        benefits: [
                            "Unlimited smart workflows",
                            "Unlimited customers per smart workflow",
                        ]
                    },
                    {
                        category: "Reports",
                        benefits: [
                            "Invoice status tracking",
                            "Customer status tracking",
                            "Ageing Balances",
                            "Credit control",
                            "Team Activity",
                            "Cashflow Analysis",
                            "Custom Reports"
                        ]
                    },
                    {
                        category: "Integrations",
                        benefits: [
                            "Tally",
                            "Zoho",
                            "Request an integration",
                        ]
                    },
                    {
                        category: "Users",
                        benefits: [
                            "Unlimited Team Member accounts",
                            "Role-based access",
                        ]
                    },
                ]} title={"Enterprise"} description={"Perfect for businesses dealing with more than 500 invoices in a month"} price={{
                    Monthly: {
                        original: "9999",
                        current: "5999"
                    },
                    Annually: {
                        original: "6999",
                        current: "4799",
                    }
                }} period={plansPeriod} />
            </div>
        </div>
    )
}
