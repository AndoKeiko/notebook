
async function sendToChatGPT() {
  const inputText = document.getElementById('inputText').value;
  const responseContainer = document.getElementById('responseText');

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-proj-iBRMOpFOzmFXZsOZfBVzT3BlbkFJ7dEnDCP1hBNMB4mZK9jc'
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: inputText }]
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    responseContainer.textContent = data.choices[0].message.content;
  } catch (error) {
    console.error('Failed to fetch from OpenAI:', error);
    responseContainer.textContent = 'エラーが発生しました。';
  }
}