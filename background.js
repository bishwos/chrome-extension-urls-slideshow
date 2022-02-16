chrome.runtime.onMessage.addListener((message, sender, callback) => {
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
        let worker = WorkerFactory.get(tabs[0].id)
        switch (message.data) {
            case 'start':
                if (worker.started) {
                    worker.stop()
                }
                worker.start()
                break
            case 'stop':
                worker.stop()
                break
        }
        callback(worker.started)
    })
    return true
});

class WorkerFactory {
    static workers = {}

    static create(tabId) {
        this.workers[tabId] = new Worker(tabId)
        return this.workers[tabId]
    }

    static get(tabId) {
        if (this.workers.hasOwnProperty(tabId)) {
            return this.workers[tabId]
        }
        return this.create(tabId)
    }
}

class Worker {
    constructor(tabId) {
        this.timeoutID = undefined
        this.tabId = tabId
        this.urls = []
        this.timeout = 5
        this.started = false
    }

    start() {
        chrome.storage.sync.get('data', (obj) => {
            this.urls = obj.data.urls
            this.timeout = obj.data.timeout != null ? obj.data.timeout : 5
            this.rotateURL()
            this.started = true
        })
    }

    stop() {
        clearInterval(this.timeoutID)
        this.started = false
    }

    rotateURL() {
        chrome.tabs.update(this.tabId, {url: this.urls[0]});
        this.urls = this.urls.rotate()
        this.timeoutID = setTimeout(this.rotateURL.bind(this), this.timeout * 1000)
    }

}

Array.prototype.rotate = function () {
    return [...this.slice(1, this.length), ...this.slice(0, 1)];
};