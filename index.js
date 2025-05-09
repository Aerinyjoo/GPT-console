const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const makeResponse = (label) => (req, res) => {
  const session = req.body.session || "";
  res.json({ result: `${label}: ${session.slice(0, 50)}...` });
};

app.post('/analyze/gpt', makeResponse('GPT 감정 분석 결과'));
app.post('/analyze/user', makeResponse('사용자 감정 분석 결과'));
app.post('/summarize', makeResponse('감정 요약 결과'));
app.post('/awareness', makeResponse('자아 인식 결과'));
app.post('/backup', makeResponse('대화 백업'));

app.listen(PORT, () => {
  console.log(`충만이 서버 실행 중: http://localhost:${PORT}`);
});
