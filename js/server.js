const express = require('express');
const helmet = require('helmet');
const axios = require('axios');
const cors = require('cors'); // CORSをインポート
const app = express();
const port = 3000;

const OPENAI_API_KEY = 'sk-proj-iBRMOpFOzmFXZsOZfBVzT3BlbkFJ7dEnDCP1hBNMB4mZK9jc';

app.use(cors()); // CORSを有効化
app.use(express.json());

// helmetを使用してCSPを設定
app.use(helmet());

// 独自のCSPを設定
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    fontSrc: ["'self'", "http://localhost:3000"], // フォントのソースを許可
    // その他の必要な指令を追加
  }
}));

app.post('/api/openai', async (req, res) => {
  try {
    const response = await axios.post('https://api.openai.com/v1/engines/davinci-codex/completions', req.body, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
