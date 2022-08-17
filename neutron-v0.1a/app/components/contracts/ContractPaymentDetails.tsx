import { useFormContext, useWatch } from "react-hook-form";
import { ContractDataStore } from "~/stores/ContractStores";
import Select from 'react-select'
import { ContractCreationStages, Milestone } from "~/models/contracts";
import AddButton from "../inputs/AddButton";
import CrossButton from "../inputs/CrossButton";
import FormButton from "../inputs/FormButton";
import CurrencyInput from 'react-currency-input-field';
import AccentedToggle from "../layout/AccentedToggleV1";
import { useEffect, useState } from "react";
import { isEmpty, minStartDate } from "~/utils/utils";
import { toast } from "react-toastify";
import NeutronModal from "../layout/NeutronModal";
import { PAYMENT_BREAKDOWN_VALIDATOR_LOG_PREFIX } from "~/logging/constants";
import MilestoneFormEntry from "../layout/MilestoneFormEntry";






export default function ContractPaymentDetails() {


    const startDate = useWatch({ name: 'startDate' })
    const endDate = useWatch({ name: 'endDate' })


    const advancePercentage: string = useWatch({ name: 'advancePercentage' });
    let advancePercentageValue = 0;
    if (advancePercentage) {
        advancePercentageValue = parseInt(advancePercentage.replace("%", ''));

    }

    const contractValue: string = useWatch({ name: 'contractValue' });
    let contractValueNumber = 0;

    if (contractValue) {
        contractValueNumber = parseInt(contractValue.replace("₹", '').replace(',', ''));
    }

    const hasAdvance = ContractDataStore.useState(s => s.hasAdvance);
    const hasMilestones = ContractDataStore.useState(s => s.hasMilestones);

    const deliverables = ContractDataStore.useState(s => s.deliverables);
    const milestones = ContractDataStore.useState(s => s.milestonesCount)
    let localMilestones: Array<Milestone> = [];
    let currentMilestone: Milestone;
    const formMethods = useFormContext();

    const errors = formMethods.formState.errors;
    const trigger = formMethods.trigger;


    const paymentMode = useWatch({ name: 'paymentMode' })

    useEffect(() => {

        trigger()
    }, [paymentMode, trigger, hasAdvance])


    return (
        <>
            <h2 className="prose prose-lg mt-5 mb-1 text-white font-gilroy-black text-[30px]"> Payment & Milestones  </h2>
            <h3 className="font-gilroy-bold text-gray-400 text-[16px] mb-5 w-full">Disclaimer : Neutron is not liable for work exchanged off-platform and Advances paid aren't protected by escrow.</h3>
            <label htmlFor="simple-search" className="sr-only">Client Name</label>
            <div className="mb-5 flex flex-col space-y-5 sm:flex-row relative w-auto sm:items-end sm:space-x-3 justify-start align-middle">
                {/* <div className="relative w-auto ">
                    <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                        <svg className="w-5 h-5 text-white dark:text-black" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"></path></svg>
                    </div>
                    <input type="text" id="existing-client" className=" bg-[#4A4A4A] pt-3 pb-3 pl-10 pr-4 border-gray-300 text-white text-sm rounded-lg placeholder-white block w-auto h-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-white dark:text-white " placeholder="Search for an existing client" required />

                </div> */}
                <div className="flex flex-col space-y-4 w-full">
                    <h2 className="prose prose-lg text-white font-gilroy-regular text-[18px]"> Contract Value </h2>
                    <CurrencyInput
                        prefix="₹"
                        id="contract-value"
                        placeholder="E.g: ₹10000"
                        decimalsLimit={2}
                        {...formMethods.register('contractValue')}
                        className=" bg-[#4A4A4A] pt-3 pb-3 pl-3 space-x-3 border-gray-300 text-white text-sm rounded-lg placeholder-white block w-full h-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-white dark:text-white "

                    />
                </div>



                <div className="hidden sm:flex sm:h-20 border-l-gray-500 border-l-2"></div>
                <div className="flex flex-col space-y-4 w-full">
                    <h2 className="prose prose-lg text-white font-gilroy-regular text-[18px]"> Base Pay </h2>
                    <CurrencyInput
                        prefix="₹"
                        id="contract-value-base-pay"
                        placeholder="Minimum compensation for the project"
                        decimalsLimit={2}
                        {...formMethods.register('basePay')}
                        className=" bg-[#4A4A4A] pt-3 pb-3 pl-3 space-x-3 border-gray-300 text-white text-sm rounded-lg placeholder-white block w-full h-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-white dark:text-white "

                    />
                </div>

            </div>

            <div className="flex flex-row justify-start space-x-10 w-full">
                <div className="flex flex-row space-x-4 items-center">
                    <AccentedToggle variant="neutron-purple" name={'hasAdvance'} onToggle={() => {
                        ContractDataStore.update(s => {
                            s.hasAdvance = !hasAdvance
                        }
                        )
                    }}></AccentedToggle>
                    <div className="flex flex-col text-white">
                        <h1 className="font-gilroy-bold text-[18px]">Advance</h1>
                        <p className="font-gilroy-regular text-[14px] text-gray-300"> Does your project require an advance?</p>
                    </div>


                </div>

                <div className="flex flex-row space-x-4 items-center">
                    <AccentedToggle variant="neutron-purple" name={'hasMilestones'} onToggle={() => {
                        ContractDataStore.update(s => {
                            s.hasMilestones = !hasMilestones
                        }
                        )
                    }}></AccentedToggle>
                    <div className="flex flex-col text-white">
                        <h1 className="font-gilroy-bold text-[18px]">Milestones</h1>
                        <p className="font-gilroy-regular text-[14px] text-gray-300"> Is your project structured in milestones?</p>
                    </div>


                </div>
            </div>

            <hr className="w-full mt-3 mb-5 border-solid border-gray-500"></hr>

            <label htmlFor="simple-search" className="sr-only">Search through contacts</label>


            {hasAdvance ?
                <>
                    <h2 className="prose prose-lg text-white mb-3 font-gilroy-bold text-[24px]"> Advance Details </h2>
                    <div className="flex flex-col space-y-4 mt-5 mb-3 w-full">
                        <div className="flex flex-row space-x-4 items-center">
                            <CurrencyInput
                                suffix="%"
                                id="contract-value-advance"
                                placeholder="e.g: 20% of total compensation"
                                decimalsLimit={2}
                                {...formMethods.register('advancePercentage')}
                                className=" bg-[#4A4A4A] pt-3 pb-3 pl-3 max-w-xs space-x-3 border-gray-300 text-white text-sm rounded-lg placeholder-white block w-full h-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-white dark:text-white "

                            />
                            <h1 className="text-gray-400"> = INR {advancePercentageValue / 100 * contractValueNumber}</h1>
                        </div>

                        <hr className="w-full mt-3 mb-5 border-solid border-gray-500"></hr>

                    </div>
                </>
                : <></>}

            {hasMilestones ? <><h2 className="prose prose-lg text-white mb-3 font-gilroy-bold text-[24px]"> Milestones </h2>
                <div className="flex flex-col space-y-4 mt-2 mb-3 w-full">
                    <div className="overflow-y-scroll mb-5 mt-2 max-h-96"> {[...Array(milestones).keys()]?.map((milestoneNumber) => {
                        return (<MilestoneFormEntry key={milestoneNumber} milestoneNumber={milestoneNumber}></MilestoneFormEntry>)

                    })}</div>
                    <hr className="w-full mt-3 mb-5 border-solid border-gray-500"></hr>

                </div></> : <></>}


            <FormButton text="Proceed" onClick={() => {
                let milestonesPayload: {
                    advance: {
                        [x: string]: any
                    },
                    workMilestones: {
                        [x: string]: any
                    }
                } = {};
                if (advancePercentage) {
                    milestonesPayload = {
                        advance: { name: "advance", description: "This contract requires an advance payment before work begins...", percentage: advancePercentage, value: advancePercentageValue / 100 * contractValueNumber }
                    }
                }
                milestonesPayload['workMilestones'] = {}
                let iter = -1;
                for (const milestone of formMethods.getValues('milestones')) {
                    const milestonePercentageNumber = parseInt(milestone.percentage.replace("%", ''));

                    milestonesPayload['workMilestones'][++iter] = { ...milestone, value: milestonePercentageNumber / 100 * contractValueNumber, submissionPath: '' }
                }
                milestonesPayload['workMilestones'][iter] = { ...milestonesPayload['workMilestones'][iter], isLastMilestone: true }
                console.log("This is the milestones data ( after pre-processing ) ")
                console.dir(milestonesPayload);


                if (!isEmpty(errors)) {
                    toast("Invalid values detected for contract fields!", { theme: 'dark', type: 'warning' })
                } else if (!paymentBreakdownIsValid(milestonesPayload, contractValueNumber)) {
                    toast("Payment breakdown does not add up to the total contract value! Please re-check your inputs...", { theme: 'dark', type: 'warning' })
                } else {
                    ContractDataStore.update(s => {
                        s.stage = ContractCreationStages.DraftReview;
                        s.milestones = milestonesPayload;
                        formMethods.setValue('milestones', milestonesPayload);
                    });
                }

            }} />
        </>);
}

function paymentBreakdownIsValid(milestones: {
    advance: {
        [x: string]: any
    },
    workMilestones: {
        [x: string]: any
    }
}, totalValue: number) {
    let sum = 0;
    if (milestones.advance) {
        sum += milestones.advance.value;
    }
    if (milestones.workMilestones) {
        for (const index of Object.keys(milestones.workMilestones)) {
            if (typeof milestones.workMilestones[index].value == 'number') {
                sum += milestones.workMilestones[index].value;
            }
        }
    }
    return sum == totalValue
}