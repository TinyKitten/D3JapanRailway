import { atom } from 'recoil';
import { RECOIL_STATES } from '../constants';
import { StationAPIClient } from '../gen/StationapiServiceClientPb';

export type CacheState = {
  grpcClient: StationAPIClient | null;
};

const cacheState = atom<CacheState>({
  key: RECOIL_STATES.CACHE_STATE,
  default: {
    grpcClient: null,
  },
});

export default cacheState;
