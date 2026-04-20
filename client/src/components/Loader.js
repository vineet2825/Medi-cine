import React from 'react';
import './Loader.css';

const Loader = ({ fullPage = false }) => {
    return (
        <div className={`loader-container ${fullPage ? 'full-page' : ''}`}>
            <div className="premium-spinner">
                <div className="inner-ring"></div>
                <div className="glow-effect"></div>
                <div className="medicine-icon">💊</div>
            </div>
            <p className="loading-text">Loading Excellence...</p>
        </div>
    );
};

export default Loader;
