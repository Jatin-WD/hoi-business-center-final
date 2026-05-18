export async function sendOtpSms(phone, code) {
  if (process.env.FAST2SMS_API_KEY) {
    const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        authorization: process.env.FAST2SMS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        route: 'otp',
        variables_values: code,
        numbers: String(phone).replace(/\D/g, '').slice(-10),
      }),
    });
    if (!response.ok) throw new Error(`Fast2SMS failed with status ${response.status}`);
    return { sent: true, provider: 'fast2sms' };
  }

  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM_NUMBER) {
    const auth = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64');
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: process.env.TWILIO_FROM_NUMBER,
        To: phone.startsWith('+') ? phone : `+91${String(phone).replace(/\D/g, '').slice(-10)}`,
        Body: `Your HOI Business Center OTP is ${code}. It is valid for 10 minutes.`,
      }),
    });
    if (!response.ok) throw new Error(`Twilio failed with status ${response.status}`);
    return { sent: true, provider: 'twilio' };
  }

  return { sent: false, provider: 'not-configured' };
}
