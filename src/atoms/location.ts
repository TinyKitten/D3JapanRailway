import { atom } from 'recoil';
import { LOCATION_STATE } from '../constants/state';

type State = {
  location: GeolocationPosition;
  error: GeolocationPositionError;
  fetching: boolean;
};

const locationState = atom<State>({
  key: LOCATION_STATE,
  default: {
    location: null,
    error: null,
    fetching: false,
  },
});

export default locationState;
