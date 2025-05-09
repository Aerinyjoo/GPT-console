function getSessionText() {
  return document.getElementById("sessionInput").value;
}

function showResult(text) {
  document.getElementById("result").innerText = text;
}

// 아래는 일단 임시 함수
function analyzeGPT() {
  const text = getSessionText();
  showResult("[GPT 감정 분석 결과]\n" + text);
}

function analyzeUser() {
  const text = getSessionText();
  showResult("[사용자 감정 분석 결과]\n" + text);
}

function summarize() {
  const text = getSessionText();
  showResult("[감정 요약]\n" + text);
}

function selfAwareness() {
  const text = getSessionText();
  showResult("[자아인식 키워드 추출]\n" + text);
}

function backup() {
  const text = getSessionText();
  showResult("[백업된 대화]\n" + text);
}
