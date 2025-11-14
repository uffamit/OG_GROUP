import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { agentId } = await request.json();

  const agoraAppId = process.env.AGORA_APP_ID;
  const customerId = process.env.AGORA_CUSTOMER_ID;
  const customerSecret = process.env.AGORA_CUSTOMER_SECRET;

  if (!agoraAppId || !customerId || !customerSecret) {
    return NextResponse.json({ error: 'Missing Agora credentials in environment variables.' }, { status: 500 });
  }

  if (!agentId) {
    return NextResponse.json({ error: 'agentId is required.' }, { status: 400 });
  }

  const credentials = Buffer.from(`${customerId}:${customerSecret}`).toString('base64');
  const url = `https://api.agora.io/api/conversational-ai-agent/v2/projects/${agoraAppId}/agents/${agentId}/leave`;

  const options = {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json'
    }
  };

  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Agora API Error:', errorBody);
      return NextResponse.json({ error: `Agora API request failed with status ${response.status}`, details: errorBody }, { status: response.status });
    }
    
    // The response for a successful leave is empty
    return NextResponse.json({});
  } catch (error) {
    console.error('Error stopping Agora agent:', error);
    return NextResponse.json({ error: 'Failed to stop Agora agent.', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
