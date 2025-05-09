const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json({ limit: '5mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.post('/analyze/gpt', (req, res) => {
  const session = req.body.session;
  // 가짜 응답 (임시)
  res.json({ result: `GPT 감정 분석 결과 (임시): ${session.slice(0, 50)}...` });
});

// 다른 라우트들도 비슷하게 추가 가능

app.listen(PORT, () => {
  console.log(`충만이 서버 실행 중: http://localhost:${PORT}`);
});
