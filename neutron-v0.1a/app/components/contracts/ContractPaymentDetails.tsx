import { useFormContext } from "react-hook-form";
import { ContractDataStore } from "~/stores/ContractStores";
import Select from 'react-select'





export default function ContractPaymentDetails() {

    const formMethods = useFormContext();

    return (
        <>
            <h2 className="prose prose-lg mt-5 text-white"> Payment Details </h2>
            <label htmlFor="simple-search" className="sr-only">Client Name</label>
            <div className="mb-5 flex flex-row relative w-auto items-end space-x-3 justify-start align-middle">
                {/* <div className="relative w-auto ">
                    <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                        <svg className="w-5 h-5 text-white dark:text-black" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"></path></svg>
                    </div>
                    <input type="text" id="existing-client" className=" bg-[#4A4A4A] pt-3 pb-3 pl-10 pr-4 border-gray-300 text-white text-sm rounded-lg placeholder-white block w-auto h-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-white dark:text-white " placeholder="Search for an existing client" required />

                </div> */}
                <select id="country-select" {...formMethods.register('contractPenalty')} className=" bg-[#4A4A4A] pt-3 pb-3 pl-4 pr-4 border-gray-300 text-white text-sm rounded-lg placeholder-white block w-auto h-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-white dark:text-white ">
                    <option value="one-time">A flat fee</option>
                    <option value="recurring">A recurring fee</option>
                </select>
                <input type="text" id="client-name" {...formMethods.register('clientName')} onChange={(e) => {
                    ContractDataStore.update((s) => {
                        s.clientName = e.target.value;
                    })
                }} className=" bg-[#4A4A4A] pt-3 pb-3 pl-4 pr-4 border-gray-300 text-white text-sm rounded-lg placeholder-white block w-auto h-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-white dark:text-white " placeholder="Cost" required />
                <div className="flex h-20 border-l-gray-500 border-l-2"></div>
                <input type="text" id="client-email" {...formMethods.register('clientEmail')} onChange={(e) => {
                    ContractDataStore.update((s) => {
                        s.clientEmail = e.target.value;
                    })
                }}
                    className=" bg-[#4A4A4A] pt-3 pb-3 pl-4 pr-4 border-gray-300 text-white text-sm rounded-lg placeholder-white block w-auto h-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-white dark:text-white " placeholder="Base Pay" required />

            </div>
            <hr className="w-full mt-3 mb-5 border-solid border-gray-500"></hr>

            <label htmlFor="simple-search" className="sr-only">Search through contacts</label>

            <h2 className="prose prose-lg text-white"> Deliverables </h2>


            <div className="overflow-y-scroll max-h-28"> {[...Array(numberOfDeliverables).keys()].map((deliverableInputNumber) => {
                return (
                    <div key={deliverableInputNumber} id={`deliverable-${deliverableInputNumber}`} className="flex flex-row space-x-5 mb-5 w-auto justify-start">
                        <input type="text" {...formMethods.register(`deliverable-${deliverableInputNumber}-name`)} onChange={(e) => {
                            ContractDataStore.update((s) => {
                                currentDeliverable.name = e.currentTarget.value;
                            })
                        }} className=" bg-[#4A4A4A] pt-3 pb-3 pl-4 pr-4 border-gray-300 text-white text-sm rounded-lg placeholder-white block w-auto h-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-white dark:text-white " placeholder="Name" required />
                        <select key={deliverableInputNumber} id={`deliverable-${deliverableInputNumber}`} {...formMethods.register(`deliverable-${deliverableInputNumber}-format`)} onChange={(e) => {
                            ContractDataStore.update((s) => {
                                currentDeliverable.format = e.currentTarget.value as unknown as number;
                            })
                        }} className=" bg-[#4A4A4A] pt-3 pb-3 pl-4 pr-4 border-gray-300 text-white text-sm rounded-lg placeholder-white block w-auto h-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-white dark:text-white " placeholder="Format" required>
                            <option value={0}>PDF</option>
                            <option value={1}>JPEG</option>
                            <option value={2}>MP4</option>
                        </select>
                        <br></br>
                        <input type="textarea" {...formMethods.register(`deliverable-${deliverableInputNumber}-document`)} onChange={(e) => {
                            ContractDataStore.update((s) => {
                                currentDeliverable.description = e.currentTarget.value;
                            })
                        }} className=" bg-[#4A4A4A] pt-3 pb-3 pl-4 pr-4 border-gray-300 text-white text-sm rounded-lg placeholder-white block w-auto h-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-white dark:text-white " placeholder="Attach a relevant document" />
                        <input type="date" {...formMethods.register(`deliverable-${deliverableInputNumber}-document`)} onChange={(e) => {
                            ContractDataStore.update((s) => {
                                currentDeliverable.expectedDate = e.currentTarget.valueAsDate;
                            })
                        }} className=" bg-[#4A4A4A] pt-3 pb-3 pl-4 pr-4 border-gray-300 text-white text-sm rounded-lg placeholder-white block w-auto h-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-white dark:text-white " placeholder="Attach a relevant document" />
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
            <h2 className="prose prose-md text-black"> In case of premature termination, the Client will pay </h2>
            <label htmlFor="country-select" className="sr-only">The client will pay</label>

            <input readOnly value="Finalize" className="w-40 rounded-lg bg-accent-dark p-3 text-white transition-all hover:scale-105" onClick={() => {
                ContractDataStore.update(s => {
                    s.stage = 5;
                });
            }} />
        </>);
}