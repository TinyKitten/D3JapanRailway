import React from 'react';
import styles from './Credit.module.css';
import Logo from './Logo';

const Credit: React.FC = () => (
  <footer className={styles.credit}>
    <Logo className={styles.logo} width={170} height={51.2} />
    <a
      className={styles.link}
      href="https://github.com/TinyKitten/D3JapanRailway"
    >
      Fork me on GitHub
    </a>
    <p className={styles.text}>
      A product of{' '}
      <a
        className={styles.link}
        href="https://github.com/TinyKitten/D3JapanRailway"
      >
        TinyKitten
      </a>
    </p>
  </footer>
);

export default Credit;
