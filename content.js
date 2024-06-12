let isAPIKeyEnabled = false;
let currentAPIKey = "";

function setAPIKey(newAPIKey) {
    currentAPIKey = newAPIKey;
    isAPIKeyEnabled = !!newAPIKey;
    alert("API key set");
}

browser.runtime.onMessage.addListener((message) => {
    if (message.action === "setAPIKey") {
        setAPIKey(message.apiKey);
    }
});

async function getAnswer(selectedText, choices) {
  if (!isAPIKeyEnabled) {
    alert("API key is not enabled.");
    return;
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
                text: `Pilih jawaban yang paling tepat, langsung berikan jawaban eksak berdasarkan pilihan:\n${selectedText}\n${choices.join(
                  "\n"
                )}`,
              },
            ],
          },
        ],
      }),
    }
  );

  const data = await response.json();
  const correctAnswer = data.candidates[0].content.parts[0].text.trim();
  return correctAnswer;
}

async function handleHighlightedText() {
  const selectedText = window.getSelection().toString().trim();
  const choices = Array.from(
    document.querySelectorAll('input[name="answer"]')
  ).map((input) => input.value);

  if (selectedText) {
    try {
      const answer = await getAnswer(selectedText, choices);
      if (answer != undefined) {
        alert(answer);
        setRadioButton(answer);
      }
    } catch (e) {
      alert("internal server error");
    }
  }
}

function setRadioButton(answer) {
  const radioButtons = document.querySelectorAll('input[name="answer"]');
  if (radioButtons) {
    radioButtons.forEach((button) => {
      if (button.value.trim() === answer) {
        button.checked = true;
      }
    });
  }
}

function setupHighlightListener() {
  document.addEventListener("mouseup", handleHighlightedText);
}

setupHighlightListener();
