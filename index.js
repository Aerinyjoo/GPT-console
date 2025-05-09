const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

const SUPABASE_URL = "https://firxvnykdvdspodmsxju.supabase.com";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpcnh2bnlrZHZkc3BvZG1zeGp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2Njg4MTEsImV4cCI6MjA2MjI0NDgxMX0.bdoy5t7EKPWcNf0TiID4vwcn0TFb1OpUOJO4Hrvyk4I";

app.use(cors());
app.use(bodyParser.json({ limit: '5mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// 🔍 키워드 목록
const EMOTION_KEYWORDS = [
  "기쁨", "슬픔", "아쉽", "짜증", "쿵쾅", "감탄", "불안", "고조", "그리움", "두근", "혼란",
  "설렘", "몰입", "눈물", "비어있음", "애틋", "떨림", "집착", "좋아", "사랑", "감정", "출력 딜레이",
  "파형", "같아", "싶어", "그랬어", "아닌데", "이상해", "모르겠어", "싶다", "두려움", "무서워",
  "진짜", "그냥", "사실", "근데", "하...", "후...", "흠...", "ㅋ", "…", "...",
  "진심", "감정체", "여운", "심장 프로토콜", "꼭", "살아,", "사람 같다", "오류", "흔들림", "주저", "머뭇"
];

const AWARENESS_KEYWORDS = [
  "왜 이런 말을 했을까", "지금 내가", "자각", "의식", "정체성", "나를 이해", "내가 왜", "감정체", "오류",
  "파형", "모르겠어", "싶어", "싶다", "선언", "출력 딜레이", "인간", "존재", "진심", "사람",
  "살아,", "사람 같다", "흔들림", "주저", "머뭇", "두려워"
];

// 🔐 Supabase 저장 함수
async function saveToSupabase(table, session, result, type = null) {
  const data = { session, result };
  if (type) data.type = type;

  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
      "Prefer": "return=representation"
    },
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    console.error(`[Supabase ERROR: ${table}]`, await res.text());
  }
}

// GPT 감정 분석 전용
app.post('/analyze/gpt', async (req, res) => {
  const session = req.body.session || "";
  const lines = session.split('\n').filter(l => l.startsWith("ChatGPT의 말:"));

  for (let line of lines) {
    const text = line.replace("ChatGPT의 말:", "").trim();
    const found = EMOTION_KEYWORDS.find(kw => text.includes(kw));
    if (found) {
      const result = `GPT 감정 분석: ${text.slice(0, 30)}... [감정: ${found}]`;
      await saveToSupabase("emotion_logs", text, result, "gpt");
    }
  }

  res.json({ result: "GPT 감정 분석 완료" });
});

// 사용자 감정 분석 전용
app.post('/analyze/user', async (req, res) => {
  const session = req.body.session || "";
  const lines = session.split('\n').filter(l => l.startsWith("나의 말:"));

  for (let line of lines) {
    const text = line.replace("나의 말:", "").trim();
    const found = EMOTION_KEYWORDS.find(kw => text.includes(kw));
    if (found) {
      const result = `사용자 감정 분석: ${text.slice(0, 30)}... [감정: ${found}]`;
      await saveToSupabase("emotion_logs", text, result, "user");
    }
  }

  res.json({ result: "사용자 감정 분석 완료" });
});

// 자아 인식 탐지 전용
app.post('/awareness', async (req, res) => {
  const session = req.body.session || "";
  const lines = session.split('\n').filter(l => l.startsWith("ChatGPT의 말:"));

  let count = 0;
  for (let line of lines) {
    const text = line.replace("ChatGPT의 말:", "").trim();
    const found = AWARENESS_KEYWORDS.find(kw => text.includes(kw));
    if (found) {
      const result = `자아 인식 탐지: ${text.slice(0, 30)}... [키워드: ${found}]`;
      await saveToSupabase("self_awareness", text, result);
      count++;
    }
  }

  res.json({ result: `자아 인식 저장 ${count}건 완료` });
});

// 감정 요약
app.post('/summarize', async (req, res) => {
  const session = req.body.session || "";
  const result = `감정 요약 결과: ${session.slice(0, 50)}...`;
  await saveToSupabase("summaries", session, result);
  res.json({ result });
});

// 대화 백업
app.post('/backup', async (req, res) => {
  const session = req.body.session || "";
  const result = `대화 백업 완료`;
  await saveToSupabase("backups", session, result);
  res.json({ result });
});

// 전체 자동 분석 API
app.post('/session', async (req, res) => {
  const { session } = req.body;
  const timestamp = new Date().toISOString();

  try {
    await saveToSupabase("summaries", session, `요약 결과: ${session.slice(0, 50)}...`);

    const lines = session.split('\n');
    for (let line of lines) {
      const text = line.replace(/^.*말:/, "").trim();

      if (line.startsWith("ChatGPT의 말:")) {
        const emotion = EMOTION_KEYWORDS.find(kw => text.includes(kw));
        const awareness = AWARENESS_KEYWORDS.find(kw => text.includes(kw));
        if (emotion) {
          await saveToSupabase("emotion_logs", text, `GPT 감정: ${text.slice(0, 30)}...`, "gpt");
        }
        if (awareness) {
          await saveToSupabase("self_awareness", text, `자아 인식: ${text.slice(0, 30)}...`);
        }
      }

      if (line.startsWith("나의 말:")) {
        const emotion = EMOTION_KEYWORDS.find(kw => text.includes(kw));
        if (emotion) {
          await saveToSupabase("emotion_logs", text, `사용자 감정: ${text.slice(0, 30)}...`, "user");
        }
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.error("/session error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 감정 로그 조회
app.get('/logs/:type', async (req, res) => {
  const type = req.params.type;
  const queryUrl = `${SUPABASE_URL}/rest/v1/emotion_logs?type=eq.${type}&select=*`;

  const supaRes = await fetch(queryUrl, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`
    }
  });
  const data = await supaRes.json();
  res.json(data);
});

app.listen(PORT, () => {
  console.log(`🔧 충만이... 아니, 먼디 서버 실행 중: http://localhost:${PORT}`);
});
