console.log('Kinetic Constellation Content Script Loaded');

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'extract-job') {
        const jobData = {
            title: document.title,
            url: window.location.href,
            description: document.body.innerText // Simple extraction for now
        };
        console.log('Extracted Job Data:', jobData);
        sendResponse(jobData);
    }
    return true; // Keep channel open for async response
});
