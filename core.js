const createRecorder = () =>
    new Promise(async resolve => {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true
        });

        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.addEventListener("dataavailable", event => {
            audioChunks.push(event.data);
        });
        const audioChunks = [];

        const start = () => {
            audioChunks.length = 0;
            mediaRecorder.start();
        };

        const stop = () =>
            new Promise(resolve => {
                mediaRecorder.addEventListener("stop", () => {
                    const audioBlob = new Blob(audioChunks);
                    const audioUrl = URL.createObjectURL(audioBlob);
                    const audio = new Audio(audioUrl);
                    const play = () => audio.play();
                    const stop = () => {
                        audio.pause();
                        audio.currentTime = 0;
                    };

                    resolve({
                        audioBlob,
                        audioUrl,
                        play,
                        stop
                    });
                });
                mediaRecorder.stop();
            });
        resolve({
            start,
            stop
        });
    });

const sleep = time => new Promise(resolve => setTimeout(resolve, time));

(async () => {
    const recorder = await createRecorder();

    let audio = null;
    let echoBtn = document.getElementById('echo-btn');

    echoBtn.onmousedown = () => {
        if (audio) audio.stop();
        audio = null;
        recorder.start();
        echoBtn.innerText = "I'm listening ...";
    }

    echoBtn.onmouseup = async () => {
        await sleep(100);
        audio = await recorder.stop();
        audio.play();
        echoBtn.innerText = "Speak!";
    }
})();