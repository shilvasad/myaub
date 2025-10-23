import React from 'react';
import './Quiz.scss';

const Quiz = ({ title, questions = [], onSubmit, results, submitted }) => {
  if (submitted) {
    const score = results.filter(r => r.isCorrect).length;
    return (
      <div className="quiz-results">
        <h2>{title} - Results</h2>
        <p>You scored {score} out of {questions.length}!</p>
        {results.map((result, index) => (
          <div key={index} className={`result-question ${result.isCorrect ? 'correct' : 'incorrect'}`}>
            <p>{index + 1}. {result.question}</p>
            <p>Your answer: {result.selected || 'Not answered'}</p>
            {!result.isCorrect && <p>Correct answer: {result.correctAnswer}</p>}
          </div>
        ))}
      </div>
    );
  }

  return (
    <form id="quiz-form" className="quiz" onSubmit={onSubmit}>
      <h2>{title}</h2>
      {questions.map((q, index) => (
        <div key={index} className="quiz-question" data-correct-answer={q.correctAnswer}>
          <p className="quiz-question-text">{index + 1}. {q.question || q.text}</p>
          <div className="quiz-options">
            {(q.options || []).map((option, i) => (
              <label key={i} className="quiz-option">
                <input type="radio" name={`question-${index}`} value={option} />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
      <div className="quiz-submit">
        <button type="submit">Check Answers</button>
      </div>
    </form>
  );
};

export default Quiz;