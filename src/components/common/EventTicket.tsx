import React from 'react';
import { EventCard, EventCardProps } from './EventCard';

export type EventTicketProps = EventCardProps;

export const EventTicket: React.FC<EventTicketProps> = (props) => {
  return <EventCard {...props} />;
};

export default EventTicket;

