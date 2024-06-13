function setAPIKey(apiKey) {
  browser.tabs
    .query({ active: true, currentWindow: true })
    .then((tabs) => {
      browser.tabs.sendMessage(tabs[0].id, {
        action: "setAPIKey",
        apiKey: apiKey,
      });
    })
    .then(() => {})
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
