document.addEventListener('DOMContentLoaded', init, false);
function init() {
    load()
    startEl().addEventListener('click', start, false)
    document.querySelector('#submit').addEventListener('click', save, false);
    stopEl().addEventListener('click', stop, false);
}

function stop() {
    chrome.runtime.sendMessage({data: "stop"}, function (started) {
        started? toggleVisibility([startEl(), stopEl()]):''
    });
}

function start() {
    save()
    chrome.runtime.sendMessage({data: "start"}, function (started) {
        started? toggleVisibility([startEl(), stopEl()]):''
    });
}

function load() {
    chrome.storage.sync.get('data', function (obj) {
        //TODO check empty
        if (obj.data == null)
            return
        const {urls, timeout} = obj.data
        urls.forEach((url, index) => getUrlsInputs().item(index).value = url)
        intervalEl().value = timeout != null ? timeout : 5
    })
    chrome.runtime.sendMessage({data: 'status'}, function(status) {
        if (status)
            toggleVisibility([startEl(), stopEl()])
    })
}

function save() {
    const urls = getUrlInputValues()
    const timeout = intervalEl().value
    chrome.storage.sync.set({data: {urls: urls, timeout: timeout}})
}

function getUrlInputValues() {
    let urls = [].map.call(document.querySelectorAll('.urls'), el => el.value)
    urls = urls.filter( url => url.length > 0)
    urls = urls.map(setHttp)
    return urls
}

function setHttp(link) {
    if (link.search(/^http[s]?:\/\//) === -1) {
        link = 'https://' + link;
    }
    return link;
}

function getUrlsInputs() {
    return document.querySelectorAll('.urls')
}
function startEl() {
    return document.querySelector('#start')
}
function stopEl() {
    return document.querySelector('#stop')
}
function intervalEl() {
    return document.querySelector('#interval')
}
function toggleVisibility(elements) {
    elements.forEach(el => {
        switch (el.style.display) {
            case 'none':
                el.style.display = 'inherit'
                break
            default:
                el.style.display = 'none'
                break
        }
    })
}