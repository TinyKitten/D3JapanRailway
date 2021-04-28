import styles from './LoadingOverlay.module.css';
import CircularProgress from '@material-ui/core/CircularProgress';

const LoadingOverlay: React.FC = () => {
  return (
    <div className={styles.overlay}>
      <CircularProgress size={80} />
    </div>
  );
};

export default LoadingOverlay;
