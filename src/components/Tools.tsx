import React from 'react';
import styles from './Tools.module.css';
import LocationSearchingIcon from '@material-ui/icons/LocationSearching';
import ToolButton from './ToolButton';
import Tool from '../models/Tool';
import locationState from '../atoms/location';
import { useRecoilState } from 'recoil';

const ALL_TOOLS: Tool[] = [
  {
    id: 'location',
    icon: LocationSearchingIcon,
  },
];

const Tools: React.FC = () => {
  const [locationFromState, setLocationFromState] = useRecoilState(
    locationState
  );

  const handleOnClick = (t: Tool) => {
    switch (t.id) {
      case 'location':
        setLocationFromState((prev) => ({ ...prev, fetching: true })),
          navigator.geolocation.getCurrentPosition(
            (location) =>
              setLocationFromState((prev) => ({
                ...prev,
                location,
                fetching: false,
              })),
            (err) => setLocationFromState((prev) => ({ ...prev, error: err }))
          );
        break;
      default:
        break;
    }
  };

  const getIsDisabled = (t: Tool) => {
    switch (t.id) {
      case 'location':
        if (locationFromState.fetching) {
          return true;
        }
        return false;
      default:
        return false;
    }
  };

  return (
    <div className={styles.tools}>
      {ALL_TOOLS.map((t) => (
        <ToolButton
          disabled={getIsDisabled(t)}
          onClick={() => handleOnClick(t)}
          tool={t}
          key={t.id}
        />
      ))}
    </div>
  );
};

export default Tools;
