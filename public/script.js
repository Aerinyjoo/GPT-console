const BASE_URL = "https://gpt-console-server.onrender.com"; // 너의 서버 주소로 바꿔줘

function showResult(text) {
  document.getElementById("result").innerText = text;
}

function generateFileList(files) {
  const listDiv = document.getElementById("fileList");
  listDiv.innerHTML = "";

  files.forEach((file, i) => {
    const row = document.createElement("div");
    row.className = "file-row";

    const label = document.createElement("label");
    label.textContent = `파일 ${i + 1}: ${file.name}`;

    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = `예: ${i + 1}`;
    input.className = "indexInput";

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
  const indexInputs = document.querySelectorAll(".indexInput");

  if (files.length === 0) {
    showResult("📂 파일을 선택하세요!");
    return;
  }

  const session_id = crypto.randomUUID();
  showResult("📤 업로드 중입니다...");

  const promises = files.map((file, index) => {
    return new Promise((resolve, reject) => {
      const session_index = indexInputs[index].value || `${index + 1}`;
      const reader = new FileReader();

      reader.onload = async () => {
        try {
          const sessionText = reader.result;

          const response = await fetch(`${BASE_URL}/session`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ session: sessionText, session_index, session_id })
          });

          if (!response.ok) throw new Error(`파일 ${file.name} 실패`);
          resolve(`✔️ ${file.name} (세션: ${session_index}) 업로드 성공`);
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
