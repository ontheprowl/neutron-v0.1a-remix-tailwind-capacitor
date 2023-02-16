import { useNavigate } from "@remix-run/react"
import { useFormContext } from "react-hook-form";
import { OnboardingDataStore } from "~/stores/OnboardingDataStore"





export default function BusinessDetails() {

    let navigate = useNavigate()


    const { register } = useFormContext();

    return (
        <div className="items-center m-4 p-6 w-8/12">
            <div>
                <h1 className="font-gilroy-bold text-[24px]">Business Details</h1>
                <span>If you need more info, please check out our <a className="text-primary-base hover:underline hover:decoration-primary-base" href="https://www.neutron.money/support">Help Page</a></span>
            </div>
            <div id="business_details" className="mt-8 flex flex-col space-y-4">
                <div className="sm:text-left space-y-1  w-full">
                    <span className=" prose prose-md text-black font-gilroy-bold text-[14px]">Business PAN</span>
                    <input  {...register('pan')} type="text" placeholder="e.g: Neutron Money Pvt. Ltd." className=" transition-all bg-[#FFFFFF] pt-3 pb-3 pl-4 pr-4 border-2 border-[#DCDCDC] caret-bg-accent-dark focus:outline-none  text-[#BCBDBD] active:caret-yellow-400 text-sm rounded-lg placeholder-[#BCBDBD] block w-full h-12 font-gilroy-medium font-[18px] " />
                </div>
                <div className="sm:text-left space-y-1  w-full">
                    <span className=" prose prose-md text-black font-gilroy-bold text-[14px]">Business GST</span>
                    <input  {...register('gst')} type="text" placeholder="e.g: Neutron Money Pvt. Ltd." className=" transition-all bg-[#FFFFFF] pt-3 pb-3 pl-4 pr-4 border-2 border-[#DCDCDC] caret-bg-accent-dark focus:outline-none  text-[#BCBDBD] active:caret-yellow-400 text-sm rounded-lg placeholder-[#BCBDBD] block w-full h-12 font-gilroy-medium font-[18px] " />
                </div>
                <div className="sm:text-left space-y-1  w-full">
                    <span className=" prose prose-md text-black font-gilroy-bold text-[14px]">Website</span>
                    <input  {...register('website')} type="text" placeholder="e.g: Neutron Money Pvt. Ltd." className=" transition-all bg-[#FFFFFF] pt-3 pb-3 pl-4 pr-4 border-2 border-[#DCDCDC] caret-bg-accent-dark focus:outline-none  text-[#BCBDBD] active:caret-yellow-400 text-sm rounded-lg placeholder-[#BCBDBD] block w-full h-12 font-gilroy-medium font-[18px] " />
                </div>
                <hr></hr>
                <h1 className="font-gilroy-bold">Registered Business Address</h1>
                <div className="sm:text-left space-y-1  w-full">
                    <span className=" prose prose-md text-black font-gilroy-bold text-[14px]">Address Line 1</span>
                    <input  {...register('address_line_1')} type="text" placeholder="e.g: Neutron Money Pvt. Ltd." className=" transition-all bg-[#FFFFFF] pt-3 pb-3 pl-4 pr-4 border-2 border-[#DCDCDC] caret-bg-accent-dark focus:outline-none  text-[#BCBDBD] active:caret-yellow-400 text-sm rounded-lg placeholder-[#BCBDBD] block w-full h-12 font-gilroy-medium font-[18px] " />
                </div>
                <div className="sm:text-left space-y-1  w-full">
                    <span className=" prose prose-md text-black font-gilroy-bold text-[14px]">Address Line 2</span>
                    <input  {...register('address_line_2')} type="text" placeholder="e.g: Neutron Money Pvt. Ltd." className=" transition-all bg-[#FFFFFF] pt-3 pb-3 pl-4 pr-4 border-2 border-[#DCDCDC] caret-bg-accent-dark focus:outline-none  text-[#BCBDBD] active:caret-yellow-400 text-sm rounded-lg placeholder-[#BCBDBD] block w-full h-12 font-gilroy-medium font-[18px] " />
                </div>
                <div className="sm:text-left space-x-2 flex flex-row w-full">
                    <div className="sm:text-left space-y-1  w-full">
                        <span className=" prose prose-md text-black font-gilroy-bold text-[14px]">Website</span>
                        <input  {...register('city')} type="text" placeholder="e.g: Neutron Money Pvt. Ltd." className=" transition-all bg-[#FFFFFF] pt-3 pb-3 pl-4 pr-4 border-2 border-[#DCDCDC] caret-bg-accent-dark focus:outline-none  text-[#BCBDBD] active:caret-yellow-400 text-sm rounded-lg placeholder-[#BCBDBD] block w-full h-12 font-gilroy-medium font-[18px] " />
                    </div>
                    <div className="sm:text-left space-y-1  w-full">
                        <span className=" prose prose-md text-black font-gilroy-bold text-[14px]">State</span>
                        <select  {...register('state')} placeholder="e.g: Neutron Money Pvt. Ltd." className=" transition-all bg-[#FFFFFF] pt-3 pb-3 pl-4 pr-4 border-2 border-[#DCDCDC] caret-bg-accent-dark focus:outline-none  text-[#BCBDBD] active:caret-yellow-400 text-sm rounded-lg placeholder-[#BCBDBD] block w-full h-12 font-gilroy-medium font-[18px] "
                        >
                            <option value="Andhra Pradesh">Andhra Pradesh</option>
                            <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
                            <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                            <option value="Assam">Assam</option>
                            <option value="Bihar">Bihar</option>
                            <option value="Chandigarh">Chandigarh</option>
                            <option value="Chhattisgarh">Chhattisgarh</option>
                            <option value="Dadar and Nagar Haveli">Dadar and Nagar Haveli</option>
                            <option value="Daman and Diu">Daman and Diu</option>
                            <option value="Delhi">Delhi</option>
                            <option value="Lakshadweep">Lakshadweep</option>
                            <option value="Puducherry">Puducherry</option>
                            <option value="Goa">Goa</option>
                            <option value="Gujarat">Gujarat</option>
                            <option value="Haryana">Haryana</option>
                            <option value="Himachal Pradesh">Himachal Pradesh</option>
                            <option value="Jammu and Kashmir">Jammu and Kashmir</option>
                            <option value="Jharkhand">Jharkhand</option>
                            <option value="Karnataka">Karnataka</option>
                            <option value="Kerala">Kerala</option>
                            <option value="Madhya Pradesh">Madhya Pradesh</option>
                            <option value="Maharashtra">Maharashtra</option>
                            <option value="Manipur">Manipur</option>
                            <option value="Meghalaya">Meghalaya</option>
                            <option value="Mizoram">Mizoram</option>
                            <option value="Nagaland">Nagaland</option>
                            <option value="Odisha">Odisha</option>
                            <option value="Punjab">Punjab</option>
                            <option value="Rajasthan">Rajasthan</option>
                            <option value="Sikkim">Sikkim</option>
                            <option value="Tamil Nadu">Tamil Nadu</option>
                            <option value="Telangana">Telangana</option>
                            <option value="Tripura">Tripura</option>
                            <option value="Uttar Pradesh">Uttar Pradesh</option>
                            <option value="Uttarakhand">Uttarakhand</option>
                            <option value="West Bengal">West Bengal</option>
                        </select>
                    </div>
                    <div className="sm:text-left space-y-1  w-full">
                        <span className=" prose prose-md text-black font-gilroy-bold text-[14px]">Pincode</span>
                        <input  {...register('pincode')} type="text" placeholder="e.g: Neutron Money Pvt. Ltd." className=" transition-all bg-[#FFFFFF] pt-3 pb-3 pl-4 pr-4 border-2 border-[#DCDCDC] caret-bg-accent-dark focus:outline-none  text-[#BCBDBD] active:caret-yellow-400 text-sm rounded-lg placeholder-[#BCBDBD] block w-full h-12 font-gilroy-medium font-[18px] " />
                    </div>

                </div>
                <button
                    className="w-3/12 rounded-lg  bg-primary-base p-3 border-2 border-transparent active:bg-primary-dark hover:bg-primary-dark outline-none ring-1 ring-transparent focus:ring-white focus:border-white hover:border-white hover:ring-white text-white font-gilroy-medium font-[18px] transition-all"
                    onClick={() => {
                        navigate("../integrations")
                    }}
                >
                    Continue
                </button>
            </div>
        </div >)
}