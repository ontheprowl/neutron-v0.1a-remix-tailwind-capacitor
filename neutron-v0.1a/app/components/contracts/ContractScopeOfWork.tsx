import { MouseEvent } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { ContractDataStore } from "~/stores/ContractStores";
import { ContractCreationStages, Deliverable, DeliverableFormat } from "~/types/contracts";
import AddButton from "../inputs/AddButton";
import CrossButton from "../inputs/CrossButton";
import FormButton from "../inputs/FormButton";
import TransparentButton from "../inputs/TransparentButton";




export default function ContractScopeOfWork() {



    const formMethods = useFormContext();

    let localDeliverables: Array<Deliverable> = [];
    let currentDeliverable: Deliverable;
    const numberOfDeliverables = ContractDataStore.useState(s => s.deliverablesCount);

    return (
        <div className="flex flex-col w-full h-auto space-y-5">
            <h1 className="prose prose-lg text-white"> Scope of Work </h1>

            <h2 className="prose prose-md text-white"> What am I, the "Designer", being hired to do? </h2>
            <div className="flex flex-row w-full ">
                <input type="textarea" {...formMethods.register('description')} id="job-description" className=" bg-[#4A4A4A] h-32 pt-3 pb-3 pl-4 pr-4 border-gray-300 text-white text-sm rounded-lg placeholder-white w-full dark:bg-gray-700 dark:border-gray-600 dark:placeholder-white dark:text-white overflow-visible" placeholder="Refer to yourself as the 'Designer' and your client as the 'Client'.

The clearer you define your work, the better. Spell out what you'll do, including deliverables and dates. If necessary, you can attach a more detailed Statement of Work." required />
            </div >
            <h2 className="prose prose-md text-white mt-5"> Proposal</h2>

            <input type="file" {...formMethods.register('attachment')}placeholder="Attach a relevant document" className="block w-auto max-w-fit text-sm bg-[#4A4A4A] text-white rounded-lg cursor-pointer dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" />
            <h2 className="prose prose-lg text-white"> Deliverables </h2>


            <div className="overflow-y-scroll max-h-28"> {[...Array(numberOfDeliverables).keys()].map((deliverableInputNumber) => {
                return (
                    <div key={deliverableInputNumber} className="flex flex-row space-x-5 mb-5 w-auto justify-start">
                        <input type="text" {...formMethods.register(`deliverables.${deliverableInputNumber}.name`)} className=" bg-[#4A4A4A] pt-3 pb-3 pl-4 pr-4 border-gray-300 text-white text-sm rounded-lg placeholder-white block w-auto h-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-white dark:text-white " placeholder="Name" required />
                        <select key={deliverableInputNumber} id={`deliverable-${deliverableInputNumber}`} {...formMethods.register(`deliverables.${deliverableInputNumber}.format`)} className=" bg-[#4A4A4A] pt-3 pb-3 pl-4 pr-4 border-gray-300 text-white text-sm rounded-lg placeholder-white block w-auto h-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-white dark:text-white " placeholder="Format" required>
                            <option value={0}>PDF</option>
                            <option value={1}>JPEG</option>
                            <option value={2}>MP4</option>
                        </select>
                        <br></br>
                        <input type="textarea" {...formMethods.register(`deliverables.${deliverableInputNumber}.description`)} className=" bg-[#4A4A4A] pt-3 pb-3 pl-4 pr-4 border-gray-300 text-white text-sm rounded-lg placeholder-white block w-auto h-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-white dark:text-white " placeholder="Attach a relevant document" />
                        <input type="date" {...formMethods.register(`deliverables.${deliverableInputNumber}.date`)} className=" bg-[#4A4A4A] pt-3 pb-3 pl-4 pr-4 border-gray-300 text-white text-sm rounded-lg placeholder-white block w-auto h-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-white dark:text-white " placeholder="Attach a relevant document" />
                        <div className="flex flex-row items-center  pl-3 pr-3">
                            <label className="mr-3">Is This a Milestone?</label>
                            <input type="checkbox" value="false" {...formMethods.register(`deliverables.${deliverableInputNumber}.isMilestone`)} className=" bg-[#4A4A4A] pt-3 pb-3 pl-4 pr-4 border-gray-300 text-white text-sm rounded-lg placeholder-white block w-auto h-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-white dark:text-white " placeholder="Attach a relevant document" />

                        </div>
                        <AddButton onClick={() => {
                            ContractDataStore.update((s) => {
                                s.deliverablesCount += 1;
                                currentDeliverable = localDeliverables[s.deliverablesCount - 1];

                            });
                            console.log(`number of deliverables is : ${numberOfDeliverables}`);
                        }} className={""} />
                        {deliverableInputNumber > 0 ? <CrossButton onClick={() => {
                            ContractDataStore.update((s) => {
                                s.deliverablesCount -= 1;
                                currentDeliverable = localDeliverables[s.deliverablesCount - 1];
                            });
                        }} className={""} /> : <div></div>}

                    </div>)
            })}</div>

            <div className="flex flex-row space-x-3">
                <FormButton text="Proceed" onClick={() => {
                    ContractDataStore.update(s => {
                        s.stage = ContractCreationStages.PaymentAndMilestones;
                        s.description=formMethods.getValues('description')
                        s.deliverables = formMethods.getValues('deliverables');
                        formMethods.unregister('deliverables');
                    });
                }} />
                <TransparentButton text="Save As Draft" onClick={function (event: MouseEvent<HTMLButtonElement>): void {
                    throw new Error("Function not implemented.");
                }} className={""} />
            </div>

        </div>);
}