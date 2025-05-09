const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

const SUPABASE_URL = "https://firxvnykdvdspodmsxju.supabase.co";
const SUPABASE_KEY = "YOUR_SUPABASE_KEY"; // 👈 반드시 여기에 네 키 넣어라

app.use(cors());
app.use(bodyParser.json({ limit: '20mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// 🔧 Supabase 저장 함수
async function saveToSupabase(table, session, result, order = null, session_id = null) {
  const data = { session, result };
  if (order !== null) data.session_order = order;
  if (session_id) data.session_id = session_id;

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

// 📦 대화 전체 저장 + 발화별 분리 저장
app.post('/session', async (req, res) => {
  const { session, order, session_id } = req.body;

  try {
    // 전체 대화 백업
    await saveToSupabase("backups", session, "전체 대화 백업 완료", order, session_id);

    // 발화별 분리
    const lines = session.split('\n');
    for (let line of lines) {
      const clean = line.trim();

      if (/^Chat\s?GPT\s?의\s?말\s?:/.test(clean)) {
        const text = clean.replace(/^Chat\s?GPT\s?의\s?말\s?:/, "").trim();
        await saveToSupabase("backups_gpt", text, "GPT 발화 백업 완료", order, session_id);
      } else if (/^나의\s?말\s?:/.test(clean)) {
        const text = clean.replace(/^나의\s?말\s?:/, "").trim();
        await saveToSupabase("backups_user", text, "사용자 발화 백업 완료", order, session_id);
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.error("/session error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`⚙️ 충만이 백업 서버 실행 중: http://localhost:${PORT}`);
});
