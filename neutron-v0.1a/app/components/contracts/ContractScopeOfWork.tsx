import { MouseEvent, useEffect } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { ContractDataStore } from "~/stores/ContractStores";
import { ContractCreationStages, Deliverable, DeliverableFormat } from "~/models/contracts";
import AddButton from "../inputs/AddButton";
import CrossButton from "../inputs/CrossButton";
import FormButton from "../inputs/FormButton";
import TransparentButton from "../inputs/TransparentButton";
import AccentedToggle from "../layout/AccentedToggle";
import { isEmpty, minStartDate } from "~/utils/utils";
import { ErrorMessage } from "@hookform/error-message";
import { toast } from "react-toastify";




export default function ContractScopeOfWork() {



    const formMethods = useFormContext();
    const errors = formMethods.formState.errors;
    const trigger = formMethods.trigger;


    const description = useWatch({ name: 'description' })
    const businessType = useWatch({ name: 'businessType' })


    useEffect(() => {
        trigger()
    }, [description, businessType, trigger])


    return (
        <div className="flex flex-col w-full h-auto space-y-5">
            <h1 className="prose prose-lg text-white font-gilroy-bold text-[24px]"> Scope of Work </h1>


            <div className="flex flex-row w-full space-x-4">
                <div className="flex flex-col justify-start space-y-2 mt-3">
                    <h2 className="prose prose-md text-white font-gilroy-regular text-[18px]"> Type of Work </h2>
                    <select id="work-type-select" {...formMethods.register('workType')} className=" bg-[#4A4A4A] p-3  text-white text-sm rounded-lg placeholder-white block w-auto h-auto dark:bg-gray-700 dark:border-gray-600 dark:placeholder-white dark:text-white ">
                        <option value="Accounting & Finance">Accounting & Finance</option>
                        <option value="Development & IT">Development & IT</option>
                        <option value="Design & Creative">Design & Creative</option>
                        <option value="Sales & Marketing">Sales & Marketing</option>
                        <option value="Writing & Translation">Writing & Translation</option>
                        <option value="Admin & Customer Support">Admin & Customer Support</option>
                        <option value="HR & Training">HR & Training</option>
                        <option value="Legal">Legal</option>
                        <option value="Engineering & Architecture">Engineering & Architecture</option>
                        <option value="Other">Other</option>
                        {/* <option value="Consulting">Consulting</option>
                        <option value="Digital Marketing">Digital Marketing</option>
                        <option value="Design">Design</option>
                        <option value="Engineering">Engineering</option>
                        <option value="Finance">Finance</option>
                        <option value="Wellness">Wellness</option>
                        <option value="Graphic Design">Graphic Design</option>
                        <option value="Human Resources">Human Resources</option>
                        <option value="IT Consulting">IT Consulting</option>
                        <option value="Influencer">Influencer</option>
                        <option value="Legal">Legal</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Music Production">Music Production</option>
                        <option value="Performing Arts">Performing Arts</option>
                        <option value="Photography">Photography</option>
                        <option value="Podcasting">Podcasting</option>
                        <option value="Product Management">Product Management</option>
                        <option value="Product Management">Product Management</option>
                        <option value="Product Management">Product Management</option>
                        <option value="Product Management">Product Management</option>
                        <option value="Product Management">Product Management</option>
                        <option value="Product Management">Product Management</option>
                        <option value="Public Relations">Public Relations</option>
                        <option value="Recruitment">Recruitment</option>
                        <option value="Digital Media Management">Digital Media Management</option>
                        <option value="Software Engineering">Software Engineering</option>
                        <option value="Translation/Interpretation">Translation/Interpretation</option>
                        <option value="Production">Production</option>
                        <option value="Virtual Assistant">Virtual Assistant</option>
                        <option value="Videography">Videography</option>
                        <option value="Web Design">Web Design</option>
                        <option value="Web Development">Web Development</option>
                        <option value="Writing/Editing">Writing/Editing</option>
                        <option value="Youtuber">Youtuber</option>
                        <option value="Other">Other</option> */}
                    </select>
                </div>

                <div className="flex flex-col justify-start space-y-2 mt-3">
                    <h2 className="prose prose-md text-white font-gilroy-regular text-[18px]"> What best describes your business? </h2>
                    <select id="business-type-select" {...formMethods.register('businessType')} className=" bg-[#4A4A4A] p-3  text-white text-sm rounded-lg placeholder-white block w-auto h-auto dark:bg-gray-700 dark:border-gray-600 dark:placeholder-white dark:text-white ">
                        <option value="Just starting out">Just starting out</option>
                        <option value="Part-time Freelancer">Part-time Freelancer</option>
                        <option value="Full-time Freelancer or Business Owner">Full-time Freelancer or Business Owner</option>
                        <option value="Agency/Studio or Enterprise">Agency/Studio or Enterprise</option>
                    </select>
                </div>
                {businessType == "Agency/Studio or Enterprise" && <div className="flex flex-col justify-start space-y-2 mt-3 ">
                    <h2 className="prose prose-md text-white font-gilroy-regular text-[18px]">Does your business work with: </h2>
                    <select id="employee-type-select" {...formMethods.register('employeeType')} className=" bg-[#4A4A4A] p-3  text-white text-sm rounded-lg placeholder-white block w-auto h-auto dark:bg-gray-700 dark:border-gray-600 dark:placeholder-white dark:text-white ">
                        <option value="Full-time employees">Full-time employees</option>
                        <option value="Subcontractors">Subcontractors</option>
                        <option value="Combination of both">Combination of both</option>
                    </select>
                </div>}
                {businessType != "Agency/Studio or Enterprise" && <div className="flex flex-col justify-start space-y-2 mt-3">
                    <h2 className="prose prose-md text-white font-gilroy-regular text-[18px]"> Is your business registered/incorporated? </h2>
                    <select id="is-registered" {...formMethods.register('isRegistered')} className=" bg-[#4A4A4A] p-3  text-white text-sm rounded-lg placeholder-white block w-auto h-auto dark:bg-gray-700 dark:border-gray-600 dark:placeholder-white dark:text-white ">
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                    </select>
                </div>}
            </div>


            <div className="flex flex-row w-full ">
                <textarea defaultValue={''} {...formMethods.register('description', { required: 'The job description is mandatory', minLength: { value: 140, message: 'The job description needs to be at least 140 characters long' } })} id="job-description" className=" bg-[#4A4A4A] h-32 pt-3 pb-3 pl-4 pr-4 border-gray-300 text-white  text-sm rounded-lg placeholder-white w-full dark:bg-gray-700 dark:border-gray-600  dark:placeholder-white dark:text-white placeholder:overflow-ellipsis sm:overflow-visible" placeholder="Refer to yourself as the 'Designer' and your client as the 'Client'. The clearer you define your work, the better. Spell out what you'll do, including deliverables and dates. If necessary, you can attach a more detailed Statement of Work." required />
                <div className="hidden sm:flex sm:h-30 w-5 border-l-gray-500 border-l-2 ml-3"></div>

                <article className="prose prose-sm text-white break-normal font-gilroy-regular">A clear, complete Scope of Work outlines the work to be done, how it will be completed and by whom, and the expected outcomes. By knowing exactly what a Scope is and what it should contain, you can get your budget estimate off to a strong start, setting your project up for success even before kick-off.</article>
            </div >
            <div className="w-full h-8 mt-3 text-left">
                <ErrorMessage errors={errors} name='description' render={(data) => {
                    return <span className="text-red-500 p-2 flex-wrap z-10">{data.message}</span>
                }} />
            </div>
            <h2 className="prose prose-md text-white mt-5 font-gilroy-bold text-[24px]"> Supporting Document</h2>

            <input type="file" {...formMethods.register('attachment')} placeholder="Attach a relevant document" className="block w-auto max-w-fit text-sm bg-[#4A4A4A] text-white rounded-lg cursor-pointer dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 font-gilroy-regular text-[14px]" />


            <div className="flex flex-row space-x-3 space-y-0">
                <FormButton className="w-40 rounded-lg  bg-accent-dark p-3 border-2 border-transparent active:bg-amber-300 outline-none focus:ring-1 focus:ring-white focus:border-white hover:border-white hover:ring-white text-white transition-all"
                    text="Proceed" onClick={() => {
                        if (!isEmpty(errors)) {
                            toast("Invalid values detected for contract fields!", { theme: 'dark', type: 'warning' })
                        } else {
                            ContractDataStore.update(s => {
                                s.stage = ContractCreationStages.PaymentAndMilestones;
                                s.description = formMethods.getValues('description')
                                s.deliverables = formMethods.getValues('deliverables');
                                formMethods.unregister('deliverables');
                            });
                        }

                    }} />
                <TransparentButton text="Save As Draft" onClick={function (event: MouseEvent<HTMLButtonElement>): void {
                    throw new Error("Function not implemented.");
                }} className="w-40 mt-5 rounded-lg bg-accent-dark p-3 text-white transition-all border-2 border-white hover:border-accent-dark outline-none focus:ring-1 focus:ring-white hover:bg-bg-primary-dark"
                />
            </div>

        </div>);
}