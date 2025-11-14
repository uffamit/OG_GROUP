import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { agentId } = await request.json();

  const agoraAppId = process.env.NEXT_PUBLIC_AGORA_APP_ID;
  const customerId = process.env.AGORA_CUSTOMER_ID;
  const customerSecret = process.env.AGORA_CUSTOMER_SECRET;

  if (!agoraAppId || !customerId || !customerSecret) {
    return NextResponse.json({ error: 'Missing Agora credentials in environment variables.' }, { status: 500 });
  }

  if (!agentId) {
    return NextResponse.json({ error: 'agentId is required.' }, { status: 400 });
  }

  const credentials = Buffer.from(`${customerId}:${customerSecret}`).toString('base64');
  
  try {
    // First, try to fetch the transcript before stopping the agent
    const transcriptUrl = `https://api.agora.io/api/conversational-ai-agent/v2/projects/${agoraAppId}/agents/${agentId}/transcript`;
    let transcript = '';

    try {
      const transcriptResponse = await fetch(transcriptUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json'
        }
      });

      if (transcriptResponse.ok) {
        const transcriptData = await transcriptResponse.json();
        // Extract transcript text from the response
        // The actual format may vary based on Agora's API response
        transcript = transcriptData.transcript || JSON.stringify(transcriptData);
      }
    } catch (transcriptError) {
      console.warn('Failed to fetch transcript:', transcriptError);
      // Continue with stopping the agent even if transcript fetch fails
    }

    // Stop the agent
    const stopUrl = `https://api.agora.io/api/conversational-ai-agent/v2/projects/${agoraAppId}/agents/${agentId}/leave`;
    const stopOptions = {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json'
      }
    };

    const response = await fetch(stopUrl, stopOptions);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Agora API Error:', errorBody);
      return NextResponse.json({ 
        error: `Agora API request failed with status ${response.status}`, 
        details: errorBody 
      }, { status: response.status });
    }
    
    // Return success with transcript if available
    return NextResponse.json({ transcript: transcript || null });
  } catch (error) {
    console.error('Error stopping Agora agent:', error);
    return NextResponse.json({ 
      error: 'Failed to stop Agora agent.', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
