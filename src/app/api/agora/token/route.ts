import { RtcTokenBuilder, RtcRole } from 'agora-token';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { channelName, uid } = await request.json();

  const appId = process.env.AGORA_APP_ID;
  const appCertificate = process.env.AGORA_APP_CERTIFICATE;

  if (!appId || !appCertificate) {
    return NextResponse.json({ error: 'Agora credentials not configured' }, { status: 500 });
  }

  if (!channelName || !uid) {
    return NextResponse.json({ error: 'channelName and uid are required' }, { status: 400 });
  }

  const role = RtcRole.PUBLISHER;
  const expirationTimeInSeconds = 3600; // 1 hour
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const tokenExpire = expirationTimeInSeconds;
  const privilegeExpire = expirationTimeInSeconds;

  // The uid must be a number for the token builder
  const numericUid = Number(uid);
  if (isNaN(numericUid)) {
    return NextResponse.json({ error: 'uid must be a number' }, { status: 400 });
  }

  const token = RtcTokenBuilder.buildTokenWithUid(
    appId,
    appCertificate,
    channelName,
    numericUid,
    role,
    tokenExpire,
    privilegeExpire
  );

  return NextResponse.json({ rtcToken: token });
}
