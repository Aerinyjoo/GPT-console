const BASE_URL = "https://gpt-console-server.onrender.com";

function showResult(text) {
  document.getElementById("result").innerText = text;
}

function generateFileList(files) {
  const listDiv = document.getElementById("fileList");
  listDiv.innerHTML = ""; // 초기화

  files.forEach((file, i) => {
    const row = document.createElement("div");
    row.className = "file-row";

    const label = document.createElement("label");
    label.textContent = `파일 ${i + 1}: ${file.name}`;

    const input = document.createElement("input");
    input.type = "number";
    input.min = 1;
    input.value = i + 1;
    input.className = "orderInput";

    row.appendChild(label);
    row.appendChild(input);
    listDiv.appendChild(row);
  });
}

document.getElementById("fileInput").addEventListener("change", (e) => {
  const files = Array.from(e.target.files).slice(0, 10);
  generateFileList(files);
});

function uploadFiles() {
  const files = Array.from(document.getElementById("fileInput").files).slice(0, 10);
  const orderInputs = document.querySelectorAll(".orderInput");

  if (files.length === 0) {
    showResult("📂 파일을 선택해주세요!");
    return;
  }

  const session_id = crypto.randomUUID();
  showResult("📤 업로드 중입니다...");

  const promises = files.map((file, index) => {
    return new Promise((resolve, reject) => {
      const order = parseInt(orderInputs[index].value || index + 1);

      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const sessionText = reader.result;

          const response = await fetch(`${BASE_URL}/session`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ session: sessionText, order, session_id })
          });

          if (!response.ok) throw new Error(`파일 ${file.name} 실패`);
          resolve(`✔️ ${file.name} (대화방 ${order}) 업로드 성공`);
        } catch (err) {
          reject(`❌ ${file.name} 실패: ${err.message}`);
        }
      };

      reader.onerror = () => reject(`❌ ${file.name} 읽기 실패`);
      reader.readAsText(file, "utf-8");
    });
  });

  Promise.allSettled(promises).then(results => {
    const summary = results.map(r => r.value || r.reason).join("\n");
    showResult(summary);
  });
}
