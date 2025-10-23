import React, { useState } from 'react';
import './App.scss';
import Aspiration from './components/Aspiration';
import List from './components/List';
import Article from './components/Article';
import Quiz from './components/Quiz';
import Footer from './components/Footer';
import Breadcrumbs from './components/Breadcrumbs';

// Updated Gemini API settings
import { callGeminiAPI } from './api';

function App() {
  const [state, setState] = useState({
    currentStep: 'aspiration',
    aspiration: '',
    course: '',
    book: '',
    chapter: '',
    lesson: '',
    articleContent: '',
    quizData: [],
    quizResults: [],
    quizSubmitted: false,
    listTitle: '',
    listItems: [],
    listType: 'course',
    history: [],
    loading: false,
    error: null,
    lastPrompt: null,
    lastSchema: null,
  });

  const handleAspirationSubmit = async (aspiration) => {
    if (!aspiration || !aspiration.trim()) {
      alert('Please enter what you want to become.');
      return;
    }

    const cleanAsp = aspiration.trim();
    setState(s => ({ ...s, aspiration: cleanAsp, currentStep: 'course', history: [], listTitle: '', listItems: [], listType: 'course' }));

    const prompt = `My goal is to become a "${cleanAsp}". Generate a list of high-level course titles that form a comprehensive learning path.`;
    const schema = { type: 'OBJECT', properties: { courses: { type: 'ARRAY', items: { type: 'STRING' } } }, required: ['courses'] };
    try {
      setState(s => ({ ...s, loading: true, error: null }));
      const result = await callGeminiAPI(prompt, schema);
      if (result && result.courses) {
        setState(s => ({ ...s, listTitle: `Learning Path for: ${cleanAsp}`, listItems: result.courses, listType: 'course' }));
      }
    } catch (err) {
      setState(s => ({ ...s, error: err.message }));
    } finally {
      setState(s => ({ ...s, loading: false }));
    }
  };

  // Now receives (item, type) from List component
  const handleListItemClick = async (item, type) => {
    if (!item || !type) return;

    // push current location into history
    setState(s => ({ ...s, history: [...s.history, { step: s.currentStep, value: s[s.currentStep] || s.aspiration }] }));

    let nextStep = null;
    let prompt = null;
    let schema = null;
    let title = null;

  // capture aspiration to avoid stale state in prompts
  const aspiration = state.aspiration;

    switch (type) {
      case 'course':
        nextStep = 'book';
        prompt = `For the course "${item}" (part of becoming a "${aspiration}"), generate a list of key books or modules.`;
        schema = { type: 'OBJECT', properties: { books: { type: 'ARRAY', items: { type: 'STRING' } } }, required: ['books'] };
        title = `Books/Modules for: ${item}`;
        setState(s => ({ ...s, course: item }));
        break;
      case 'book':
        nextStep = 'chapter';
        prompt = `For the book "${item}" in the course "${state.course}", generate a list of chapters.`;
        schema = { type: 'OBJECT', properties: { chapters: { type: 'ARRAY', items: { type: 'STRING' } } }, required: ['chapters'] };
        title = `Chapters in: ${item}`;
        setState(s => ({ ...s, book: item }));
        break;
      case 'chapter':
        nextStep = 'lesson';
        prompt = `For the chapter "${item}" in the book "${state.book}", generate a list of specific lessons.`;
        schema = { type: 'OBJECT', properties: { lessons: { type: 'ARRAY', items: { type: 'STRING' } } }, required: ['lessons'] };
        title = `Lessons in: ${item}`;
        setState(s => ({ ...s, chapter: item }));
        break;
      case 'lesson': {
        // final: fetch article and render article step
        const articlePrompt = `Generate a detailed and educational article for the lesson "${item}". This is from the chapter "${state.chapter}" in the book "${state.book}" for the course "${state.course}". The article should be well-structured and easy to understand. Use markdown for formatting.`;
        try {
          setState(s => ({ ...s, loading: true, error: null }));
          const articleContent = await callGeminiAPI(articlePrompt);
          if (articleContent) {
            setState(s => ({ ...s, lesson: item, articleContent, currentStep: 'article' }));
          }
        } catch (err) {
          setState(s => ({ ...s, error: err.message }));
        } finally {
          setState(s => ({ ...s, loading: false }));
        }
        return;
      }
      default:
        return;
    }

    setState(s => ({ ...s, currentStep: nextStep }));

    try {
      setState(s => ({ ...s, loading: true, error: null }));
      const result = await callGeminiAPI(prompt, schema);
      if (result) {
        const items = result.courses || result.books || result.chapters || result.lessons;
        if (items) {
          setState(s => ({ ...s, listTitle: title, listItems: items, listType: nextStep }));
        }
      }
    } catch (err) {
      setState(s => ({ ...s, error: err.message }));
    } finally {
      setState(s => ({ ...s, loading: false }));
    }
  };

  const handleGenerateQuiz = async () => {
    setState(s => ({ ...s, currentStep: 'quiz' }));
    const prompt = `Based on the following article about "${state.lesson}", generate a multiple-choice quiz with 5 questions. For each question, provide 4 options and indicate the correct answer.
<article>
${state.articleContent}
</article>`;
    const schema = {
      type: 'OBJECT',
      properties: {
        quiz: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: {
              question: { type: 'STRING' },
              options: { type: 'ARRAY', items: { type: 'STRING' } },
              correctAnswer: { type: 'STRING' }
            },
            required: ['question', 'options', 'correctAnswer']
          }
        }
      },
      required: ['quiz']
    };
    try {
      setState(s => ({ ...s, loading: true, error: null }));
      const result = await callGeminiAPI(prompt, schema);
      if (result && result.quiz) {
        setState(s => ({ ...s, quizData: result.quiz }));
      }
    } catch (err) {
      setState(s => ({ ...s, error: err.message }));
    } finally {
      setState(s => ({ ...s, loading: false }));
    }
  };

  const handleQuizSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const results = state.quizData.map((q, index) => {
      const selected = form.querySelector(`input[name="question-${index}"]:checked`);
      return {
        question: q.question,
        selected: selected ? selected.value : null,
        correctAnswer: q.correctAnswer,
        isCorrect: selected ? selected.value === q.correctAnswer : false,
      };
    });

    setState(s => ({ ...s, quizResults: results, quizSubmitted: true }));
  };

  const handleBreadcrumbClick = (stepIndex) => {
    if (stepIndex === -1) {
      setState(s => ({ ...s, currentStep: 'aspiration', history: [] }));
      return;
    }

    const newHistory = state.history.slice(0, stepIndex);
    const targetState = state.history[stepIndex];

    setState(s => ({ ...s, currentStep: targetState.step, history: newHistory, [targetState.step]: targetState.value }));

    const previousStepIndex = stepIndex - 1;
    if (previousStepIndex < 0) {
        handleAspirationSubmit(state.aspiration);
    } else {
        const previousState = state.history[previousStepIndex];
        handleListItemClick(previousState.value, previousState.step);
    }
  };

  const handleBackClick = () => {
    if (state.history.length === 0) return;

    const newHistory = state.history.slice(0, state.history.length - 1);
    const lastState = state.history[state.history.length - 1];

    setState(s => ({ ...s, currentStep: lastState.step, history: newHistory, [lastState.step]: lastState.value }));
  };

  const handleStartOver = () => {
    setState({
      currentStep: 'aspiration',
      aspiration: '',
      course: '',
      book: '',
      chapter: '',
      lesson: '',
      articleContent: '',
      quizData: [],
      quizResults: [],
      quizSubmitted: false,
      listTitle: '',
      listItems: [],
      listType: 'course',
      history: [],
      loading: false,
      error: null,
    });
  };

  const renderStep = () => {
    switch (state.currentStep) {
      case 'aspiration':
        return <Aspiration onSubmit={handleAspirationSubmit} />;
      case 'course':
      case 'book':
      case 'chapter':
      case 'lesson':
        return <List title={state.listTitle} items={state.listItems} type={state.listType} onItemClick={handleListItemClick} onBackClick={handleBackClick} />;
      case 'article':
        return <Article title={state.lesson} content={state.articleContent} onGenerateQuiz={handleGenerateQuiz} onBackClick={handleBackClick} />;
      case 'quiz':
        return <Quiz title={`Quiz for: ${state.lesson}`} questions={state.quizData} onSubmit={handleQuizSubmit} results={state.quizResults} submitted={state.quizSubmitted} />;
      default:
        return null;
    }
  };

  return (
    <div className="app">
      <header className="landing-header">
        <h1>Learn with AI</h1>
        <p>Your personalized learning path, powered by Gemini.</p>
      </header>

      <main className="main-content">
        <Breadcrumbs history={state.history} onBreadcrumbClick={handleBreadcrumbClick} />
        {state.loading && <div className="loader">Loading...</div>}
        {state.error && <div className="error">{state.error}</div>}
        {!state.loading && !state.error && renderStep()}
      </main>

      <Footer onStartOver={handleStartOver} />
    </div>
  );
}

export default App;