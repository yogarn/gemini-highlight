let isAPIKeyEnabled = false;
let currentAPIKey = "";

function setAPIKey(newAPIKey) {
  currentAPIKey = newAPIKey;
  if (newAPIKey && newAPIKey != "disable") {
    isAPIKeyEnabled = true;
  } else {
    isAPIKeyEnabled = false;
  }

  browser.storage.local.set({ apiKey: newAPIKey }, () => {
    console.log('API key saved:', newAPIKey);
  });
}

function getSavedAPIKey(callback) {
  browser.storage.local.get(['apiKey'], (result) => {
    const savedAPIKey = result.apiKey || "";
    setAPIKey(savedAPIKey);
    callback(savedAPIKey);
  });
}

getSavedAPIKey((savedAPIKey) => {
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "setAPIKey") {
      setAPIKey(message.apiKey);
      sendResponse({ success: true });
      alert('API key saved');
    }
  });
});

async function getAnswer(selectedText) {
  if (!isAPIKeyEnabled) {
    console.log("api key disabled");
    return undefined;
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${currentAPIKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Pilih jawaban yang paling tepat, berikan jawaban eksak berdasarkan pilihan, tanpa penjelasan detail. Jika tidak terdapat pilihan jawaban, berikan jawaban dalam bentuk uraian singkat.\n${selectedText}`,
              },
            ],
          },
        ],
      }),
    }
  );

  const data = await response.json();
  console.log(data);
  const correctAnswer = data.candidates[0].content.parts[0].text.trim();
  return correctAnswer;
}

async function handleHighlightedText() {
  const selectedText = window.getSelection().toString().trim();
  if (selectedText) {
    try {
      const answer = await getAnswer(selectedText);
      if (answer != undefined) {
        alert(answer);
      }
    } catch (e) {
      alert("Internal server error");
      console.error(e);
    }
  }
}

function setupHighlightListener() {
  document.addEventListener("keydown", (event) => {
    if (event.ctrlKey && event.altKey && event.shiftKey) {
      handleHighlightedText();
    }
  });
}

function enableTextSelection() {
  const style = document.createElement('style');
  style.innerHTML = `
    * {
      -webkit-user-select: text !important;
      -moz-user-select: text !important;
      -ms-user-select: text !important;
      user-select: text !important;
    }
  `;
  document.head.appendChild(style);
}

function removeSelectionListeners() {
  ['selectstart', 'mousedown', 'mouseup'].forEach(event => {
    document.addEventListener(event, (e) => {
      e.stopPropagation();
    }, true);
  });
}


enableTextSelection();
removeSelectionListeners();
setupHighlightListener();
