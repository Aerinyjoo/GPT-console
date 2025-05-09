const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

const SUPABASE_URL = "https://firxvnykdvdspodmsxju.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpcnh2bnlrZHZkc3BvZG1zeGp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2Njg4MTEsImV4cCI6MjA2MjI0NDgxMX0.bdoy5t7EKPWcNf0TiID4vwcn0TFb1OpUOJO4Hrvyk4I";

app.use(cors());
app.use(bodyParser.json({ limit: '5mb' }));
app.use(express.static(path.join(__dirname, 'public')));

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

// ✅ 핵심! 전체 세션 자동 분석
app.post('/session', async (req, res) => {
  const { session } = req.body;
  const timestamp = new Date().toISOString();

  try {
    await saveToSupabase("summaries", session, `요약 결과: ${session.slice(0, 50)}...`);

    const lines = session.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith("ChatGPT의 말:")) {
        const text = line.replace("ChatGPT의 말:", "").trim();
        const emotionResult = `GPT 감정 분석 결과: ${text.slice(0, 30)}...`;
        const awarenessResult = `자아 인식 결과: ${text.slice(0, 30)}...`;
        await saveToSupabase("emotion_logs", text, emotionResult, "gpt");
        await saveToSupabase("self_awareness", text, awarenessResult);
      } else if (line.startsWith("나의 말:")) {
        const text = line.replace("나의 말:", "").trim();
        const emotionResult = `사용자 감정 분석 결과: ${text.slice(0, 30)}...`;
        await saveToSupabase("emotion_logs", text, emotionResult, "user");
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.error("/session error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 감정 로그 조회 API
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
  console.log(`먼디 서버 작동 중: http://localhost:${PORT}`);
});
