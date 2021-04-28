import React from 'react';
import styles from './Credit.module.css';
import Logo from './Logo';

const Credit: React.FC = () => (
  <footer className={styles.credit}>
    <Logo className={styles.logo} width={85} height={25.6} />
    <a
      className={styles.link}
      href="https://github.com/TinyKitten/D3JapanRailway"
    >
      Fork me on GitHub
    </a>
    <p className={styles.text}>
      A product of{' '}
      <a className={styles.link} href="https://tinykitten.me">
        TinyKitten
      </a>
    </p>
  </footer>
);

export default Credit;
