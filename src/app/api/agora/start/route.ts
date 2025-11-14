import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { channelName, rtcToken } = await request.json();

  const agoraAppId = process.env.AGORA_APP_ID;
  const customerId = process.env.AGORA_CUSTOMER_ID;
  const customerSecret = process.env.AGORA_CUSTOMER_SECRET;
  const openaiApiKey = process.env.OPENAI_API_KEY;
  const ttsApiKey = process.env.AZURE_TTS_API_KEY;

  if (!agoraAppId || !customerId || !customerSecret || !openaiApiKey || !ttsApiKey) {
    return NextResponse.json({ error: 'Missing Agora or AI service credentials in environment variables.' }, { status: 500 });
  }

  const credentials = Buffer.from(`${customerId}:${customerSecret}`).toString('base64');
  const url = `https://api.agora.io/api/conversational-ai-agent/v2/projects/${agoraAppId}/join`;

  const headers = {
    "Authorization": `Basic ${credentials}`,
    "Content-Type": "application/json"
  };

  const data = {
    "name": `agent_${channelName}_${Date.now()}`,
    "properties": {
      "channel": channelName,
      "token": rtcToken,
      "agent_rtc_uid": "0",
      "remote_rtc_uids": ["*"],
      "enable_string_uid": false,
      "idle_timeout": 120,
      "llm": {
        "url": "https://api.openai.com/v1/chat/completions",
        "api_key": openaiApiKey,
        "system_messages": [
          {
            "role": "system",
            "content": "You are a helpful medical assistant. You are not a doctor and should not provide medical advice. You can provide information and suggestions based on user's symptoms."
          }
        ],
        "greeting_message": "Hello, I am your personal medical assistant. How are you feeling today?",
        "failure_message": "Sorry, I am having trouble understanding. Could you please repeat that?",
        "max_history": 10,
        "params": {
          "model": "gpt-4o-mini"
        }
      },
      "asr": {
        "language": "en-US"
      },
      "tts": {
        "vendor": "microsoft",
        "params": {
            "key": ttsApiKey,
            "region": "eastus",
            "voice_name": "en-US-AndrewMultilingualNeural"
        }
      }
    }
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Agora API Error:', errorBody);
      return NextResponse.json({ error: `Agora API request failed with status ${response.status}`, details: errorBody }, { status: response.status });
    }

    const responseData = await response.json();
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error starting Agora agent:', error);
    return NextResponse.json({ error: 'Failed to start Agora agent.', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
