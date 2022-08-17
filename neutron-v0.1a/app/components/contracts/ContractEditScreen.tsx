import { useFormContext } from "react-hook-form"
import { Contract, ContractStatus } from "~/models/contracts";
import { animateScroll, Link as ScrollLink } from 'react-scroll';
import GenericContractTemplate from '~/components/contracts/GenericContractTemplate';
import TransparentButton from "../inputs/TransparentButton";
import FormButton from "../inputs/FormButton";
import ContractCustomizationComponent from "./ContractCustomizationComponent";
import { useFetcher, useLoaderData, useParams } from "@remix-run/react";
import { ContractDataStore } from "~/stores/ContractStores";
import { ContractEvent, NeutronEvent } from "~/models/events";
import { checkForSpecificEvent } from "~/utils/utils";
import MobileNavbarPadding from "../layout/MobileNavbarPadding";
import { primaryGradientDark } from "~/utils/neutron-theme-extensions";
import AccentedToggle from "../layout/AccentedToggleV1";





export default function ContractEditScreen({ viewMode }: { viewMode?: boolean }) {
    const loaderData = useLoaderData();
    const { username } = useParams();
    let data: Contract = loaderData.contract;
    let events: NeutronEvent[] = loaderData.contractEvents;

    const formMethods = useFormContext();

    console.log("events here are:")
    if (viewMode) {
        console.dir(events)
    }
    let metadata = loaderData.metadata;

    const status = ContractDataStore.useState(s => s.status)
    let fetcher = useFetcher();

    return (
        <div className="flex flex-col sm:flex-row space-y-5 sm:space-x-10 justify-start">
            <div className="bg-white h-full w-auto basis-2/3 border-2">
                <GenericContractTemplate></GenericContractTemplate>
            </div>
            <div className="flex flex-col h-auto w-full basis-1/3 ">

                <div className="flex flex-col space-y-3 sm:flex-row sm:space-x-3 m-5 justify-end">
                    {/** TODO: ADD NECESSARY DATA GATHERING FOR SIGNING LOGIC HERE, THEN MIGRATE SIGNING API SUBMISSIONS TO ANOTHER LOCATION */}
                    {viewMode && events[events.length - 1].event == ContractEvent.ContractPublished && metadata?.email == data.providerEmail ? <TransparentButton className="w-40 mt-5 rounded-lg bg-accent-dark p-3 text-white transition-all border-2 border-white hover:border-accent-dark outline-none focus:ring-1 focus:ring-white hover:bg-bg-primary-dark" text="Sign" onClick={() => {
                        const form = new FormData();
                        form.append('email', data.providerEmail)
                        fetcher.submit(form, { action: `/${metadata.displayName}/sign/${data.id}`, method: 'post' })
                    }}></TransparentButton> : <></>}
                    {viewMode && events[events.length - 1].event == ContractEvent.ContractPendingSignByClient && data.clientEmail && metadata?.email == data.clientEmail ? <TransparentButton className="w-40 mt-5 rounded-lg bg-accent-dark p-3 text-white transition-all border-2 border-white hover:border-accent-dark outline-none focus:ring-1 focus:ring-white hover:bg-bg-primary-dark" text="Sign" onClick={() => {
                        const form = new FormData();
                        form.append('email', data.clientEmail)
                        form.append('isClient', 'true')
                        fetcher.submit(form, { action: `/${username}/sign/${data.id}`, method: 'post' })
                    }}></TransparentButton> : <></>}


                    <div className="flex flex-col space-y-2 w-full">
                        <div className="flex flex-row space-x-4 items-center">
                            <AccentedToggle variant="neutron-purple" name={'isPublished'} onToggle={() => {
                                ContractDataStore.update(s => {
                                    if (s.status == ContractStatus.Draft) {
                                        s.status = ContractStatus.Published
                                    } else {
                                        s.status = ContractStatus.Draft;
                                    }
                                }
                                )
                            }}></AccentedToggle>
                            <div className="flex flex-col text-white">
                                <h1 className="font-gilroy-bold text-[18px]">Draft / Publish</h1>
                                <p className="font-gilroy-regular text-[14px] text-gray-300"> Do you wish to publish this contract ?</p>
                            </div>


                        </div>
                        {!viewMode && <FormButton onClick={(e) => {
                            if (e.currentTarget.type != "submit") {
                                console.log("This contract is being saved to drafts")
                                console.log("This is the contract creation data")
                                const data: {
                                    [x: string]: any;
                                } = { ...formMethods.getValues(), isPublished: false };
                                console.dir(data);
                                const formdata = new FormData();

                                //TODO: Creator specific contract 
                                // if (creator == ContractCreator.IndividualServiceProvider) {
                                //     data = { ...data, providerEmail: user?.email }
                                // }
                                // else {
                                //     const actualProviderEmail = data.clientEmail;
                                //     if (actualProviderEmail) {
                                //         data = { ...data, providerEmail: actualProviderEmail, clientEmail: user?.email }

                                //     }
                                // }
                                for (const [key, value] of Object.entries(data)) {

                                    if (key.includes('attachment')) {
                                        data[key] = value.item(0)
                                    }

                                    if (key.includes('milestone')) {
                                        // for (const [milestoneKey,milestone] of Object.entries(value.workMilestones)) {
                                        //     milestone.attachment = milestone.attachment.item(0);
                                        // }
                                        data[key] = JSON.stringify(value)

                                    }

                                    formdata.append(key, data[key]);

                                }

                                console.log("This is the contract creation data ( after pre-processing ) [DRAFTS] ")
                                console.dir(data);


                                fetcher.submit(formdata, { method: "post", encType: 'multipart/form-data' });
                            }

                        }} submit={status == ContractStatus.Published ? true : undefined} text="Publish Contract" ></FormButton>}
                    </div>


                </div>
                {!viewMode && <div className="border-2 border-accent-dark rounded-xl m-5 mt-2">

                    <ContractCustomizationComponent></ContractCustomizationComponent>

                </div>}
                <MobileNavbarPadding></MobileNavbarPadding>
                <MobileNavbarPadding></MobileNavbarPadding>

            </div>

        </div>)
}