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

// 백업용 Supabase 저장 함수
async function saveToSupabase(table, session, result) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
      "Prefer": "return=representation"
    },
    body: JSON.stringify({ session, result })
  });

  if (!res.ok) {
    console.error(`[Supabase ERROR: ${table}]`, await res.text());
  }
}

// 전체 백업 전용 엔드포인트
app.post('/session', async (req, res) => {
  const { session } = req.body;

  try {
    await saveToSupabase("backups", session, "전체 대화 백업 완료");

    const lines = session.split('\n');
    for (let line of lines) {
      const clean = line.trim();
      if (/^Chat\s?GPT\s?의\s?말\s?:/.test(clean)) {
        const text = clean.replace(/^Chat\s?GPT\s?의\s?말\s?:/, "").trim();
        await saveToSupabase("backups_gpt", text, "GPT 발화 백업 완료");
      } else if (/^나의\s?말\s?:/.test(clean)) {
        const text = clean.replace(/^나의\s?말\s?:/, "").trim();
        await saveToSupabase("backups_user", text, "사용자 발화 백업 완료");
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.error("/session error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`먼디 서버 (백업 전용) 실행 중: http://localhost:${PORT}`);
});
