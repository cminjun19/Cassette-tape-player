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

        const response = await fetch(tapeFile);

        if (!response.ok) {
            throw new Error("테이프 파일을 불러올 수 없습니다.");
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

        // 음악 목록
        const sources = tapeData.querySelectorAll("source");

        tracks = [];

        sources.forEach(source => {

            const src = source.getAttribute("src");

            if (src) {

                // tape HTML 기준으로 음악 경로를 정확하게 변환
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

        currentTape = tapeFile;
        currentTrack = 0;

        tapeLabel.textContent = title;
        statusText.textContent = "Playing";

        playCurrentTrack();

    } catch (error) {

        console.error(error);

        statusText.textContent = "Tape Error";
        trackText.textContent = error.message;

    }
}


// 현재 음악 재생
function playCurrentTrack() {

    if (tracks.length === 0) {
        return;
    }

    audioPlayer.src = tracks[currentTrack];

    trackText.textContent =
        "Track " + (currentTrack + 1) + " / " + tracks.length;

    audioPlayer.play()
        .catch(error => {
            console.log("자동 재생이 차단되었습니다.", error);
            statusText.textContent = "Ready";
        });
}


// 음악이 끝났을 때 다음 곡
audioPlayer.addEventListener("ended", function () {

    if (tracks.length === 0) {
        return;
    }

    currentTrack++;

    // 마지막 곡이면 첫 곡으로
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
