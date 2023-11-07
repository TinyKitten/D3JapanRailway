import LocationSearchingIcon from '@material-ui/icons/LocationSearching';
import React from 'react';
import { useRecoilState } from 'recoil';
import locationState from '../atoms/location';
import { Tool } from '../models';
import ToolButton from './ToolButton';
import styles from './Tools.module.css';

const ALL_TOOLS: Tool[] = [
  {
    id: 'location',
    icon: LocationSearchingIcon,
  },
];

const Tools: React.FC = () => {
  const [{ location, followLocation }, setLocationFromState] = useRecoilState(
    locationState
  );

  const getIsActive = (t: Tool) => {
    switch (t.id) {
      case 'location':
        return followLocation;
      default:
        return false;
    }
  };

  const handleOnClick = (t: Tool) => {
    switch (t.id) {
      case 'location':
        if (!location) {
          return;
        }
        setLocationFromState((prev) => ({
          ...prev,
          followLocation: true,
          centerCoordinates: [136.0, 35.6],
        }));
        break;
      default:
        break;
    }
  };

  return (
    <div className={styles.tools}>
      {ALL_TOOLS.map((t) => (
        <ToolButton
          active={getIsActive(t)}
          onClick={() => handleOnClick(t)}
          tool={t}
          key={t.id}
        />
      ))}
    </div>
  );
};

export default Tools;
