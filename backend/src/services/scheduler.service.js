const { google } = require('googleapis');
const { OAuth2 } = google.auth;

class SchedulerService {
  constructor() {
    this.oauth2Client = new OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
  }

  // Set credentials for a user
  setCredentials(tokens) {
    this.oauth2Client.setCredentials(tokens);
  }

  // Check availability in Google Calendar
  async checkAvailability(startTime, endTime, calendarId = 'primary') {
    try {
      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
      
      const response = await calendar.freebusy.query({
        requestBody: {
          timeMin: startTime.toISOString(),
          timeMax: endTime.toISOString(),
          items: [{ id: calendarId }]
        }
      });

      const busySlots = response.data.calendars[calendarId].busy;
      return busySlots.length === 0; // True if available
    } catch (error) {
      console.error('Error checking availability:', error);
      throw error;
    }
  }

  // Find available slots
  async findAvailableSlots(date, duration = 60, calendarId = 'primary') {
    try {
      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
      
      const startOfDay = new Date(date);
      startOfDay.setHours(9, 0, 0, 0); // 9 AM
      
      const endOfDay = new Date(date);
      endOfDay.setHours(18, 0, 0, 0); // 6 PM
      
      const response = await calendar.freebusy.query({
        requestBody: {
          timeMin: startOfDay.toISOString(),
          timeMax: endOfDay.toISOString(),
          items: [{ id: calendarId }]
        }
      });

      const busySlots = response.data.calendars[calendarId].busy;
      const availableSlots = [];
      
      let currentTime = new Date(startOfDay);
      
      while (currentTime < endOfDay) {
        const slotEnd = new Date(currentTime.getTime() + duration * 60000);
        
        const isConflict = busySlots.some(busy => {
          const busyStart = new Date(busy.start);
          const busyEnd = new Date(busy.end);
          return (currentTime < busyEnd && slotEnd > busyStart);
        });
        
        if (!isConflict && slotEnd <= endOfDay) {
          availableSlots.push({
            start: new Date(currentTime),
            end: new Date(slotEnd)
          });
        }
        
        currentTime = new Date(currentTime.getTime() + 30 * 60000); // 30-minute intervals
      }
      
      return availableSlots;
    } catch (error) {
      console.error('Error finding available slots:', error);
      throw error;
    }
  }

  // Create calendar event
  async createCalendarEvent(eventData) {
    try {
      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
      
      const event = {
        summary: eventData.title || 'Interview',
        description: eventData.description || '',
        start: {
          dateTime: eventData.startTime.toISOString(),
          timeZone: 'UTC'
        },
        end: {
          dateTime: eventData.endTime.toISOString(),
          timeZone: 'UTC'
        },
        attendees: eventData.attendees || [],
        conferenceData: eventData.meetingLink ? {
          createRequest: {
            requestId: `interview-${Date.now()}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' }
          }
        } : undefined,
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 1 day before
            { method: 'popup', minutes: 30 }        // 30 minutes before
          ]
        }
      };

      const response = await calendar.events.insert({
        calendarId: 'primary',
        resource: event,
        conferenceDataVersion: 1,
        sendUpdates: 'all'
      });

      return {
        eventId: response.data.id,
        meetingLink: response.data.hangoutLink || response.data.conferenceData?.entryPoints?.[0]?.uri,
        htmlLink: response.data.htmlLink
      };
    } catch (error) {
      console.error('Error creating calendar event:', error);
      throw error;
    }
  }

  // Update calendar event
  async updateCalendarEvent(eventId, updates) {
    try {
      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
      
      const event = await calendar.events.get({
        calendarId: 'primary',
        eventId: eventId
      });

      const updatedEvent = {
        ...event.data,
        ...updates
      };

      const response = await calendar.events.update({
        calendarId: 'primary',
        eventId: eventId,
        resource: updatedEvent,
        sendUpdates: 'all'
      });

      return response.data;
    } catch (error) {
      console.error('Error updating calendar event:', error);
      throw error;
    }
  }

  // Delete calendar event
  async deleteCalendarEvent(eventId) {
    try {
      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
      
      await calendar.events.delete({
        calendarId: 'primary',
        eventId: eventId,
        sendUpdates: 'all'
      });

      return true;
    } catch (error) {
      console.error('Error deleting calendar event:', error);
      throw error;
    }
  }

  // Generate Zoom meeting link (placeholder - requires Zoom SDK)
  async generateZoomLink(topic, startTime, duration = 60) {
    // This is a placeholder. Implement Zoom API integration here
    return {
      meetingLink: `https://zoom.us/j/mock-meeting-${Date.now()}`,
      meetingId: `mock-${Date.now()}`,
      password: 'mock123'
    };
  }

  // Generate Google Meet link (via Calendar API)
  async generateMeetLink(title, startTime, endTime, attendees = []) {
    const event = await this.createCalendarEvent({
      title,
      startTime,
      endTime,
      attendees,
      meetingLink: true
    });

    return event.meetingLink;
  }
}

module.exports = new SchedulerService();
