import React from 'react';
import Tool from '../models/Tool';
import CircularProgress from '@material-ui/core/CircularProgress';
import styles from './ToolButton.module.css';

type Props = {
  tool: Tool;
  disabled?: boolean;
  onClick: () => void;
};

const ToolButton: React.FC<Props> = ({ tool, onClick, disabled }: Props) => (
  <button disabled={disabled} className={styles.button} onClick={onClick}>
    {disabled ? <CircularProgress size={24} /> : <tool.icon color="primary" />}
  </button>
);

export default ToolButton;
