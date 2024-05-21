// import OpenAI from "openai";

// const openai = new OpenAI({
//     organization: "org-R6Bu8mxoYnIWCKXaAP0hOR5K",
//     project: "org-R6Bu8mxoYnIWCKXaAP0hOR5K",
// });

import fs from 'fs';
import path from 'path';
import { Configuration, OpenAIApi } from 'openai';
import MicrophoneStream from 'microphone-stream';
import dotenv from 'dotenv';
import hljs from 'highlight.js';

dotenv.config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

async function transcribeAudio(audioBuffer) {
  try {
    const response = await openai.createTranscription({
      audio: audioBuffer,
      model: 'whisper-1', // 使用するモデルのID
      prompt: '',
      max_tokens: 1000,
    });
    return response.data.text;
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    throw error;
  }
}

function startRecording() {
  const micStream = new MicrophoneStream();
  micStream.setStream(process.stdin);

  let audioChunks = [];

  micStream.on('data', (chunk) => {
    audioChunks.push(chunk);
  });

  micStream.on('end', async () => {
    const audioBuffer = Buffer.concat(audioChunks);
    fs.writeFileSync('audio.wav', audioBuffer);

    try {
      const transcription = await transcribeAudio(audioBuffer);
      console.log('Transcription:', transcription);
    } catch (error) {
      console.error('Failed to transcribe audio:', error);
    }
  });

  console.log('Recording... Press Ctrl+C to stop.');
}

startRecording();
