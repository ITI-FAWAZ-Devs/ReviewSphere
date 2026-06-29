import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/calendar'];

export class GoogleMeetService {
  /**
   * Builds an authenticated Google client.
   *
   * Two strategies are supported:
   *  1. OAuth2 refresh token (recommended) — works with a regular Google account.
   *     Requires GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET and GOOGLE_REFRESH_TOKEN.
   *  2. Service account with Domain-Wide Delegation — only works on a Google
   *     Workspace domain where the service account impersonates a real user.
   *     Requires GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY and GOOGLE_IMPERSONATE_SUBJECT.
   *
   * Note: a plain service account (no delegation) CANNOT create Google Meet
   * conferences or invite attendees, so that path is intentionally unsupported.
   */
  private static getAuthClient() {
    const clientId = process.env['GOOGLE_CLIENT_ID'];
    const clientSecret = process.env['GOOGLE_CLIENT_SECRET'];
    const refreshToken = process.env['GOOGLE_REFRESH_TOKEN'];

    if (clientId && clientSecret && refreshToken) {
      const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
      oauth2Client.setCredentials({ refresh_token: refreshToken });
      return oauth2Client;
    }

    const clientEmail = process.env['GOOGLE_CLIENT_EMAIL'];
    const privateKey = process.env['GOOGLE_PRIVATE_KEY']?.replace(/\\n/g, '\n');
    const subject = process.env['GOOGLE_IMPERSONATE_SUBJECT'];

    if (clientEmail && privateKey && subject) {
      return new google.auth.JWT({
        email: clientEmail,
        key: privateKey,
        scopes: SCOPES,
        subject,
      });
    }

    console.warn(
      'Google Meet credentials are not configured. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET and ' +
        'GOOGLE_REFRESH_TOKEN (recommended) — or GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY and ' +
        'GOOGLE_IMPERSONATE_SUBJECT for Workspace domain-wide delegation. Meet links will be skipped.'
    );
    return null;
  }

  public static async createMeeting(params: {
    sessionId: string;
    title: string;
    description: string;
    startsAt: Date;
    endsAt: Date;
    attendees: string[];
  }): Promise<string | null> {
    const auth = this.getAuthClient();
    if (!auth) {
      return null;
    }

    try {
      const calendar = google.calendar({ version: 'v3', auth });

      const response = await calendar.events.insert({
        calendarId: 'primary',
        conferenceDataVersion: 1,
        sendUpdates: 'all',
        requestBody: {
          summary: params.title,
          description: params.description,
          start: {
            dateTime: params.startsAt.toISOString(),
            timeZone: 'UTC',
          },
          end: {
            dateTime: params.endsAt.toISOString(),
            timeZone: 'UTC',
          },
          attendees: params.attendees.map((email) => ({ email })),
          conferenceData: {
            createRequest: {
              requestId: `reviewsphere-session-${params.sessionId}`,
              conferenceSolutionKey: {
                type: 'hangoutsMeet',
              },
            },
          },
        },
      });

      const entryPoint = response.data.conferenceData?.entryPoints?.find(
        (ep) => ep.entryPointType === 'video'
      );

      return entryPoint?.uri || response.data.hangoutLink || null;
    } catch (error) {
      const err = error as { response?: { data?: { error?: { message?: string } } }; message?: string };
      const detail = err?.response?.data?.error?.message ?? err?.message ?? 'unknown error';
      console.warn(`Error creating Google Meet conference: ${detail}`);
      return null;
    }
  }
}
