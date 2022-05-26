import { useFormContext } from "react-hook-form";
import { ContractStageStore } from "~/stores/ContractStageStore";




export default function ContractScopeOfWork() {

    const formMethods = useFormContext();

    const numberOfDeliverables = ContractStageStore.useState(s => s.deliverables);

    return (
        <div className="flex flex-col space-x-3 space-y-10">
            <h2 className="prose prose-md text-black"> What am I, the "Designer", being hired to do? </h2>
            <div className="relative w-auto max-w-lg">
                <input type="textarea" {...formMethods.register('job-description')} id="job-description" className="p-5 bg-bg-primary-dark border border-gray-300 text-gray-900 text-sm rounded-lg placeholder-white block w-full pl-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white " placeholder="Refer to yourself as the 'Designer' and your client as the 'Client'.

The clearer you define your work, the better. Spell out what you'll do, including deliverables and dates. If necessary, you can attach a more detailed Statement of Work." required />
            </div >
            <h2 className="prose prose-md text-black"> Deliverables </h2>

            <div className="relative w-auto max-w-lg">
                <button className="w-40 rounded-lg bg-accent-dark p-3 text-white transition-all hover:scale-105" onClick={() => {
                    ContractStageStore.update((s) => {
                        s.deliverables += 1;
                    })
                    console.log(`number of deliverables is : ${numberOfDeliverables}`)
                }} >Add Deliverable</button>
                <button className="w-40 rounded-lg bg-accent-dark p-3 text-white transition-all hover:scale-105" onClick={() => {
                    ContractStageStore.update((s) => {
                        s.deliverables -= 1;
                    })
                }} >Delete Deliverable</button>
            </div>
            {[...Array(numberOfDeliverables).keys()].map((deliverableInputNumber) => {
                return (
                    <div key={deliverableInputNumber} id={`deliverable-${deliverableInputNumber}`} className="flex flex-row">
                        <input type="text" {...formMethods.register(`deliverable-${deliverableInputNumber}-name`)} className="p-5 bg-bg-primary-dark border border-gray-300 text-gray-900 text-sm rounded-lg placeholder-white block w-full pl-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white " placeholder="Name" required />
                        <select key={deliverableInputNumber} id={`deliverable-${deliverableInputNumber}`} {...formMethods.register(`deliverable-${deliverableInputNumber}-format`)} className="p-5 bg-bg-primary-dark border text-white border-gray-300 text-gray-900 text-sm rounded-lg placeholder-white block w-full pl-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white " placeholder="Format" required>
                            <option value="PDF">PDF</option>
                            <option value="JPEG">JPEG</option>
                            <option value="MP4">MP4</option>
                        </select>
                        <br></br>
                        <input type="file" {...formMethods.register(`deliverable-${deliverableInputNumber}-document`)} placeholder="Attach a relevant document" />
                    </div>)
            })}

            <input readOnly value="Continue" className="w-40 rounded-lg bg-accent-dark p-3 mt-5text-white transition-all hover:scale-105" onClick={() => {
                ContractStageStore.update(s => {
                    s.stage = 4;
                });
            }} />
        </div>);
}