import { SetMetadata } from '@nestjs/common';

export type CacheApiInfo = {
  enableCache?: boolean;
  expire?: number;
  key?: string;
};

export const CacheApiKey = 'CacheApi';
export const CacheApi = (info?: CacheApiInfo) => {
  return SetMetadata(
    CacheApiKey,
    info ? info : { enableCache: true, expire: 60 },
  );
};
