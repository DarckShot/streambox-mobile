import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';

import { AccessGuard } from '../auth/access.guard';
import type { AuthRequest } from '../auth/auth.types';
import { HistoryDto } from './dto/history.dto';
import { ProgressDto } from './dto/progress.dto';
import { MeService } from './me.service';

@Controller('me')
@UseGuards(AccessGuard)
export class MeController {
  constructor(private readonly me: MeService) {}

  @Get('favorites') favorites(@Req() request: AuthRequest) {
    return this.me.favorites(request.auth.userId);
  }
  @Post('favorites/:videoId') @HttpCode(200) addFavorite(
    @Req() request: AuthRequest,
    @Param('videoId') videoId: string,
  ) {
    return this.me.addFavorite(request.auth.userId, videoId);
  }
  @Delete('favorites/:videoId') @HttpCode(204) removeFavorite(
    @Req() request: AuthRequest,
    @Param('videoId') videoId: string,
  ) {
    return this.me.removeFavorite(request.auth.userId, videoId);
  }
  @Delete('favorites') @HttpCode(204) clearFavorites(@Req() request: AuthRequest) {
    return this.me.clearFavorites(request.auth.userId);
  }

  @Get('history') history(@Req() request: AuthRequest) {
    return this.me.history(request.auth.userId);
  }
  @Put('history/:videoId') recordWatch(
    @Req() request: AuthRequest,
    @Param('videoId') videoId: string,
    @Body() body: HistoryDto,
  ) {
    return this.me.recordWatch(request.auth.userId, videoId, body);
  }
  @Delete('history/:videoId') @HttpCode(204) removeHistory(
    @Req() request: AuthRequest,
    @Param('videoId') videoId: string,
  ) {
    return this.me.removeHistory(request.auth.userId, videoId);
  }
  @Delete('history') @HttpCode(204) clearHistory(@Req() request: AuthRequest) {
    return this.me.clearHistory(request.auth.userId);
  }

  @Get('progress') progress(@Req() request: AuthRequest) {
    return this.me.progress(request.auth.userId);
  }
  @Get('progress/:videoId') progressForVideo(
    @Req() request: AuthRequest,
    @Param('videoId') videoId: string,
  ) {
    return this.me.progressForVideo(request.auth.userId, videoId);
  }
  @Put('progress/:videoId') saveProgress(
    @Req() request: AuthRequest,
    @Param('videoId') videoId: string,
    @Body() body: ProgressDto,
  ) {
    return this.me.saveProgress(request.auth.userId, videoId, body);
  }
  @Delete('progress/:videoId') @HttpCode(204) removeProgress(
    @Req() request: AuthRequest,
    @Param('videoId') videoId: string,
  ) {
    return this.me.removeProgress(request.auth.userId, videoId);
  }
  @Delete('progress') @HttpCode(204) clearProgress(@Req() request: AuthRequest) {
    return this.me.clearProgress(request.auth.userId);
  }
}
