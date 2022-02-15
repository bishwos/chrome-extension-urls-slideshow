document.addEventListener('DOMContentLoaded', init, false);
function init() {
    load()
    document.querySelector('#start').addEventListener('click', start, false)
    document.querySelector('#submit').addEventListener('click', save, false);
    document.querySelector('#stop').addEventListener('click', stop, false);
}

function stop() {
    chrome.runtime.sendMessage({data: "stop"}, function (response) {
        //TODO show stopped
    });
}

function start() {
    chrome.runtime.sendMessage({data: "start"}, function (response) {
        //TODO show running
    });
}

function load() {
    chrome.storage.sync.get('data', function (obj) {
        //TODO check empty
        if (obj.data == null)
            return
        const {urls, timeout} = obj.data
        urls.forEach((url, index) => getUrlsInputs().item(index).value = url)
        document.querySelector('#interval').value = timeout != null ? timeout : 5
    })
}

function save() {
    const urls = getUrlInputValues()
    const timeout = document.querySelector('#interval').value
    chrome.storage.sync.set({data: {urls: urls, timeout: timeout}})
}

function getUrlInputValues() {
    return [].map.call(document.querySelectorAll('.urls'), el => el.value)
}

function getUrlsInputs() {
    return document.querySelectorAll('.urls')
}