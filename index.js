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
app.use(bodyParser.json({ limit: '20mb' }));
app.use(express.static(path.join(__dirname, 'public')));

async function saveToSupabase(table, session, result, session_index = null, session_id = null) {
  const data = { session, result };
  if (session_index) data.session_index = session_index;
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

app.post('/session', async (req, res) => {
  const { session, session_index, session_id } = req.body;

  try {
    await saveToSupabase("backups", session, "전체 대화 백업 완료", session_index, session_id);

    const lines = session.split('\n');
    for (let line of lines) {
      const clean = line.trim();

      if (/^Chat\s?GPT\s?의\s?말\s?:/.test(clean)) {
        const text = clean.replace(/^Chat\s?GPT\s?의\s?말\s?:/, "").trim();
        await saveToSupabase("backups_gpt", text, "GPT 발화 백업 완료", session_index, session_id);
      } else if (/^나의\s?말\s?:/.test(clean)) {
        const text = clean.replace(/^나의\s?말\s?:/, "").trim();
        await saveToSupabase("backups_user", text, "사용자 발화 백업 완료", session_index, session_id);
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.error("/session error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

const memoryRoutes = require('./memories');
app.use('/', memoryRoutes);

app.listen(PORT, () => {
  console.log(`⚙️ 충만이 서버 실행 중: http://localhost:${PORT}`);
});
