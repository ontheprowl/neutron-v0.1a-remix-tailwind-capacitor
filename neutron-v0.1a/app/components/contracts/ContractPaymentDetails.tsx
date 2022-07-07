import { useFormContext } from "react-hook-form";
import { ContractDataStore } from "~/stores/ContractStores";
import Select from 'react-select'
import { ContractCreationStages, Milestone } from "~/models/contracts";
import AddButton from "../inputs/AddButton";
import CrossButton from "../inputs/CrossButton";
import FormButton from "../inputs/FormButton";
import CurrencyInput from 'react-currency-input-field';
import AccentedToggle from "../layout/AccentedToggle";






export default function ContractPaymentDetails() {

    const deliverables = ContractDataStore.useState(s => s.deliverables);
    const milestones = ContractDataStore.useState(s => s.milestonesCount)
    let localMilestones: Array<Milestone> = [];
    let currentMilestone: Milestone;
    const formMethods = useFormContext();

    return (
        <>
            <h2 className="prose prose-lg mt-5 mb-3 text-white"> Payment Details </h2>
            <label htmlFor="simple-search" className="sr-only">Client Name</label>
            <div className="mb-5 flex flex-col space-y-5 sm:flex-row relative w-auto sm:items-end sm:space-x-3 justify-start align-middle">
                {/* <div className="relative w-auto ">
                    <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                        <svg className="w-5 h-5 text-white dark:text-black" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"></path></svg>
                    </div>
                    <input type="text" id="existing-client" className=" bg-[#4A4A4A] pt-3 pb-3 pl-10 pr-4 border-gray-300 text-white text-sm rounded-lg placeholder-white block w-auto h-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-white dark:text-white " placeholder="Search for an existing client" required />

                </div> */}
                <select id="payment-mode-select" {...formMethods.register('paymentMode')} className=" bg-[#4A4A4A] pt-3 pb-3 pl-4 pr-4 border-gray-300 text-white text-sm rounded-lg placeholder-white block w-auto h-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-white dark:text-white ">
                    <option value="one-time">A flat fee</option>
                    <option value="recurring">A recurring fee</option>
                </select>
                <CurrencyInput
                    prefix="₹"
                    id="contract-value-one-time"
                    placeholder="Cost"
                    defaultValue={1000}
                    decimalsLimit={2}
                    {...formMethods.register('totalValue')}
                    className=" bg-[#4A4A4A] pt-3 pb-3 pl-4 pr-4 space-x-3 border-gray-300 text-white text-sm rounded-lg placeholder-white block w-auto h-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-white dark:text-white "

                />
                <div className="hidden sm:flex sm:h-20 border-l-gray-500 border-l-2"></div>
                <CurrencyInput
                    prefix="₹"
                    id="contract-value-basee-pay"
                    placeholder="Cost"
                    defaultValue={1000}
                    decimalsLimit={2}
                    {...formMethods.register('basePay')}
                    className=" bg-[#4A4A4A] pt-3 pb-3 pl-4 pr-4 space-x-3 border-gray-300 text-white text-sm rounded-lg placeholder-white block w-auto h-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-white dark:text-white "

                />
            </div>
            <hr className="w-full mt-3 mb-5 border-solid border-gray-500"></hr>

            <label htmlFor="simple-search" className="sr-only">Search through contacts</label>

            <h2 className="prose prose-lg text-white mb-3"> Milestones </h2>

            <div className="overflow-y-scroll mb-5 max-h-72"> {[...Array(milestones).keys()]?.map((milestoneNumber) => {
                return (
                    <div key={milestoneNumber} id={`milestones-${milestoneNumber}`} className="flex flex-col sm:flex-row space-y-5 sm:space-y-0 sm:items-center sm:space-x-5 mb-5 w-auto justify-start">
                        <input type="text" {...formMethods.register(`milestones.${milestoneNumber}.name`)} className=" bg-[#4A4A4A] pt-3 pb-3 pl-4 pr-4 border-gray-300 text-white text-sm rounded-lg placeholder-white block w-auto h-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-white dark:text-white " placeholder="Name" required />
                        <br></br>
                        <input type="textarea" {...formMethods.register(`milestones.${milestoneNumber}.description`)} className=" bg-[#4A4A4A] pt-3 pb-3 pl-4 pr-4 border-gray-300 text-white text-sm rounded-lg placeholder-white block w-auto h-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-white dark:text-white " placeholder="Attach a relevant document" />
                        <input type="file" {...formMethods.register(`milestones.${milestoneNumber}.attachment`)} placeholder="Attach a relevant document" className="bg-[#4A4A4A]  border-gray-300 text-white text-sm rounded-lg placeholder-white block w-auto h-full dark:bg-gray-700 dark:border-gray-600 dark:placeholder-white dark:text-white" />

                        <input type="date" {...formMethods.register(`milestones.${milestoneNumber}.date`)} className=" bg-[#4A4A4A] pt-3 pb-3 pl-4 pr-4 border-gray-300 text-white text-sm rounded-lg placeholder-white block w-auto h-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-white dark:text-white " placeholder="Attach a relevant document" />
                        <AccentedToggle name={`milestones.${milestoneNumber}.isAdvance`} states={{default:'Delivery', toggled:'Advance'}}></AccentedToggle>

                        <AddButton onClick={() => {
                            ContractDataStore.update((s) => {
                                s.milestonesCount += 1;
                                currentMilestone = localMilestones[s.milestonesCount - 1];

                            });
                            console.log(`number of deliverables is : ${milestoneNumber}`);
                        }} className={""} />
                        {milestoneNumber > 0 ? <CrossButton onClick={() => {
                            ContractDataStore.update((s) => {
                                s.milestonesCount -= 1;
                                currentMilestone = localMilestones[s.deliverablesCount - 1];
                            });
                        }} className={""} /> : <div></div>}

                    </div>)
            })}</div>
            <FormButton text="Proceed" onClick={() => {
                ContractDataStore.update(s => {
                    s.stage = ContractCreationStages.DraftReview;
                    s.milestones = formMethods.getValues('milestones')
                    formMethods.unregister('milestones');
                });
            }} />
        </>);
}