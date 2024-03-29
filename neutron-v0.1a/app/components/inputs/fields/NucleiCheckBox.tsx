import { useEffect, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form"





export default function NucleiCheckBox({ name, value, label, stateControl }: { name: string, value: string, label: string, stateControl?: boolean }) {


    const form = useFormContext();
    const control = form.control;
    const currentValue = useWatch({ control, name: name });


    useEffect(() => {
        if (stateControl != undefined) {
            setChecked(stateControl)
        }
    }, [stateControl])

    const [checked, setChecked] = useState(currentValue === value);

    return (
        <div className="flex flex-row items-center space-x-4" >
            <input {...form.register(name)} onChange={(e) => {
                if (!checked) {
                    setChecked(e.currentTarget.value === value)
                } else {
                    form.setValue(name, {})
                    setChecked(false);
                }
            }} value={value} checked={checked} className="text-primary-base fill-primary-base accent-primary-base rounded-full outline-none" type="checkbox" placeholder="" />
            <span className="font-gilroy-medium text-md">{label}</span>
        </div>)
}