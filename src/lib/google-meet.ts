import { google } from 'googleapis';
import prisma from './prisma';

/**
 * Creates a Google Calendar event with a Google Meet link.
 * Note: This requires GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and a REFRESH_TOKEN.
 */
function generateFallbackMeetLink(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const rand = (len: number) =>
    Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `https://meet.jit.si/peerlift-${rand(12)}`;
}

export async function createGoogleMeetLink(
  summary: string,
  startTime: Date,
  durationMinutes: number = 60,
  attendeeEmails: string[] = [],
  userId?: string
): Promise<string | null> {
  try {
    let refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

    // Check if the user has a personal Google account linked
    if (userId) {
      const googleAccount = await prisma.account.findFirst({
        where: { userId, provider: 'google' },
        select: { refresh_token: true },
      });
      if (googleAccount?.refresh_token) {
        refreshToken = googleAccount.refresh_token;
      }
    }

    // Graceful fallback if Google credentials are not set
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !refreshToken) {
      console.warn(
        'Google Calendar credentials not fully configured. Generating fallback Jitsi Meet link.'
      );
      return generateFallbackMeetLink();
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    // Assuming we have a stored refresh token for the user/system account
    oauth2Client.setCredentials({
      refresh_token: refreshToken,
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
      attendees: attendeeEmails.length > 0 ? attendeeEmails.map((email) => ({ email })) : undefined,
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
      conferenceDataVersion: 1,
      sendUpdates: 'all', // Notify attendees via email and automatically populate their calendars
    });

    return response.data.hangoutLink || generateFallbackMeetLink();
  } catch (error) {
    console.error('Error creating Google Meet link, falling back to Jitsi Meet link:', error);
    return generateFallbackMeetLink();
  }
}
