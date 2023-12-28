const API_BASE_URL = "https://www.mp3quran.net/api/v3/";
const RECITERS_ENDPOINT = "reciters";
const LANGUAGE_PARAM = "?language=ar";
const SUWAR_ENDPOINT = "suwar";


function playLive(url) {
    if (Hls.isSupported()) {
        const videoElement = document.querySelector('video');
        const hls = new Hls();

        hls.loadSource(url);
        hls.attachMedia(videoElement);

        hls.on(Hls.Events.MANIFEST_PARSED, function () {
            videoElement.play();
        });
    }
}




function observeSelectChanges(selectId, callback) {
    const selectElement = document.getElementById(selectId);
    const observer = new MutationObserver(callback);

    const observerConfig = {
        childList: true,
        subtree: true
    };

    observer.observe(selectElement, observerConfig);
}

function handleSurahChange() {
    const selectedSource = $('#surahSelect').val();
    console.log(selectedSource);
    $('audio').find('source').attr('src', selectedSource);
    $('audio').get(0).load();
}

function handleNovelsChange() {
    const selectedOption = $('#novelsSelect').find('option:selected');
    const surahServer = selectedOption.data('server');
    const surahList = selectedOption.data('surahlist');

    fillSurahData(surahServer, surahList);
}
function fetchRecitersData() {
    const url = `${API_BASE_URL}${RECITERS_ENDPOINT}${LANGUAGE_PARAM}`;
    $.ajax({
        url: url,
        method: 'GET',
        success: function (data) {
            const sortedReciters = data.reciters.sort((a, b) => a.name.localeCompare(b.name));
            sortedReciters.forEach(function (reciter) {
                const option = $('<option>');
                option.text(reciter.name);
                option.val(reciter.id);
                $('#recitersSelect').append(option);
            });
        },
        error: function (xhr, status, error) {
            console.error('Request failed. Status: ' + status + ', Error: ' + error);
        }
    });
}

function fillNovelsData(reciterId) {
    const url = `${API_BASE_URL}${RECITERS_ENDPOINT}${LANGUAGE_PARAM}&reciter=${reciterId}`;
    const novelsSelect = $('#novelsSelect');
    novelsSelect.empty();
    $.ajax({
        url: url,
        method: 'GET',
        success: function (data) {
            data.reciters.forEach(function (reciter) {
                reciter.moshaf.forEach(function (novel) {
                    const option = $(`
                    <option
                        value="${novel.id}"
                        data-server="${novel.server}"
                        data-surahList="${novel.surah_list}">
                        ${novel.name}
                    </option>`);
                    novelsSelect.append(option);
                });
            });
        },
        error: function (xhr, status, error) {
            console.error('Request failed. Status: ' + status + ', Error: ' + error);
        }
    });
}

function fillSurahData(surahServer, surahList) {
    const url = `${API_BASE_URL}${SUWAR_ENDPOINT}${LANGUAGE_PARAM}`;
    const surahSelect = $('#surahSelect');
    surahSelect.empty();
    $.ajax({
        url: url,
        method: 'GET',
        success: function (data) {
            data.suwar.forEach(function (surah) {
                const formattedSurahId = String(surah.id).padStart(3, "0");
                const option = $(`
                    <option value="${surahServer}${formattedSurahId}.mp3">
                        ${surah.name}
                    </option>
                `);
                surahSelect.append(option);
            });
        },
        error: function (xhr, status, error) {
            console.error('Request failed. Status: ' + status + ', Error: ' + error);
        }
    });
}
function observeSelectChangesWithDelay(selectId, callback, delay) {
    setTimeout(function () {
        observeSelectChanges(selectId, callback);
    }, delay);
}
$(document).ready(function () {
    fetchRecitersData();

    $('#recitersSelect').on('change', function () {
        const selectedReciterId = $(this).val();
        fillNovelsData(selectedReciterId);
    });

    observeSelectChangesWithDelay('novelsSelect', handleNovelsChange,2000);


    $('#novelsSelect').on('change', function () {
        setTimeout(function () {
            handleNovelsChange();
        }, 2000); 
    });

    $('#surahSelect').on('change', function () {
        setTimeout(function () {
            handleSurahChange();
        }, 2000); 
    });
    observeSelectChangesWithDelay('surahSelect', handleSurahChange,2000);

    
});
