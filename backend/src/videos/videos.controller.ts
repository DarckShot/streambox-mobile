import { Body, Controller, Get, Header, HttpCode, Param, Post, Query, StreamableFile } from '@nestjs/common';

import { ImportVideoDto } from './dto/import-video.dto';
import { ListVideosDto } from './dto/list-videos.dto';
import { VideoResponse, VideosService } from './videos.service';

@Controller('videos')
export class VideosController {
  constructor(private readonly videos: VideosService) {}

  @Get()
  list(@Query() query: ListVideosDto): Promise<VideoResponse[]> {
    return this.videos.list(query.search);
  }

  @Get(':id')
  get(@Param('id') id: string): Promise<VideoResponse> {
    return this.videos.get(id);
  }

  @Post('import')
  @HttpCode(200)
  import(@Body() body: ImportVideoDto): Promise<VideoResponse> {
    return this.videos.import(body.input);
  }

  @Post(':id/sync')
  @HttpCode(200)
  sync(@Param('id') id: string): Promise<VideoResponse> {
    return this.videos.sync(id);
  }

  @Get(':id/playback')
  @Header('Cache-Control', 'no-store')
  playback(@Param('id') id: string): Promise<{ url: string }> {
    return this.videos.playback(id);
  }

  @Get(':id/thumbnail')
  @Header('Cache-Control', 'public, max-age=3600')
  async thumbnail(@Param('id') id: string): Promise<StreamableFile> {
    const image = await this.videos.thumbnail(id);
    return new StreamableFile(image.bytes, { type: image.contentType });
  }
}
