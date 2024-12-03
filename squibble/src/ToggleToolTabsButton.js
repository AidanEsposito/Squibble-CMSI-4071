import React from 'react';
import './ToggleToolTabsButton.css';

const ToggleToolTabsButton = ({ onToggleToolTabs }) => {
  return (
    <div className="toggle-tool-tabs-button" onClick={onToggleToolTabs}>
      ←
    </div>
  );
};

export default ToggleToolTabsButton;
