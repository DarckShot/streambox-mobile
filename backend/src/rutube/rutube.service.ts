import {
  BadGatewayException,
  BadRequestException,
  GatewayTimeoutException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';

type JsonObject = Record<string, unknown>;

export interface RutubeMetadata {
  externalId: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  duration: number;
  category: string | null;
  author: string | null;
  sourceUrl: string;
}

export interface RutubeThumbnail {
  bytes: Buffer;
  contentType: string;
}

const VIDEO_ID = /^[a-f0-9]{32}$/i;
const asObject = (value: unknown): JsonObject | null =>
  value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as JsonObject)
    : null;
const text = (value: unknown): string | null =>
  typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
const safeUrl = (value: unknown): string | null => {
  const candidate = text(value);
  if (!candidate) return null;
  try {
    return new URL(candidate).protocol === 'https:' ? candidate : null;
  } catch {
    return null;
  }
};

@Injectable()
export class RutubeService {
  extractExternalId(input: string): string {
    const value = input.trim();
    if (VIDEO_ID.test(value)) return value.toLowerCase();
    let url: URL;
    try {
      url = new URL(value);
    } catch {
      throw new BadRequestException('Укажите ссылку RUTUBE или ID видео.');
    }
    if (
      !['https:', 'http:'].includes(url.protocol) ||
      !['rutube.ru', 'www.rutube.ru'].includes(url.hostname.toLowerCase())
    ) {
      throw new BadRequestException('Поддерживаются только ссылки rutube.ru.');
    }
    const match = /^\/video\/([a-f0-9]{32})\/?$/i.exec(url.pathname);
    if (!match) throw new BadRequestException('Некорректная ссылка на видео RUTUBE.');
    return match[1].toLowerCase();
  }

  async getMetadata(externalId: string): Promise<RutubeMetadata> {
    const data = await this.request(`https://rutube.ru/api/video/${externalId}/`);
    if (data.is_deleted === true) throw new NotFoundException('Видео удалено с RUTUBE.');
    const title = text(data.title);
    if (!title || data.id !== externalId) {
      throw new BadGatewayException('RUTUBE вернул некорректные метаданные.');
    }
    const category = asObject(data.category);
    const author = asObject(data.author);
    return {
      externalId,
      title,
      description: text(data.description),
      thumbnailUrl: safeUrl(data.thumbnail_url),
      duration:
        typeof data.duration === 'number' && Number.isFinite(data.duration) && data.duration > 0
          ? Math.round(data.duration)
          : 0,
      category: text(category?.name),
      author: text(author?.name),
      sourceUrl: `https://rutube.ru/video/${externalId}/`,
    };
  }

  async getPlaybackUrl(externalId: string): Promise<string> {
    const data = await this.request(`https://rutube.ru/api/play/options/${externalId}`);
    const access = asObject(data.acl_access);
    if (access?.allowed !== true) {
      throw new ServiceUnavailableException(
        text(access?.err_text) ?? 'Видео сейчас недоступно для воспроизведения.',
      );
    }
    const balancer = asObject(data.video_balancer);
    const url = safeUrl(balancer?.m3u8) ?? safeUrl(balancer?.default);
    if (!url) throw new ServiceUnavailableException('RUTUBE не вернул ссылку на видеопоток.');
    return url;
  }

  async getThumbnail(url: string): Promise<RutubeThumbnail> {
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      throw new NotFoundException('Обложка видео недоступна.');
    }
    if (parsed.protocol !== 'https:' || parsed.hostname !== 'pic.rtbcdn.ru') {
      throw new NotFoundException('Обложка видео недоступна.');
    }
    const controller = new AbortController();
    const configuredTimeout = Number(process.env.RUTUBE_TIMEOUT_MS ?? 8000);
    const timer = setTimeout(
      () => controller.abort(),
      Number.isFinite(configuredTimeout) && configuredTimeout > 0 ? configuredTimeout : 8000,
    );
    try {
      const response = await fetch(parsed, { signal: controller.signal, redirect: 'error' });
      if (!response.ok) throw new ServiceUnavailableException('Обложка RUTUBE недоступна.');
      const contentType = response.headers.get('content-type')?.split(';')[0];
      if (!contentType || !['image/jpeg', 'image/png', 'image/webp'].includes(contentType)) {
        throw new BadGatewayException('RUTUBE вернул неверный формат обложки.');
      }
      const length = Number(response.headers.get('content-length'));
      if (Number.isFinite(length) && length > 5_000_000) {
        throw new BadGatewayException('Обложка RUTUBE слишком большая.');
      }
      const bytes = Buffer.from(await response.arrayBuffer());
      if (bytes.length > 5_000_000) throw new BadGatewayException('Обложка RUTUBE слишком большая.');
      return { bytes, contentType };
    } catch (error: unknown) {
      if (error instanceof BadGatewayException || error instanceof ServiceUnavailableException) throw error;
      if (error instanceof Error && error.name === 'AbortError') {
        throw new GatewayTimeoutException('Время ожидания обложки RUTUBE истекло.');
      }
      throw new ServiceUnavailableException('Нет соединения с RUTUBE.');
    } finally {
      clearTimeout(timer);
    }
  }

  private async request(url: string): Promise<JsonObject> {
    const timeout = Number(process.env.RUTUBE_TIMEOUT_MS ?? 8000);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), Number.isFinite(timeout) && timeout > 0 ? timeout : 8000);
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });
      if (response.status === 404 || response.status === 410) {
        throw new NotFoundException('Видео не найдено на RUTUBE.');
      }
      if (!response.ok) throw new ServiceUnavailableException(`RUTUBE временно недоступен (${response.status}).`);
      const payload: unknown = await response.json();
      const data = asObject(payload);
      if (!data) throw new BadGatewayException('RUTUBE вернул некорректный ответ.');
      return data;
    } catch (error: unknown) {
      if (error instanceof NotFoundException || error instanceof ServiceUnavailableException || error instanceof BadGatewayException) throw error;
      if (error instanceof Error && error.name === 'AbortError') {
        throw new GatewayTimeoutException('Время ожидания RUTUBE истекло.');
      }
      if (error instanceof SyntaxError) throw new BadGatewayException('RUTUBE вернул некорректный JSON.');
      throw new ServiceUnavailableException('Нет соединения с RUTUBE.');
    } finally {
      clearTimeout(timer);
    }
  }
}
