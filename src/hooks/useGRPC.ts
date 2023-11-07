import { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import cacheState from '../atoms/cache';
import { StationAPIClient } from '../gen/StationapiServiceClientPb';

const useGRPC = (): StationAPIClient | null => {
  const [{ grpcClient }, setCacheState] = useRecoilState(cacheState);

  useEffect(() => {
    if (grpcClient) {
      return null;
    }

    const client = new StationAPIClient(process.env.REACT_APP_SAPI_URL);
    setCacheState((prev) => ({
      ...prev,
      grpcClient: client,
    }));
  }, [grpcClient, setCacheState]);

  return grpcClient;
};

export default useGRPC;
