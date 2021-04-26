import styles from './LoadingOverlay.module.css';
import LoadingSpinner from './LoadingSpinner';

const LoadingOverlay: React.FC = () => {
  return (
    <div className={styles.overlay}>
      <LoadingSpinner />
    </div>
  );
};

export default LoadingOverlay;
