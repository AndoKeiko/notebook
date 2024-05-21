// import express from 'express';
// import bodyParser from 'body-parser';
// import OpenAI from 'openai';
// import dotenv from 'dotenv';

// dotenv.config();

// const app = express();
// const port = 3000;

// app.use(bodyParser.json({ limit: '10mb' }));
// app.use(express.static('public'));

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY
// });

// app.post('/process-image', async (req, res) => {
//   const { image } = req.body;

//   if (!image) {
//     res.status(400).json({ error: 'No image data provided' });
//     return;
//   }

//   try {
//     const completion = await openai.chat.completions.create({
//       model: "gpt-3.5-turbo",
//       messages: [
//         {
//           role: "system",
//           content: "Generate HTML and CSS code for the following image data."
//         },
//         { role: "user", content: image }
//       ]
//     });

//     const htmlCss = completion.choices[0].message.content.trim();
//     res.json({ html_css: htmlCss });
//   } catch (error) {
//     console.error("Error generating HTML and CSS:", error);
//     res.status(500).json({ error: error.message });
//   }
// });

// app.listen(port, () => {
//   console.log(`Server running at http://localhost:${port}`);
// });
import express from 'express';
import bodyParser from 'body-parser';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 3000;

// 静的ファイルの配信
app.use(express.static('public'));

// JSONリクエストのパース
app.use(bodyParser.json({ limit: '10mb' }));

// OpenAI APIの設定
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// 画像を処理してHTMLとCSSを生成するエンドポイント
app.post('/process-image', async (req, res) => {
  const { image } = req.body;

  if (!image) {
      res.status(400).json({ error: 'No image data provided' });
      return;
  }

  // 画像データのサイズをチェック
  const imageSize = Buffer.byteLength(image, 'utf8');
  const maxSize = 50000; // 例として10KBに制限

  if (imageSize > maxSize) {
      res.status(400).json({ error: 'Image data is too large' });
      return;
  }

  try {
      const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
              {
                  role: "system",
                  content: "Generate HTML and CSS code for the following image data."
              },
              { role: "user", content: image }
          ]
      });

      const htmlCss = completion.choices[0].message.content.trim();
      res.json({ html_css: htmlCss });
  } catch (error) {
      console.error("Error generating HTML and CSS:", error);
      res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
