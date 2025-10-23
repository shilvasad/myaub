import React, { useState } from 'react';
import './Aspiration.scss';

const Aspiration = ({ onSubmit }) => {
  const [aspiration, setAspiration] = useState('');

  const handleSubmit = () => {
    if (aspiration.trim()) {
      onSubmit(aspiration);
    } else {
      alert('Please enter what you want to become.');
    }
  };

  return (
    <div className="aspiration">
      <h2>What do you want to become?</h2>
      <p>Enter a career, skill, or topic you want to master.</p>
      <div className="input-group">
        <input
          type="text"
          value={aspiration}
          onChange={(e) => setAspiration(e.target.value)}
          placeholder="e.g., Full-Stack Web Developer"
        />
        <button onClick={handleSubmit}>Start Learning Path</button>
      </div>
    </div>
  );
};

export default Aspiration;