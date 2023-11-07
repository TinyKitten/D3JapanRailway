import { atom } from 'recoil';
import { RECOIL_STATES } from '../constants';

type State = {
  location: GeolocationPosition;
  error: GeolocationPositionError;
  followLocation: boolean;
};

const locationState = atom<State>({
  key: RECOIL_STATES.LOCATION_STATE,
  default: {
    location: null,
    error: null,
    followLocation: true,
  },
});

export default locationState;
