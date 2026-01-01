import { Inngest } from 'inngest'

export const inngest = new Inngest({ 
  id: 'brightwire',
  eventKey: process.env.INNGEST_EVENT_KEY,
})
