const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fetch = require('node-fetch');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// ⚠️ 임시로 하드코딩된 Supabase 설정 (절대 커밋 금지)
const SUPABASE_URL = "https://firxvnykdvdspodmsxju.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpcnh2bnlrZHZkc3BvZG1zeGp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2Njg4MTEsImV4cCI6MjA2MjI0NDgxMX0.bdoy5t7EKPWcNf0TiID4vwcn0TFb1OpUOJO4Hrvyk4I";

app.use(cors());
app.use(bodyParser.json({ limit: '20mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const HEADERS = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`
};

async function saveToSupabase(table, session, result, session_index = null, session_id = null) {
  const data = { session, result };
  if (session_index) data.session_index = session_index;
  if (session_id) data.session_id = session_id;

  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...HEADERS
    },
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    console.error(`[Supabase ERROR: ${table}]`, await res.text());
  }
}

// ✅ 전체 세션 백업만 수행
app.post('/session', async (req, res) => {
  const { session, session_index, session_id } = req.body;
  try {
    await saveToSupabase("backups", session, "전체 대화 백업 완료", session_index, session_id);
    res.json({ success: true });
  } catch (err) {
    console.error("/session error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ 최신 세션 (session_index 기준 정렬)
app.get('/memories/recent', async (req, res) => {
  const result = await fetch(
    `${SUPABASE_URL}/rest/v1/backups?order=session_index.desc&limit=1`,
    { headers: HEADERS }
  );
  res.json(await result.json());
});

// ✅ 지정 세션 Index로 조회
app.get('/memories/index/:index', async (req, res) => {
  const { index } = req.params;
  const result = await fetch(
    `${SUPABASE_URL}/rest/v1/backups?session_index=eq.${index}`,
    { headers: HEADERS }
  );
  res.json(await result.json());
});

app.listen(PORT, () => {
  console.log(`⚡ Server running at http://localhost:${PORT}`);
});
