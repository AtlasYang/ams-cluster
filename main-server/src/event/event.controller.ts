import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { EventService } from './event.service';
import { EventCreateDto, EventParticipation } from './event.interface';

@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Get('session/:session_id')
  async getEventsBySessionId(
    @Req() req: any,
    @Param('session_id') sessionId: number,
  ) {
    return this.eventService.getEventsBySessionId({
      userId: req.userId,
      sessionId,
    });
  }

  @Post()
  async createEvent(@Body() eventCreateDto: EventCreateDto) {
    return this.eventService.createEvent(eventCreateDto);
  }

  @Delete(':event_id')
  async deleteEvent(@Param('event_id') eventId: number) {
    return this.eventService.deleteEvent(eventId);
  }

  @Post('participation')
  async createEventParticipation(@Body() body: EventParticipation) {
    return this.eventService.createEventParticipation({
      eventId: body.event_id,
      memberId: body.member_id,
    });
  }

  @Delete('participation')
  async deleteEventParticipation(@Body() body: EventParticipation) {
    return this.eventService.deleteEventParticipation({
      eventId: body.event_id,
      memberId: body.member_id,
    });
  }
}
