function setAPIKey(apiKey) {
    chrome.tabs.query({ active: true, currentWindow: true })
        .then((tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, {
                action: "setAPIKey",
                apiKey: apiKey,
            });
        })
        .then(() => {
            alert("API key set successfully.");
        })
        .catch(reportError);
}

document.addEventListener("click", (e) => {
    if (e.target.id === "enable-api-key") {
        const apiKey = document.getElementById("api-key-input").value;
        if (apiKey) {
            setAPIKey(apiKey);
        } else {
            setAPIKey("disable");
        }
    }
});
