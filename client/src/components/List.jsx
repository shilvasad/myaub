import React from 'react';
import './List.scss';

// props: title, items (array), type (string), onItemClick(item, type)
const List = ({ title, items = [], type = 'course', onItemClick, onBackClick }) => {
  return (
    <div className="list">
      {onBackClick && <button onClick={onBackClick} className="back-button">Back</button>}
      <h2>{title}</h2>
      <div className="list-items">
        {items.map((item, index) => (
          <div
            key={index}
            className="card"
            data-type={type}
            data-item={item}
            onClick={() => onItemClick && onItemClick(item, type)}
          >
            <h3>{item}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default List;