import { elements } from './state.js';
import { renderAspirationStep } from './render.js';
import { handleAspirationSubmit, handleListItemClick, handleGenerateQuiz, handleQuizSubmit, handleBreadcrumbClick } from './events.js';

document.addEventListener('DOMContentLoaded', () => {
    // initial render
    renderAspirationStep();

    // wire event delegation
    const mainContent = document.getElementById('main-content');
    const breadcrumbs = document.getElementById('breadcrumbs');

    if (mainContent) mainContent.addEventListener('click', handleListItemClick);
    if (breadcrumbs) breadcrumbs.addEventListener('click', handleBreadcrumbClick);

    document.addEventListener('click', (e) => {
        const t = e.target;
        if (!t) return;
        if (t.id === 'start-btn') handleAspirationSubmit();
        if (t.id === 'generate-quiz-btn') handleGenerateQuiz();
    });

    document.addEventListener('submit', (e) => {
        const form = e.target;
        if (form && form.id === 'quiz-form') handleQuizSubmit(e);
    });
});
