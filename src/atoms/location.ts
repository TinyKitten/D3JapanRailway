import { atom } from 'recoil';
import { LOCATION_STATE } from '../constants/state';

type State = {
  location: GeolocationPosition;
  error: GeolocationPositionError;
  followLocation: boolean;
};

const locationState = atom<State>({
  key: LOCATION_STATE,
  default: {
    location: null,
    error: null,
    followLocation: true,
  },
});

export default locationState;
