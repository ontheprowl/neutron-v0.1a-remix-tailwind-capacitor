
import { useNavigation } from '@remix-run/react';
import { useState } from 'react'
import DisconnectIcon from '~/assets/images/disconnectIcon.svg'
import DefaultSpinner from '~/components/layout/DefaultSpinner';




export default function DisconnectButton({ onClick, submit, loading }: { onClick?: React.MouseEventHandler<HTMLButtonElement>, submit?: boolean, loading?: boolean }) {

    const [clicked, setClicked] = useState(false);

    return (
        <button type={submit ? 'submit' : 'button'} onClick={onClick ? (e) => { setClicked(true); onClick(e); setClicked(false); } : submit ? () => { setClicked(true); } : () => {
            alert("No click handler implemented")
        }} className="bg-error-light font-gilroy-medium hover:opacity-70 transition-all min-w-fit rounded-lg p-3 text-error-dark space-x-2 flex flex-row items-center">
            {loading ?
                <DefaultSpinner /> :
                <div>
                    <img src={DisconnectIcon} alt="save_icon" className='h-6'></img>
                    <span>Disconnect</span>
                </div>
            }
        </button>
    )

}