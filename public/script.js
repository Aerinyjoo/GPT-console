const BASE_URL = "https://gpt-console-server.onrender.com";

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
  .then(data => showResult("백업 완료! 🎉"))
  .catch(err => showResult("에러 발생: " + err.message));
}

// 첨부파일 처리
document.getElementById("fileInput").addEventListener("change", (event) => {
  const files = Array.from(event.target.files).slice(0, 10); // 최대 10개
  let readerPromises = files.map(file => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsText(file, "utf-8");
    });
  });

  Promise.all(readerPromises).then(contents => {
    const fullText = contents.join("\n\n--- 파일 구분 ---\n\n");
    document.getElementById("sessionInput").value = fullText;
  }).catch(err => {
    showResult("파일 읽기 실패: " + err.message);
  });
});
