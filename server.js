import express from 'express';
import bodyParser from 'body-parser';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 3000;

app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.static('public'));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post('/process-image', async (req, res) => {
  const { description } = req.body;

  if (!description) {
    res.status(400).json({ error: 'No description provided' });
    return;
  }

  try {
    const prompt = `
      Generate HTML and CSS code for an image with the following description:
      ${description}
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that generates HTML and CSS."
        },
        { role: "user", content: prompt }
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
