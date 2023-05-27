




export default function ActionType({ actionType }: { actionType: "manual" | "automatic" }) {

    switch (actionType) {
        case "manual":
            return <span className="p-3 rounded-xl bg-warning-light text-sm  text-warning-dark">MANUAL</span>

        case "automatic":
            return <span className="p-3 rounded-xl bg-success-light text-sm  text-success-dark">AUTOMATIC</span>
        default:
            return <></>
    }

}