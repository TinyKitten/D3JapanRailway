import styles from './ErrorOverlay.module.css';

const ErrorOverlay: React.FC = () => {
  return (
    <div className={styles.overlay}>
      <h1 className={styles.text}>AN ERROR OCCURED 😩</h1>
    </div>
  );
};

export default ErrorOverlay;
