import React from 'react';
import './Breadcrumbs.scss';

const Breadcrumbs = ({ history, onBreadcrumbClick }) => {
  if (!history || history.length === 0) {
    return null;
  }

  return (
    <nav aria-label="breadcrumb" className="breadcrumbs mb-4">
      <ol className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
        <li>
          <a href="#" onClick={(e) => { e.preventDefault(); onBreadcrumbClick(-1); }} className="hover:underline text-blue-600">
            Home
          </a>
        </li>
        {history.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            <span className="text-gray-400">/</span>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); onBreadcrumbClick(index); }}
              className="hover:underline text-blue-600"
              aria-current={index === history.length - 1 ? 'page' : undefined}
            >
              {item.value.length > 30 ? `${item.value.substring(0, 27)}...` : item.value}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;