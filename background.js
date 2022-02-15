chrome.runtime.onMessage.addListener((message, callback) => {
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
        if (message.data === "start") {
            if (WorkerFactory.get(tabs[0].id)) {
                WorkerFactory.get(tabs[0].id).stop()
            }
            WorkerFactory.create(tabs[0].id)
        }
        if (message.data === "stop") {
            WorkerFactory.get(tabs[0].id).stop()
        }
    })
    return true
});

class WorkerFactory {
    static workers = {}

    static create(tabId) {
        this.workers[tabId] = new Worker(tabId)
    }

    static get(tabId) {
        return this.workers[tabId]
    }
}

class Worker {
    constructor(tabId) {
        this.timeoutID = undefined
        this.tabId = tabId
        this.urls = []
        this.start()
    }

    start() {
        chrome.storage.sync.get('data', (obj) => {
            this.urls = obj.data.urls
            const timeout = obj.timeout != null ? obj.timeout : 5
            this.rotateURL()
            this.timeoutID = setInterval(() => {
                this.rotateURL()
            }, timeout * 1000)
        })
    }

    stop() {
        clearInterval(this.timeoutID)
    }

    rotateURL() {
        chrome.tabs.update(this.tabId, {url: this.urls[0]});
        console.error(this.urls[0])
        this.urls = this.urls.rotate()
        console.error(...this.urls)
    }
}

Array.prototype.rotate = function () {
    return [...this.slice(1, this.length), ...this.slice(0, 1)];
};