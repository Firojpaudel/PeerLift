import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

/**
 * Creates a Google Calendar event with a Google Meet link.
 * Note: This requires GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and a REFRESH_TOKEN.
 */
export async function createGoogleMeetLink(
  summary: string,
  startTime: Date,
  durationMinutes: number = 60
): Promise<string | null> {
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    // Assuming we have a stored refresh token for the user/system account
    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const endTime = new Date(startTime.getTime() + durationMinutes * 60000);

    const event = {
      summary: summary,
      description: 'Peer tutoring session scheduled via PeerLift',
      start: {
        dateTime: startTime.toISOString(),
        timeZone: 'UTC',
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: 'UTC',
      },
      conferenceData: {
        createRequest: {
          requestId: `peerlift-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
      conferenceDataVersion: 1,
    });

    return response.data.hangoutLink || null;
  } catch (error) {
    console.error('Error creating Google Meet link:', error);
    return null;
  }
}
