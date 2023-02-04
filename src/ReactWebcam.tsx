import Webcam from 'react-webcam'
import { useCallback, useRef, useState } from 'react';

export const ReactWebcam = () => {

  const webcamRef = useRef<Webcam>(null);
  const [recording, setRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [downloadLink, setDownloadLink] = useState('')

  const startRecording = () => {
    setRecording(true);
    const stream = webcamRef.current!.stream;
    if (stream) {
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.start();

      mediaRecorder.addEventListener("dataavailable", (event: BlobEvent) => {
        setRecordedChunks(prevChunks => [...prevChunks, event.data]);
      });

      mediaRecorder.addEventListener("stop", () => {
        setRecording(false);
        const recordedBlob = new Blob(recordedChunks, {
          type: "video/webm"
        });
        setDownloadLink(URL.createObjectURL(recordedBlob))
        console.log(downloadLink);
        
      });

      return () => {
        mediaRecorder.stop();
      };
    }
  };

  return (
    <>
      <Webcam
        ref={webcamRef}
        audio={true}
        height={500}
        width={500}
      />
      <button onClick={startRecording}>{recording ? "Stop" : "Start"} Recording</button>
    </>
  );
}
