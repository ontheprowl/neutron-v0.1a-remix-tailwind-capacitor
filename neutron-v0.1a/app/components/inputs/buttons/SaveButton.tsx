
import SaveIcon from '~/assets/images/saveIcon.svg'




export default function SaveButton({ onClick, submit }: { onClick?: React.MouseEventHandler<HTMLButtonElement>, submit?: boolean }) {


    return (
        <button type={submit ? 'submit' : 'button'} onClick={onClick ? onClick : submit ? () => { } : () => {
            alert("No click handler implemented")
        }} className="bg-success-light hover:opacity-70 transition-all min-w-fit rounded-lg p-3 text-success-dark space-x-2 flex flex-row items-center">
            <img src={SaveIcon} alt="save_icon" className='h-6'></img>
            <span>Save</span>
        </button>
    )

}