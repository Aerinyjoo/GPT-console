const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

const SUPABASE_URL = "https://firxvnykdvdspodmsxju.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpcnh2bnlrZHZkc3BvZG1zeGp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2Njg4MTEsImV4cCI6MjA2MjI0NDgxMX0.bdoy5t7EKPWcNf0TiID4vwcn0TFb1OpUOJO4Hrvyk4I";

const HEADERS = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`
};

// 최신 세션 (session_index 기준)
router.get('/memories/latest', async (req, res) => {
  const result = await fetch(
    `${SUPABASE_URL}/rest/v1/backups?order=session_index.desc&limit=1`,
    { headers: HEADERS }
  );
  res.json(await result.json());
});

// 지정 세션 ID로 불러오기
router.get('/memories/id/:id', async (req, res) => {
  const { id } = req.params;
  const result = await fetch(
    `${SUPABASE_URL}/rest/v1/backups?session_id=eq.${id}`,
    { headers: HEADERS }
  );
  res.json(await result.json());
});

module.exports = router;
