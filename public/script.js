const BASE_URL = "https://gpt-console-server.onrender.com";

function getSessionText() {
  return document.getElementById("sessionInput").value;
}

function showResult(text) {
  document.getElementById("result").innerText = text;
}

function uploadSession() {
  const text = getSessionText();
  fetch(`${BASE_URL}/session`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ session: text })
  })
  .then(res => res.json())
  .then(data => showResult("백업 완료"))
  .catch(err => showResult("에러 발생: " + err.message));
}
