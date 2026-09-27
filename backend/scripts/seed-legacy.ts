import 'dotenv/config';

import { PrismaService } from '../src/prisma/prisma.service';
import { RutubeService } from '../src/rutube/rutube.service';
import { LEGACY_VIDEO_IDS } from '../src/videos/legacy-video-ids';
import { VideosService } from '../src/videos/videos.service';

const main = async (): Promise<void> => {
  const prisma = new PrismaService();
  const videos = new VideosService(prisma, new RutubeService());
  await prisma.$connect();
  try {
    for (const [externalId, id] of Object.entries(LEGACY_VIDEO_IDS)) {
      try {
        await videos.import(externalId);
        console.log(`Импортировано: ${id}`);
      } catch (error: unknown) {
        console.error(`Не удалось импортировать ${id}:`, error);
      }
    }
  } finally {
    await prisma.$disconnect();
  }
};

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
