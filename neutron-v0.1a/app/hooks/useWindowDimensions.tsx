import { useState, useEffect } from 'react';



export default function useWindowDimensions() {

    function getWindowDimensions() {
        const { innerWidth: width, innerHeight: height } = window;
        return {
            width,
            height
        };

    }
    const [windowDimensions, setWindowDimensions] = useState({
        width: 0,
        height: 0,
    });

    useEffect(() => {

        setWindowDimensions(getWindowDimensions())

        function handleResize() {
            setWindowDimensions(getWindowDimensions());
        }

        if (window != undefined) {
            window.addEventListener('resize', handleResize);
            return () => window.removeEventListener('resize', handleResize);
        }

    }, []);

    return windowDimensions;
}
