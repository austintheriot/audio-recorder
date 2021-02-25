import { useCallback, useState, useEffect } from 'react';
import './App.css';

function App() {
	const [chunks, setChunks] = useState<Blob[]>([]);
	const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
		null,
	);
	const [audioSrc, setAudioSrc] = useState<string | null>(null);

	// stop recording
	const stopRecording = useCallback(() => {
		if (mediaRecorder && mediaRecorder.state !== 'inactive') {
			mediaRecorder.stop();
			console.log(mediaRecorder.state);
			console.log('recorder stopped');
		}
	}, [mediaRecorder]);

	// pause any existing playback
	// delete any existing saved data
	const deleteRecording = useCallback(() => {
		stopRecording();
		setChunks([]);
	}, [stopRecording]);

	// pause any existing playback
	// delete any existing saved data
	// start recording
	const startRecording = useCallback(() => {
		deleteRecording();
		if (mediaRecorder && mediaRecorder.state !== 'recording') {
			mediaRecorder.start();
			console.log(mediaRecorder.state);
			console.log('recorder started');
		}
	}, [mediaRecorder, deleteRecording]);

	// typically called after recording or stops or when a
	// blob becomes large enough to save
	const onDataAvailable = useCallback((e: BlobEvent) => {
		console.log('onDataAvailable: ', e.data);
		setChunks((prevState) => {
			const newChunks = [...prevState];
			newChunks.push(e.data);
			return newChunks;
		});
	}, []);

	const onStop = useCallback(() => {
		console.log('recorder stopped');
	}, []);

	const setUpStream = useCallback(async () => {
		if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
			console.log('getUserMedia supported.');
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			const newMediaRecorder = new MediaRecorder(stream);
			newMediaRecorder.ondataavailable = onDataAvailable;
			newMediaRecorder.onstop = onStop;
			setMediaRecorder(newMediaRecorder);
		} else {
			console.log('getUserMedia not supported on your browser!');
		}
	}, [onDataAvailable, onStop]);

	// record data chunks and create new URL
	useEffect(() => {
		console.log('useEffect chunks: ', chunks);
		const blob = new Blob(chunks, { type: 'audio/ogg; codecs=opus' });
		const audioURL = window.URL.createObjectURL(blob);
		setAudioSrc(audioURL);
	}, [chunks]);

	/* Set up audio stream for recording */
	useEffect(() => {
		setUpStream();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div className="App">
			<div>
				<button type="button" onClick={startRecording}>
					Start Recording
				</button>
				<button type="button" onClick={stopRecording}>
					Stop Recording
				</button>
				<button type="button" onClick={deleteRecording}>
					Delete Recording
				</button>
				{audioSrc && <audio src={audioSrc} controls />}
			</div>
		</div>
	);
}

export default App;
