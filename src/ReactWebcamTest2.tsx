import { useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';

export const ReactWebcamTest2 = () => {

    const [deviceId, setDeviceId] = useState({});
    const [devices, setDevices] = useState<any>([]);

    const handleDevices = useCallback((mediaDevices: MediaDeviceInfo[]) => {
        setDevices(mediaDevices.filter(({ kind }) => kind === "videoinput"))
    }, [setDevices]);

    useEffect(() => {
        navigator.mediaDevices.enumerateDevices().then(handleDevices);
    }, [handleDevices]);


    return (
        <div>
            {devices.map((device: any, key: any) => (
                <div key={key}>
                    <Webcam audio={false} videoConstraints={{ deviceId: device.deviceId }} />
                    {device.label || `Device ${key + 1}`}
                </div>

            ))}
        </div>
    )
}
