let currentTape = null;
let tracks = [];
let currentTrack = 0;

const audioPlayer = document.getElementById("audioPlayer");
const tapeLabel = document.getElementById("tapeLabel");
const statusText = document.getElementById("statusText");
const trackText = document.getElementById("trackText");


// 테이프 넣기
async function loadTape(tapeFile) {

    try {

        statusText.textContent = "Loading...";
        trackText.textContent = "-";

        const response = await fetch(tapeFile);

        if (!response.ok) {
            throw new Error("테이프 파일을 불러오지 못했습니다.");
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


        // 음악 목록 가져오기
        const sources = tapeData.querySelectorAll("source");

        tracks = [];

        sources.forEach(source => {

            const src = source.getAttribute("src");

            if (src) {

                const fullPath = new URL(
                    src,
                    new URL(tapeFile, window.location.href)
                ).href;

                tracks.push(fullPath);
            }

        });


        if (tracks.length === 0) {
            throw new Error("음악 파일이 없습니다.");
        }


        // 현재 테이프 저장
        currentTape = tapeFile;
        currentTrack = 0;


        // 화면 변경
        tapeLabel.textContent = title;
        statusText.textContent = "Playing";

        trackText.textContent =
            "Track 1 / " + tracks.length;


        // 음악 재생
        audioPlayer.src = tracks[0];
        audioPlayer.currentTime = 0;

        await audioPlayer.play();

    } catch (error) {

        console.error(error);

        statusText.textContent = "ERROR";
        trackText.textContent = error.message;

    }
}


// 현재 곡 재생
async function playCurrentTrack() {

    if (tracks.length === 0) {
        return;
    }

    audioPlayer.src = tracks[currentTrack];
    audioPlayer.currentTime = 0;

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

        statusText.textContent = "Press PLAY";

    }
}


// 곡이 끝났을 때
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


// 테이프 꺼내기
function ejectTape() {

    audioPlayer.pause();

    audioPlayer.removeAttribute("src");
    audioPlayer.load();

    currentTape = null;
    tracks = [];
    currentTrack = 0;

    tapeLabel.textContent = "NO TAPE";
    statusText.textContent = "No cassette inserted";
    trackText.textContent = "-";
}
