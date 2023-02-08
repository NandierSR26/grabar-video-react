import { useState, useCallback, useEffect, useRef } from 'react';
import Webcam from 'react-webcam';
import './App.css'

export const ReactWebcamTest2 = () => {

    const webcamRef = useRef<any>(null);
    const mediaRecorderRef = useRef<null | MediaRecorder>()

    const [audioSource, setAudioSource] = useState<MediaDeviceInfo>()
    const [videoSource, setVideoSource] = useState<MediaDeviceInfo>();
    const [audioSourceOptions, setAudioSourceOptions] = useState<MediaDeviceInfo[]>([]);
    const [videoSourceOptions, setVideoSourceOptions] = useState<MediaDeviceInfo[]>([]);

    const [capturing, setCapturing] = useState(false)
    const chunks = useRef<any[]>([])
    const [downloadLink, setDownloadLink] = useState('')
    // const [recordedChunks, setRecordedChunks] = useState([]);

    function startRecording (){
        setCapturing(true);
        mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream);
        mediaRecorderRef.current.ondataavailable = function(event: BlobEvent) {
            if (chunks.current) {
                chunks.current.push(event.data)
            }
        };
        mediaRecorderRef.current.start();
    }
    console.log(chunks.current.length);
    

    function stopRecording() {
        if (!mediaRecorderRef.current) {
            return
        }
        mediaRecorderRef.current.stop()
        setCapturing(false)
    }

    useEffect(function () {
        if (capturing) {
            return;
        }

        const blob = new Blob(chunks.current, {
            type: 'video/x-matroska;codecs=avc1,opus'
        })
        setDownloadLink(URL.createObjectURL(blob))
        // console.log(URL.createObjectURL(blob));
        chunks.current = []
    }, [capturing])


    useEffect(() => {
        const getDevices = () => {
            return navigator.mediaDevices.enumerateDevices()
        }

        const filterDevices = (devices: MediaDeviceInfo[]) => {
            const audioOptions = devices.filter(device => device.kind === 'audioinput')
            const videoOptions = devices.filter(device => device.kind === 'videoinput')
            setAudioSource(audioOptions[0])
            setVideoSource(videoOptions[0]);

            setAudioSourceOptions(audioOptions)
            setVideoSourceOptions(videoOptions)
        }

        getDevices()
            .then(devices => filterDevices(devices))
            .catch(error => console.log(error))

    }, []);

    return (
        <div className='container'>
            <div>
                <select name="videoSource" id="videoSource" value={videoSource?.deviceId}>
                    {
                        videoSourceOptions.map(video => (
                            <option
                                key={video.deviceId}
                                value={video.deviceId}
                            >
                                {video.label || `Camara ${video.deviceId}`}
                            </option>
                        ))
                    }
                </select>

                <select name="audioSource" id="audioSource" value={audioSource?.deviceId}>
                    {
                        audioSourceOptions.map(audio => (
                            <option
                                key={audio.deviceId}
                                value={audio.deviceId}
                            >
                                {audio.label || `Microfono ${audio.deviceId}`}
                            </option>
                        ))
                    }
                </select>
            </div>
            <Webcam audio={true} ref={webcamRef} videoConstraints={{ deviceId: videoSource?.deviceId }} className="camera"  />
            {videoSource?.label || `Device ${videoSource?.deviceId}`}
            <div>
                <button onClick={startRecording} disabled={capturing}>Start</button>
                <button onClick={stopRecording} disabled={!capturing}>Stop</button>
            </div>
            {downloadLink && <video src={downloadLink} controls></video>}
            {downloadLink && (
                <a href={downloadLink} download="file.mp4">Descargar</a>
            )}
        </div>
    )
}
