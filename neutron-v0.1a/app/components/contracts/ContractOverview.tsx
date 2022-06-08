



export default function ContractOverview({ data }) {

    return <>
        <div className="flex flex-row w-auto h-auto justify-between m-4">
            {/*
Escrow section
*/}
            <div className="flex flex-col w-full mr-5 h-auto justify-between border-accent-dark border-2 border-solid rounded-lg bg-bg-primary-dark text-white">
                <div className="flex flex-row m-5 justify-between">
                    <h2>Escrow Timeline</h2>
                    <p>Status: Dispatched to Neutron Escrow Account</p>
                </div>
                <div className="flex flex-row m-5 space-x-3 items-center">
                    <h2>{data.clientName}</h2>
                    <img src="progressLineActive.svg"
                        className="mr-3 h-4 " alt="progressLineActive"></img>
                    <div className="flex flex-col space-y-1 items-center">
                        <img
                            src="icon.svg"
                            className=" transition-all h-20 w-20"
                            alt="Neutron Logo"
                        />
                        <h2 className="prose prose-md text-white">$2000</h2>
                    </div>
                    <img src="progressLineActive.svg" className="h-4"></img>
                    <h2>{data.providerName}</h2>
                </div>
            </div>
        </div>
        <img src="gradientLineSeparator.svg" className="h-2" alt="Separator"></img>
        {/*
Milestones section
*/}
        <div className="flex flex-row w-auto h-auto justify-between m-4">
            <div className="flex flex-col w-full mr-5 h-auto justify-between border-accent-dark border-2 border-solid rounded-lg bg-bg-primary-dark text-white">
                <div className="flex flex-row m-5 justify-between">
                    <h2>Project Milestones</h2>
                    <p>Status: Working on UI / Wireframes </p>
                </div>
                <div className="flex flex-row m-5 space-x-3 items-center">
                    {data?.milestones?.map((milestone) => {
                        return (
                            <>
                                <div key={milestone.name} className="flex flex-col">
                                    <h2>{milestone.name}</h2>
                                    <h2>{milestone.date}</h2>
                                </div>
                                <img src="progressLineActive.svg"
                                    className="mr-3 h-2 " alt="progressLineActive">
                                </img>
                            </>

                        );
                    })}
                </div>
            </div>
        </div>
        <img src="gradientLineSeparator.svg" className="h-2" alt="Separator"></img>
        {/*
Deliverables section
*/}
        <div className="flex flex-row w-auto h-auto justify-between m-4">
            <div className="flex flex-col w-full mr-5 h-auto justify-between border-accent-dark border-2 border-solid rounded-lg bg-bg-primary-dark text-white">
                <div className="flex flex-row m-5 justify-between">
                    <h2>Deliverables</h2>
                    <p>Status: Wireframes submitted in JPG, PDF, MP4 format and is Approved</p>
                </div>
                {data?.deliverables?.map((deliverable) => {
                    return (
                        <div key={deliverable.name} className="flex flex-row m-5 space-x-3 items-center">
                            <img src={iconForDeliverableType(deliverable.format)}
                                className="mr-3 h-4 " alt="progressLineActive">
                            </img>
                            <h2>{deliverable.name}</h2>
                            <p>{deliverable.description}</p>
                            <div className="bg-white rounded-xl">
                                Approved
                            </div>
                        </div>
                    )
                }
                )}
            </div>
        </div>
    </>

}

function iconForDeliverableType(format: any): string | undefined {
    throw new Error("Function not implemented.");
}
