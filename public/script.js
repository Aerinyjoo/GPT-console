const BASE_URL = "https://gpt-console-server.onrender.com";

function getSessionText() {
  return document.getElementById("sessionInput").value;
}

function showResult(text) {
  document.getElementById("result").innerText = text;
}

function postToAPI(endpoint) {
  const text = getSessionText();
  fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ session: text })
  })
  .then(res => res.json())
  .then(data => showResult(data.result))
  .catch(err => showResult("에러 발생: " + err.message));
}

function analyzeGPT() {
  postToAPI("/analyze/gpt");
}

function analyzeUser() {
  postToAPI("/analyze/user");
}

function summarize() {
  postToAPI("/summarize");
}

function selfAwareness() {
  postToAPI("/awareness");
}

function backup() {
  postToAPI("/backup");
}
