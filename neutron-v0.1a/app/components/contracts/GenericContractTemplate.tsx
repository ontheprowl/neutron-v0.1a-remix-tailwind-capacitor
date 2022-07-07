import { ContractDataStore } from "~/stores/ContractStores";
import { Contract, ContractCreationStages } from "~/models/contracts";
import { formatDateToReadableString } from "~/utils/utils";
import ContractEditableLink from "./ContractEditableLink";



export default function GenericContractTemplate({ loaderData }: { loaderData: Contract | undefined }) {

    let data = ContractDataStore.useState();
    if (loaderData) {
        data = loaderData;
    }

    console.log('data for the edit screen is')
    console.log(data)

    return (<div className="m-5 text-center items-center overflow-y-scroll h-[50vh]"><article className="prose prose-xl max-w-none text-center" >
        <p>
            <strong>Independent Contractor Agreement</strong>
        </p>
        <p>
            This Contract is between <ContractEditableLink to={ContractCreationStages.ClientInformation}>{data?.clientName}</ContractEditableLink>  (the "Client") and <ContractEditableLink to={ContractCreationStages.ClientInformation}>{data?.providerName}</ContractEditableLink>, a {data?.isCompany ? `${data?.companyRole} at ${data?.companyName}` : ""} (the "Contractor").
        </p>
        <p>
            The Contract is dated <ContractEditableLink to={ContractCreationStages.ClientInformation}>{data?.signedDate}</ContractEditableLink>.
        </p>
        <p>
            <strong>1. INTERPRETATION.</strong> In this Contract, unless the context otherwise requires, the following expressions shall have the following meanings:
        </p>
        <p>

            <strong>Completion:</strong> means upon the Freelancer's completion and delivery of the Work Product or part thereof (as applicable, should delivery be in stages) according to Section 2;
        </p>
        <p>

            <strong>Business Days:</strong> means a day other than a Saturday, Sunday, or bank or public holiday in India;
        </p>
        <p>

            <strong>Force Majeure:</strong> means any event or sequence of events beyond the reasonable control of a party (which could not reasonably have been anticipated and avoided by that party) and occurring without that party's fault or negligence, including but not limited to, acts of God, acts of government, floor, fire, pandemic or epidemic, civil unrest, acts of terror, strikes which prevent or delay that party from performing its obligations under this Contract;
        </p>
        <p>

            <strong>Project:</strong> means the entirety of the scope of work as captured in this Contract;
        </p>
        <p>

            <strong>Work Product:</strong> means drafts, notes, materials, mockups, hardware, designs, inventions, patents, code, and anything else that the Freelancer works on—that is, conceives, creates, designs, develops, invents, works on, or reduces to practice—as part of this project, whether before the date of this Contract or after;
        </p>
        <p>
            <strong>2. WORK AND PAYMENT.</strong>
        </p>
        <p>

            <strong>2.1 Project.</strong> The Client is hiring the Contractor to do the following:  <ContractEditableLink to={ContractCreationStages.ScopeOfWork}>{data?.description}</ContractEditableLink>.
        </p>
        <p>

            <strong>2.2 Support.</strong> The Contractor  <ContractEditableLink to={ContractCreationStages.ScopeOfWork}>{data?.supportPolicy}</ContractEditableLink> provide support for any deliverable once the Client accepts it upon Completion, unless otherwise agreed by the Contractor in writing.
        </p>
        <p>

            <strong>2.3 Schedule of Work.</strong>
        </p>
        <p>

            <strong>2.3.1 Start Date.</strong> <ContractEditableLink to={ContractCreationStages.ClientInformation}>{data?.startDate}</ContractEditableLink>
        </p>
        <p>

            <strong>2.3.2 Duration.</strong> {<ContractEditableLink to={ContractCreationStages.ClientInformation}>{data?.endDate}</ContractEditableLink> || data?.endCondition}, and subject to termination under Section 6 of this Agreement.
        </p>
        <p>

            <strong>2.4 Termination.</strong> This Contract can be ended by either Client or the Contractor at any time, pursuant to Section 6, Term and Termination herein.
        </p>
        <p>
            <strong>3. PAYMENT.</strong>
        </p>
        <p>

            <strong>3.1 Payment.</strong> The Client will pay the Contractor <ContractEditableLink to={ContractCreationStages.PaymentAndMilestones}>{data?.totalValue}</ContractEditableLink>
        </p>
        <p>

            <strong>3.2 Invoices.</strong> The Contractor will invoice the Client {data?.invoiceDate || data?.invoiceCondition}. The Client agrees to automated fund release within <ContractEditableLink to={ContractCreationStages.ClientInformation}>{data?.redressalWindow}</ContractEditableLink>of receiving the invoice.
        </p>
        <p>

            <strong>Need to restructure 3.3 according to advance escrow feature requirements</strong>
        </p>
        <p>

            <strong>3.3 Expenses.</strong> The Client will reimburse the Contractor's expenses. Expenses do not need to be pre-approved by the Client.
        </p>
        <p>
            <strong>4. OWNERSHIP AND LICENSES.</strong>
        </p>
        <p>

            <strong>4.1 {data?.workOwnership}.</strong>
            {data?.ownershipType ? <>
                <strong>
                    As part of this job, the Contractor is creating "work product" for the Client. To avoid confusion, work product is the finished product, as well as drafts, notes, materials, mockups, hardware, designs, inventions, patents, code, and anything else that the Contractor works on—that is, conceives, creates, designs, develops, invents, works on, or reduces to practice—as part of this project, whether before the date of this Contract or after. The Contractor hereby gives the Client this work product once the Client pays for it in full. This means the Contractor is giving the Client all of its rights, titles, and interests in and to the work product (including intellectual property rights), and the Client will be the sole owner of it. The Client can use the work product however it wants or it can decide not to use the work product at all. The Client, for example, can modify, destroy, or sell it, as it sees fit.</strong>
                <p>
                    <strong>4.2 Contractor's Use Of Work Product.</strong> Once the Contractor gives the work product to the Client, the Contractor does not have any rights to it, except those that the Client explicitly gives the Contractor here. The Client gives permission to use the work product as part of portfolios and websites, in galleries, and in other media, so long as it is to showcase the work and not for any other purpose. The Client does not give permission to sell or otherwise use the work product to make money or for any other commercial use. The Client is not allowed to take back this license, even after the Contract ends.
                </p>
                <p>
                    <strong>4.3 Contractor's Help Securing Ownership.</strong> In the future, the Client may need the Contractor's help to show that the Client owns the work product or to complete the transfer. The Contractor agrees to help with that. For example, the Contractor may have to sign a patent application. The Client will pay any required expenses for this. If the Client can’t find the Contractor, the Contractor agrees that the Client can act on the Contractor's behalf to accomplish the same thing. The following language gives the Client that right: if the Client can’t find the Contractor after spending reasonable effort trying to do so, the Contractor hereby irrevocably designates and appoints the Client as the Contractor's agent and attorney-in-fact, which appointment is coupled with an interest, to act for the Contractor and on the Contractor's behalf to execute, verify, and file the required documents and to take any other legal action to accomplish the purposes of Clause 4.1 (Client Owns All Work Product). <strong>4.4 Contractor's IP That Is Not Work Product.</strong> During the course of this project, the Contractor might use intellectual property that the Contractor owns or has licensed from a third party, but that does not qualify as "work product." This is called "background IP." Possible examples of background IP are pre-existing code, type fonts, properly-licensed stock photos, and web application tools. The Contractor is not giving the Client this background IP. But, as part of the Contract, the Contractor is giving the Client a right to use and license (with the right to sublicense) the background IP to develop, market, sell, and support the Client’s products and services. The Client may use this background IP worldwide and free of charge, but it cannot transfer its rights to the background IP. The Client cannot sell or license the background IP separately from its products or services. The Contractor cannot take back this grant, and this grant does not end when the Contract is over.
                </p>
                <p>
                    <strong> 4.5 Contractor's Right To Use Client IP.</strong> The Contractor may need to use the Client’s intellectual property to do its job. For example, if the Client is hiring the Contractor to build a website, the Contractor may have to use the Client’s logo. The Client agrees to let the Contractor use the Client’s intellectual property and other intellectual property that the Client controls to the extent reasonably necessary to do the Contractor's job. Beyond that, the Client is not giving the Contractor any intellectual property rights, unless specifically stated otherwise in this Contract.
                </p></> : ''}
        </p>
        <p>
            <strong>5. REPRESENTATIONS.</strong>
        </p>
        <p>

            <strong>5.1 Overview.</strong> This section contains important promises between the parties.
        </p>
        <p>

            <strong>5.2 Authority To Sign.</strong> Each party promises to the other party that it has the authority to enter into this Contract and to perform all of its obligations under this Contract.
        </p>
        <p>

            <strong>5.3 Contractor Has Right To Give Client Work Product.</strong> The Contractor promises that it owns the work product, that the Contractor is able to give the work product to the Client, and that no other party will claim that it owns the work product. If the Contractor uses employees or subcontractors, the Contractor also promises that these employees and subcontractors have signed contracts with the Contractor giving the Contractor any rights that the employees or subcontractors have related to the Contractor's background IP and work product.
        </p>
        <p>

            <strong>5.4 Contractor Will Comply With Laws.</strong> The Contractor promises that the manner it does this job, its work product, and any background IP it uses comply with applicable U.S. and foreign laws and regulations.
        </p>
        <p>

            <strong>5.5 Work Product Does Not Infringe.</strong> The Contractor promises that its work product does not and will not infringe on someone else’s intellectual property rights, that the Contractor has the right to let the Client use the background IP, and that this Contract does not and will not violate any contract that the Contractor has entered into or will enter into with someone else.
        </p>
        <p>

            <strong>5.6 Client Will Review Work.</strong> The Client promises to review the work product, to be reasonably available to the Contractor if the Contractor has questions regarding this project, and to provide timely feedback and decisions.
        </p>
        <p>

            <strong>5.7 Client-Supplied Material Does Not Infringe.</strong> If the Client provides the Contractor with material to incorporate into the work product, the Client promises that this material does not infringe on someone else’s intellectual property rights.
        </p>
        <p>
            <strong>6. TERM AND TERMINATION.</strong> This Contract {data?.endDate || data?.endCondition}. Either party may end this Contract for any reason by filing a cancellation request on Neutron, informing the counterparty that the sender is ending the Contract and that the Contract will end in {data?.contractNotice}. The Contract officially ends once that time has passed. The party that is ending the Contract must provide notice by taking the steps explained in Clause 9.6. The Contractor must immediately stop working as soon as it receives this notice, unless the notice says otherwise. {data?.basePayCondition} The following Sections shall survive the termination of the Contract: 5 (Representations); 7 (Confidential Information); 8 (Liability & Indemnity); and 9 (General).
        </p>
        <p>
            <strong>7. CONFIDENTIAL INFORMATION.</strong>
        </p>
        <p>

            <strong>7.1 Overview.</strong> This Contract imposes special restrictions on how the Client and the Contractor must handle confidential information. These obligations are explained in this section.
        </p>
        <p>

            <strong>7.2 The Client’s Confidential Information.</strong> While working for the Client, the Contractor may come across, or be given, Client information that is confidential. This is information like customer lists, business strategies, research & development notes, statistics about a website, and other information that is private. The Contractor promises to treat this information as if it is the Contractor's own confidential information. The Contractor may use this information to do its job under this Contract, but not for anything else. For example, if the Client lets the Contractor use a customer list to send out a newsletter, the Contractor cannot use those email addresses for any other purpose. The one exception to this is if the Client gives the Contractor written permission to use the information for another purpose, the Contractor may use the information for that purpose, as well. When this Contract ends, the Contractor must give back or destroy all confidential information, and confirm that it has done so. The Contractor promises that it will not share confidential information with a third party, unless the Client gives the Contractor written permission first. The Contractor must continue to follow these obligations, even after the Contract ends. The Contractor's responsibilities only stop if the Contractor can show any of the following: (i) that the information was already public when the Contractor came across it; (ii) the information became public after the Contractor came across it, but not because of anything the Contractor did or didn’t do; (iii) the Contractor already knew the information when the Contractor came across it and the Contractor didn’t have any obligation to keep it secret; (iv) a third party provided the Contractor with the information without requiring that the Contractor keep it a secret; or (v) the Contractor created the information on its own, without using anything belonging to the Client.
        </p>
        <p>

            <strong>7.3 Third-Party Confidential Information.</strong> It’s possible the Client and the Contractor each have access to confidential information that belongs to third parties. The Client and the Contractor each promise that it will not share with the other party confidential information that belongs to third parties, unless it is allowed to do so. If the Client or the Contractor is allowed to share confidential information with the other party and does so, the sharing party promises to tell the other party in writing of any special restrictions regarding that information.
        </p>
        <p>
            <strong>8. LIABILITY & INDEMNITY.</strong>
        </p>
        <p>

            <strong>8.1 Liability.</strong> Neither party shall have any liability under or be deemed to be in breach of this Agreement for any delays or failures in performance of this Agreement which result from any event of Force Majeure. The party affected by such an event shall promptly notify the other party in writing as soon as reasonably practicable when such an event causes a delay or failure in performance and when it ceases to do so.
        </p>
        <p>

            <strong>8.2 Client Indemnity.</strong> In this Contract, the Contractor agrees to indemnify the Client (and its affiliates and their directors, officers, employees, and agents) from and against all liabilities, losses, damages, and expenses (including reasonable attorneys’ fees) related to a third-party claim or proceeding arising out of: (i) the work the Contractor has done under this Contract; (ii) a breach by the Contractor of its obligations under this Contract; or (iii) a breach by the Contractor of the promises it is making in Section 5 (Representations).
        </p>
        <p>

            <strong>8.3 Contractor Indemnity.</strong> In this Contract, the Client agrees to indemnify the Contractor (and its affiliates and their directors, officers, employees, and agents) from and against liabilities, losses, damages, and expenses (including reasonable attorneys’ fees) related to a third-party claim or proceeding arising out of a breach by the Client of its obligations under this Contract.
        </p>
        <p>
            <strong>9. GENERAL.</strong>
        </p>
        <p>

            <strong>9.1 Dispute Resolution.</strong> If any dispute arises between the parties out of or in connection with this Contract, the matter shall be referred to the authorised representatives of each party who shall use their reasonable endeavors to resolve it within 20 Business Days.
        </p>
        <p>

            <strong>9.2 Mediation.</strong> If the dispute is not resolved after the procedure set out under Clause 9.1 is completed, or if the authorised representative(s) of either or both parties made no attempt to resolve such dispute, the parties shall resolve the matter through mediation in accordance with the Mediation Rules of the Singapore International Mediation Centre for the time being in force.
        </p>
        <p>

            <strong>9.3 Arbitration.</strong> The seat of the arbitration shall be Singapore. The Tribunal shall consist of one (01) arbitrator, as agreed between parties. The language of arbitration shall be English.
        </p>
        <p>

            <strong>9.4 Variation.</strong> No Clause In this Contract may be changed, waived, discharged, or discontinued, except by an instrument in writing signed on behalf of the Parties.
        </p>
        <p>

            <strong>9.5 Waiver.</strong> Neither party can waive its rights under this Contract or release the other party from its obligations under this Contract, unless the waiving party acknowledges it is doing so in writing and signs a document that says so.
        </p>
        <p>

            <strong>9.6 Notices.</strong>
        </p>
        <p>

            (a) A notice, demand or other communication shall be deemed to be received (if by email) when despatched and a report indicating successful transmission or receipt to the intended email is received, (if by hand) when left at the address required by this Clause or (if sent by registered post) within 10 Business Days after being sent by registered post to the addressee in each case in the manner set out in this Clause.
        </p>
        <p>

            (b) The timing of when a notice is received can be very important. To avoid confusion, a valid notice is considered received as follows: (i) if delivered personally, it is considered received immediately; (ii) if delivered by email, it is considered received upon acknowledgement of receipt; (iii) if delivered by registered or certified mail (postage prepaid, return receipt requested), it is considered received upon receipt as indicated by the date on the signed receipt. If a party refuses to accept notice or if notice cannot be delivered because of a change in address for which no notice was given, then it is considered received when the notice is rejected or unable to be delivered. If the notice is received after 5:00pm on a business day at the location specified in the address for that party, or on a day that is not a business day, then the notice is considered received at 9:00am on the next business day.
        </p>
        <p>

            (c) If the notice is received after 5:00pm on a business day at the location specified in the address for that party, or on a day that is not a business day, then the notice is considered received at 9:00am on the next business day.
        </p>
        <p>

            <strong>9.7 Severability.</strong> This section deals with what happens if a portion of the Contract is found to be unenforceable. If that’s the case, the unenforceable portion will be changed to the minimum extent necessary to make it enforceable, unless that change is not permitted by law, in which case the portion will be disregarded. If any portion of the Contract is changed or disregarded because it is unenforceable, the rest of the Contract is still enforceable.
        </p>
        <p>

            <strong>9.8 Signatures.</strong> The Client and the Contractor must sign this document using Bonsai's e-signing system. These electronic signatures count as originals for all purposes.
        </p>
        <p>

            <strong>9.9 Governing Law.</strong> This Agreement and any disputes or claims arising out of or in connection with it or its subject matter or formation shall be governed by and construed in accordance with the laws of the Republic of Singapore, and each Party hereby irrevocably agrees that the courts of the Republic of Singapore shall have the non-exclusive jurisdiction to settle any such disputes or claims.
        </p>
        <p>

            <strong>9.10 Entire Contract.</strong> This Contract contains the entire agreement between the Parties and shall supersede and replace any prior written or oral agreements, representations, or understandings between them. Each Party hereby confirms that it has not entered into this Agreement on the basis of any representation that is not expressly incorporated into this Agreement. Nothing in this Agreement excludes liability for fraud.
        </p>
        <p>
            THE PARTIES HERETO AGREE TO THE FOREGOING AS EVIDENCED BY THEIR SIGNATURES BELOW.
        </p>
        <p>
            sdsd
        </p>
        <p>
            {data?.providerName}, Owner
        </p>
        <p>
            {data?.clientName}
        </p>
    </article></div>);
}