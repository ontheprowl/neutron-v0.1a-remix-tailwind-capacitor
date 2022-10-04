import { useFormContext } from "react-hook-form"
import { Contract, ContractCreationStages, ContractCreator, ContractStatus } from "~/models/contracts";
import { animateScroll, Link as ScrollLink } from 'react-scroll';
import GenericContractTemplate from '~/components/contracts/GenericContractTemplate';
import TransparentButton from "../inputs/TransparentButton";
import FormButton from "../inputs/FormButton";
import ContractCustomizationComponent from "./ContractCustomizationComponent";
import { useFetcher, useLoaderData, useParams, useTransition } from "@remix-run/react";
import { ContractDataStore } from "~/stores/ContractStores";
import { ContractEvent, NeutronEvent } from "~/models/events";
import MobileNavbarPadding from "../layout/MobileNavbarPadding";
import { primaryGradientDark } from "~/utils/neutron-theme-extensions";
import AccentedToggle from "../layout/AccentedToggleV1";
import PurpleWhiteButton from "../inputs/PurpleWhiteButton";
import { returnUserUIDAndUsername } from "~/utils/utils";
import DefaultSpinner from "../layout/DefaultSpinner";
import { Transition } from "@remix-run/react/transition";
import { useState } from "react";





export default function ContractEditScreen({ viewMode }: { viewMode?: boolean }) {
    const loaderData = useLoaderData();
    const { username } = useParams();

    const creator = ContractDataStore.useState(s => s.creator);
    let data: Contract = loaderData.contract;
    let events: NeutronEvent[] = loaderData.contractEvents;
    const users = loaderData.users;

    const publishContractStates = (transition: Transition) => {
        const isPublished = transition.submission?.formData.get('isPublished');
        console.log("isPublished [PUBLISH STATES GENERATOR ] ")
        console.log(isPublished);
        if (isPublished === "true") {
            switch (transition.state) {
                case "idle":
                    return (<span> Publish Contract</span>);
                case "submitting":
                    return (<span>Publishing Contract</span>);
                case "loading":
                    return (<DefaultSpinner></DefaultSpinner>);
            }
        }
        else {
            return (<span>Publish Contract</span>)
        }

    }

    const draftContractStates = (state: string) => {
        const isPublished = transition.submission?.formData.get('isPublished');
        console.log("isPublished [DRAFT STATES GENERATOR ] ")
        console.log(isPublished);

        if (isPublished != "true") {
            switch (transition.state) {
                case "idle":
                    return (<span> Draft Contract</span>);
                case "submitting":
                    return (<span>Drafting Contract</span>);
                case "loading":
                    return (<DefaultSpinner></DefaultSpinner>);
            }
        }
        else {
            return (<span>Draft Contract</span>)
        }

    }
    const transition = useTransition();
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
            <div className="bg-white h-[90vh] sm:h-auto w-auto basis-2/3 ring-1 ring-bg-secondary-dark  bg-opacity-90">
                <GenericContractTemplate viewMode={viewMode}></GenericContractTemplate>
            </div>
            <div className="flex flex-col h-auto w-full basis-1/3 ">

                <div className="flex flex-col space-y-3  items-center sm:flex-row sm:w-full sm:space-x-3 m-5 sm:justify-between">
                    {/** TODO: ADD NECESSARY DATA GATHERING FOR SIGNING LOGIC HERE, THEN MIGRATE SIGNING API SUBMISSIONS TO ANOTHER LOCATION */}
                    {viewMode && events[events.length - 1] && events[events.length - 1].event == ContractEvent.ContractPublished && metadata?.email == data.providerEmail ?
                        <button onClick={() => {
                            const form = new FormData();
                            form.append('email', data.providerEmail);
                            form.append('id', data.providerID);
                            form.append('viewers', JSON.stringify(data.viewers));
                            // E
                            fetcher.submit(form, { action: `/${username}/sign/${data.id}`, method: 'post' });
                        }} className=' p-4 text-center bg-[#E6E0FA] sm:w-full text-[#765AD1] basis-1/2 prose prose-md transition-all rounded-lg active:border-white whitespace-nowrap hover:bg-white'>{`Sign as the Service Provider`}</button> : <></>}
                    {viewMode && events[events.length - 1] && events[events.length - 1].event == ContractEvent.ContractPendingSignByClient && data.clientEmail && metadata?.email == data.clientEmail ? <button onClick={() => {
                        const form = new FormData();
                        form.append('email', data.clientEmail)
                        form.append('isClient', 'true');
                        form.append('id', data.clientID);
                        form.append('viewers', JSON.stringify(data.viewers));

                        fetcher.submit(form, { action: `/${username}/sign/${data.id}`, method: 'post' })
                    }} className=' p-4 text-center bg-[#E6E0FA] sm:w-full text-[#765AD1] basis-1/2 prose prose-md transition-all rounded-lg active:border-white whitespace-nowrap hover:bg-white'>{`Sign as the Client`}</button> : <></>}


                    <div className="flex flex-col space-y-2 w-full">
                        {/* {!viewMode && <div className="flex flex-row space-x-4 items-center">
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


                        </div>} */}
                        {!viewMode &&
                            <div className="flex flex-row space-x-6">
                                <FormButton submit={true} text={publishContractStates(transition)} ></FormButton>
                                <TransparentButton variant="light" text={draftContractStates(transition)} onClick={(e) => {
                                    console.log("This contract is being saved to drafts")
                                    console.log("This is the contract creation data")
                                    let data: {
                                        [x: string]: any;
                                    } = { ...formMethods.getValues(), isPublished: false };
                                    console.dir(data);
                                    const formdata = new FormData();

                                    //TODO: Creator specific contract 
                                    // if (creator == ContractCreator.IndividualServiceProvider) {
                                    //     console.log("Creator is the service Provider ");
                                    //     data = { ...data, providerEmail: metadata?.email, providerName: metadata?.firstName + ' ' + metadata?.lastName, creator: metadata?.email }
                                    //     console.dir(data)

                                    // }
                                    // else {
                                    //     console.log("The creator is the client ");
                                    //     data = { ...data, clientEmail: metadata?.email, clientName: metadata?.firstName + ' ' + metadata?.lastName, creator: metadata?.email }
                                    //     console.dir(data)


                                    // }
                                    const clientAdditionalDetails = returnUserUIDAndUsername(data.clientEmail, users);
                                    const providerAdditionalDetails = returnUserUIDAndUsername(data.providerEmail, users);
                                    data = { ...data, clientID: clientAdditionalDetails.uid, providerID: providerAdditionalDetails.uid, clientUsername: clientAdditionalDetails.username, providerUsername: providerAdditionalDetails.username, viewers: JSON.stringify([providerAdditionalDetails.uid, clientAdditionalDetails.uid]) };

                                    for (const [key, value] of Object.entries(data)) {
                                        console.log(" KEY IS : " + key)
                                        if (key.includes('attachment')) {
                                            data[key] = value.item(0)
                                        }

                                        if (key.includes('milestonesProcessed')) {
                                            // for (const [milestoneKey,milestone] of Object.entries(value.workMilestones)) {
                                            //     milestone.attachment = milestone.attachment.item(0);
                                            // }
                                            data[key] = JSON.stringify(value)

                                        }

                                        if (key === 'milestones') {
                                            console.log("REDUNDANT MILESTONES DETECTED")
                                            continue;
                                        }

                                        formdata.append(key, data[key]);

                                    }

                                    console.log("This is the contract creation data ( after pre-processing ) [DRAFTS] ")
                                    console.dir(data);

                                    fetcher.submit(formdata, { method: "post", encType: 'multipart/form-data' });


                                }} className="w-full  rounded-lg bg-accent-dark text-white transition-all border-2 border-white hover:border-accent-dark outline-none focus:ring-1 focus:ring-white hover:bg-bg-primary-dark"
                                />
                            </div>}
                    </div>


                </div>
                <div className="hidden sm:flex sm:flex-col border-2 border-purple-400 rounded-xl m-5 mt-2">

                    <ContractCustomizationComponent viewMode={viewMode}></ContractCustomizationComponent>

                </div>
                <MobileNavbarPadding></MobileNavbarPadding>
                <MobileNavbarPadding></MobileNavbarPadding>

            </div>

        </div>)
}