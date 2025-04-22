
export const generateGoogleCalendarUrl = (event: {
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  venue?: {
    name: string;
    street?: string | null;
    city: string;
    state: string;
    postal_code?: string | null;
  };
}) => {
  const formatDate = (date: string) => {
    return new Date(date).toISOString().replace(/-|:|\.\d\d\d/g, '');
  };

  const location = event.venue ? 
    `${event.venue.street ? event.venue.street + ', ' : ''}${event.venue.city}, ${event.venue.state}${event.venue.postal_code ? ' ' + event.venue.postal_code : ''}`
    : '';

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${formatDate(event.start_time)}/${formatDate(event.end_time)}`,
    details: event.description || '',
    location: location,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

export const generateICalFile = (event: {
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  venue?: {
    name: string;
    street?: string | null;
    city: string;
    state: string;
    postal_code?: string | null;
  };
}) => {
  const formatDate = (date: string) => {
    return new Date(date).toISOString().replace(/-|:|\.\d\d\d/g, '').slice(0, -1);
  };

  const location = event.venue ? 
    `${event.venue.street ? event.venue.street + ', ' : ''}${event.venue.city}, ${event.venue.state}${event.venue.postal_code ? ' ' + event.venue.postal_code : ''}`
    : '';

  const content = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `DTSTART:${formatDate(event.start_time)}`,
    `DTEND:${formatDate(event.end_time)}`,
    `SUMMARY:${event.title}`,
    event.description ? `DESCRIPTION:${event.description}` : '',
    location ? `LOCATION:${location}` : '',
    'END:VEVENT',
    'END:VCALENDAR'
  ].filter(Boolean).join('\r\n');

  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${event.title}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
