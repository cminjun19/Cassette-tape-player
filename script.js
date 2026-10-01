let currentTape = null;
let tracks = [];
let currentTrack = 0;

const audioPlayer = document.getElementById("audioPlayer");
const tapeLabel = document.getElementById("tapeLabel");
const statusText = document.getElementById("statusText");
const trackText = document.getElementById("trackText");


async function loadTape(tapeFile) {

    try {

        statusText.textContent = "Loading...";
        trackText.textContent = "-";

        const response = await fetch(tapeFile);

        if (!response.ok) {
            throw new Error("테이프 파일을 찾을 수 없습니다.");
        }

        const html = await response.text();

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        const tapeData = doc.querySelector("#tape-data");

        if (!tapeData) {
            throw new Error("테이프 데이터가 없습니다.");
        }


        // 테이프 이름
        const title = tapeData.dataset.title || "UNKNOWN TAPE";


        // 음악 파일 목록
        const sourceElements =
            tapeData.querySelectorAll("source");

        tracks = [];

        sourceElements.forEach(source => {

            const src = source.getAttribute("src");

            if (!src) {
                return;
            }

            // tape01.html을 기준으로 음악 경로 계산
            const musicURL = new URL(
                src,
                new URL(tapeFile, window.location.href)
            ).href;

            tracks.push(musicURL);

        });


        if (tracks.length === 0) {
            throw new Error("음악 파일이 없습니다.");
        }


        currentTape = tapeFile;
        currentTrack = 0;

        tapeLabel.textContent = title;

        statusText.textContent = "Ready";

        trackText.textContent =
            "Track 1 / " + tracks.length;


        // 기존 음악 제거
        audioPlayer.pause();
        audioPlayer.removeAttribute("src");
        audioPlayer.load();

    } catch (error) {

        console.error(error);

        statusText.textContent = "ERROR";
        trackText.textContent = error.message;

    }
}


async function playCurrentTrack() {

    if (tracks.length === 0) {

        statusText.textContent =
            "Insert a cassette first";

        return;
    }


    const musicURL = tracks[currentTrack];

    console.log("재생할 음악:", musicURL);


    audioPlayer.src = musicURL;

    audioPlayer.load();


    trackText.textContent =
        "Track " +
        (currentTrack + 1) +
        " / " +
        tracks.length;


    try {

        await audioPlayer.play();

        statusText.textContent = "Playing";

    } catch (error) {

        console.error(error);

        statusText.textContent = "ERROR";

        trackText.textContent =
            error.message;

    }
}


// 음악이 끝나면 다음 곡
audioPlayer.addEventListener("ended", function () {

    if (tracks.length === 0) {
        return;
    }

    currentTrack++;

    if (currentTrack >= tracks.length) {
        currentTrack = 0;
    }

    playCurrentTrack();

});


// EJECT
function ejectTape() {

    audioPlayer.pause();

    audioPlayer.removeAttribute("src");

    audioPlayer.load();

    currentTape = null;
    tracks = [];
    currentTrack = 0;

    tapeLabel.textContent = "NO TAPE";

    statusText.textContent =
        "No cassette inserted";

    trackText.textContent = "-";
}
