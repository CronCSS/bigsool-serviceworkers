import React from 'react';
import './progressBar.css';

export interface Props {
  progress?: number;
}

const ProgressBar = ({ progress = 0 }: Props) => {
    return <div className="ProgressBar">
        <div className="Bar" style={{ width: `${ progress }%` }}></div>
    </div>
}

export default ProgressBar;
