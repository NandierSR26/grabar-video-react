import { useEffect, useRef, useState } from 'react';

export const WebCamRecorder = () => {

    const videoRef = useRef<null | HTMLVideoElement>(null)
    const streamRef = useRef<null | MediaStream>(null)
    const streamRecorderRef = useRef<null | MediaRecorder>(null)

    const [audioSource, setAudioSource] = useState<string>('') // microfono en funcionamiento
    const [videoSource, setVideoSource] = useState<string>('') // camara en funcionamiento

    const [audioSourceOptions, setAudioSourceOptions] = useState<Record<string, string>[]>([]) // lista de microfonos para seleccionar
    const [videoSourceOptions, setVideoSourceOptions] = useState<Record<string, string>[]>([]) // lista de camaras para seleccionar

    const [isRecording, setIsRecording] = useState(false)
    const [error, setError] = useState<null | Error>(null)
    const [downloadLink, setDownloadLink] = useState('')
    const chunks = useRef<any[]>([])


    function startRecording() {
        if(isRecording) {
            return
        }
        if(!streamRef.current){
            return
        }

        streamRecorderRef.current = new MediaRecorder(streamRef.current)
        streamRecorderRef.current.start()
        streamRecorderRef.current.ondataavailable = function(e: BlobEvent) {
            if(chunks.current) {
                chunks.current.push(e.data)
            }
        }
        setIsRecording(true)
    }

    function stopRecording() {
        if(!streamRecorderRef.current) {
            return
        }

        streamRecorderRef.current.stop()
        setIsRecording(false)
    }

    useEffect(() => {
        if(isRecording) {
            return
        }

        if(chunks.current.length == 0) {
            return
        }

        const blob = new Blob(chunks.current, {
            type: 'video/x-matroska;codecs-avc1,opus'
        })

        setDownloadLink(URL.createObjectURL(blob))
        chunks.current = []
    }, [isRecording])

    useEffect(() => {
        async function prepareStream() {

            function gotStream(stream: MediaStream) {
                streamRef.current = stream
                if (videoRef.current) {
                    videoRef.current.srcObject = stream
                }
            }

            function gotDevices(deviceInfos: MediaDeviceInfo[]) {
                const audioSourceOptions = []
                const videoSourceOptions = []

                for (const deviceInfo of deviceInfos) {
                    if (deviceInfo.kind === 'audioinput') {
                        audioSourceOptions.push({
                            value: deviceInfo.deviceId,
                            label: deviceInfo.label || `Microfono ${deviceInfo.deviceId}`
                        })
                    } else if (deviceInfo.kind === 'videoinput') {
                        videoSourceOptions.push({
                            value: deviceInfo.deviceId,
                            label: deviceInfo.label || `Camara ${deviceInfo.deviceId}`
                        })

                    }

                    setAudioSourceOptions(audioSourceOptions)
                    setVideoSourceOptions(videoSourceOptions)
                }
            }

            function getDevices() {
                return navigator.mediaDevices.enumerateDevices();
            }

            async function getStream() {
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach(track => {
                        track.stop()
                    })
                }

                const constraints = {
                    audio: { deviceId: audioSource !== '' ? { exact: audioSource } : undefined },
                    video: { deviceId: videoSource !== '' ? { exact: videoSource } : undefined },
                }

                try {
                    const stream = await navigator.mediaDevices.getUserMedia(constraints)
                    gotStream(stream)
                } catch (error: any) {
                    setError(error)
                }
            }

            await getStream()
            const mediaDevices = await getDevices()
            gotDevices(mediaDevices)
        }
        prepareStream()
    }, [])

    return (
        <div>
            <div>
                <select id="videoSource" name="videoSource" value={videoSource}>
                    {videoSourceOptions.map(option => (
                        <option
                            key={option.value}
                            value={option.value}
                        >
                            {option.label}
                        </option>
                    ))}
                </select>

                <select id="audioSource" name="audioSource" value={audioSource}>
                    {audioSourceOptions.map(option => (
                        <option
                            key={option.value}
                            value={option.value}
                        >
                            {option.label}
                        </option>
                    ))}
                </select>

                <video ref={videoRef} autoPlay muted playsInline></video>
            </div>

            <div>
                { downloadLink && <video src={downloadLink} controls></video> }
                { downloadLink && (
                    <a href={downloadLink} download="file.mp4">
                        Descargar
                    </a>
                )}
            </div>

            <div>
                <button onClick={startRecording} disabled={isRecording}>Grabar</button>
                <button onClick={stopRecording} disabled={!isRecording}>detener</button>
            </div>

            <div>{ error && <p>{error.message}</p> }</div>
        </div>
    )
}
