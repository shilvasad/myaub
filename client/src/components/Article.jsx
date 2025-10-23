import React from 'react';
import './Article.scss';
import { markdownToHtml } from '../utils';

const Article = ({ title, content, onGenerateQuiz, onBackClick }) => {
  const htmlContent = markdownToHtml(content);
  return (
    <div className="article-card">
      {onBackClick && <button onClick={onBackClick} className="back-button">Back</button>}
      <article>
        <h1>{title}</h1>
        <div className="content" dangerouslySetInnerHTML={{ __html: htmlContent }} />
      </article>
      <div className="article-actions">
        <button id="generate-quiz-btn" onClick={onGenerateQuiz}>Test My Knowledge</button>
      </div>
    </div>
  );
};

export default Article;