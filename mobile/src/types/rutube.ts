interface RutubeAccess {
  allowed: boolean;
  err_text: string | null;
}

interface RutubeVideoBalancer {
  default?: string;
  m3u8?: string;
}

export interface RutubePlayOptionsResponse {
  acl_access: RutubeAccess;
  video_balancer?: RutubeVideoBalancer | null;
}
