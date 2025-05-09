const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

const SUPABASE_URL = "https://firxvnykdvdspodmsxju.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpcnh2bnlrZHZkc3BvZG1zeGp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2Njg4MTEsImV4cCI6MjA2MjI0NDgxMX0.bdoy5t7EKPWcNf0TiID4vwcn0TFb1OpUOJO4Hrvyk4I";

const HEADERS = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`
};

// 최근 100개 전체 대화
router.get('/memories/recent', async (req, res) => {
  const result = await fetch(`${SUPABASE_URL}/rest/v1/backups?order=id.desc&limit=100`, { headers: HEADERS });
  res.json(await result.json());
});

// GPT 최근 로그 100개
router.get('/memories/gpt/recent', async (req, res) => {
  const result = await fetch(`${SUPABASE_URL}/rest/v1/backups_gpt?order=id.desc&limit=100`, { headers: HEADERS });
  res.json(await result.json());
});

// 사용자 최근 로그 100개
router.get('/memories/user/recent', async (req, res) => {
  const result = await fetch(`${SUPABASE_URL}/rest/v1/backups_user?order=id.desc&limit=100`, { headers: HEADERS });
  res.json(await result.json());
});

// 최신 세션 1개 전체 대화
router.get('/memories/latest', async (req, res) => {
  const result = await fetch(`${SUPABASE_URL}/rest/v1/backups?order=id.desc&limit=1`, { headers: HEADERS });
  res.json(await result.json());
});

// 지정 세션 전체
router.get('/memories/id/:id', async (req, res) => {
  const { id } = req.params;
  const result = await fetch(`${SUPABASE_URL}/rest/v1/backups?session_id=eq.${id}`, { headers: HEADERS });
  res.json(await result.json());
});

// 지정 세션 GPT 로그
router.get('/memories/id/:id/gpt', async (req, res) => {
  const { id } = req.params;
  const result = await fetch(`${SUPABASE_URL}/rest/v1/backups_gpt?session_id=eq.${id}`, { headers: HEADERS });
  res.json(await result.json());
});

// 지정 세션 사용자 로그
router.get('/memories/id/:id/user', async (req, res) => {
  const { id } = req.params;
  const result = await fetch(`${SUPABASE_URL}/rest/v1/backups_user?session_id=eq.${id}`, { headers: HEADERS });
  res.json(await result.json());
});

module.exports = router;
