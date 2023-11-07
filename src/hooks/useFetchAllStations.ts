import { useCallback, useEffect, useState } from 'react';
import { Station, VoidMessage } from '../gen/stationapi_pb';
import useGRPC from './useGRPC';

export const useFetchAllStations = (): {
  stations: Station.AsObject[];
  loading: boolean;
  error: Error | null;
} => {
  const [stations, setStations] = useState<Station.AsObject[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();

  const client = useGRPC();

  const getStations = useCallback(async () => {
    try {
      setLoading(true);
      const req = new VoidMessage();
      const res = await client?.getAllStations(req, {});
      setLoading(false);

      return res?.getStationsList().map((station) => station.toObject());
    } catch (err) {
      console.error(err);
      setError(err);
      return [];
    }
  }, [client]);

  useEffect(() => {
    const fetchStationsAsync = async () => {
      setStations((await getStations()) ?? []);
    };
    fetchStationsAsync();
  }, [getStations]);

  return { stations, loading, error };
};
