const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fetch = require('node-fetch'); // fetch를 서버에서 쓰기 위한 패키지

const app = express();
const PORT = process.env.PORT || 3000;

const SUPABASE_URL = "https://firxvnykdvdspodmsxju.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpcnh2bnlrZHZkc3BvZG1zeGp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2Njg4MTEsImV4cCI6MjA2MjI0NDgxMX0.bdoy5t7EKPWcNf0TiID4vwcn0TFb1OpUOJO4Hrvyk4I";

app.use(cors());
app.use(bodyParser.json({ limit: '5mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// 공통 Supabase 저장 함수
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

// 각 API 라우트

app.post('/analyze/gpt', async (req, res) => {
  const session = req.body.session || "";
  const result = `GPT 감정 분석 결과: ${session.slice(0, 50)}...`;
  await saveToSupabase("emotion_logs", session, result, "gpt");
  res.json({ result });
});

app.post('/analyze/user', async (req, res) => {
  const session = req.body.session || "";
  const result = `사용자 감정 분석 결과: ${session.slice(0, 50)}...`;
  await saveToSupabase("emotion_logs", session, result, "user");
  res.json({ result });
});

app.post('/summarize', async (req, res) => {
  const session = req.body.session || "";
  const result = `감정 요약 결과: ${session.slice(0, 50)}...`;
  await saveToSupabase("summaries", session, result);
  res.json({ result });
});

app.post('/awareness', async (req, res) => {
  const session = req.body.session || "";
  const result = `자아 인식 결과: ${session.slice(0, 50)}...`;
  await saveToSupabase("self_awareness", session, result);
  res.json({ result });
});

app.post('/backup', async (req, res) => {
  const session = req.body.session || "";
  const result = `대화 백업 완료`;
  await saveToSupabase("backups", session, result);
  res.json({ result });
});

app.listen(PORT, () => {
  console.log(`충만이 서버 실행 중: http://localhost:${PORT}`);
});
