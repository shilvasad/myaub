import { state, elements } from './state.js';
import { callGeminiAPI } from './api.js';
import { renderAspirationStep, renderList, renderArticle, renderQuiz, updateBreadcrumbs } from './render.js';

export async function handleAspirationSubmit() {
    const input = document.getElementById('aspiration-input');
    const aspiration = input.value.trim();
    if (!aspiration) {
        alert('Please enter what you want to become.');
        return;
    }
    state.aspiration = aspiration;
    state.currentStep = 'course';
    state.history = [];
    updateBreadcrumbs(elements);

    const prompt = `My goal is to become a "${aspiration}". Generate a list of high-level course titles that form a comprehensive learning path.`;
    const schema = { type: 'OBJECT', properties: { courses: { type: 'ARRAY', items: { type: 'STRING' } } }, required: ['courses'] };
    const result = await callGeminiAPI(prompt, schema);
    if (result && result.courses) renderList(`Learning Path for: ${aspiration}`, result.courses, 'course');
}

export async function handleListItemClick(e) {
    const card = e.target.closest('.card');
    if (!card) return;

    const type = card.dataset.type;
    const item = card.dataset.item;
    
    state.history.push({ step: state.currentStep, value: state[state.currentStep] || state.aspiration });

    let nextStep, prompt, schema, title;

    switch (type) {
        case 'course':
            state.course = item;
            nextStep = 'book';
            prompt = `For the course "${state.course}" (part of becoming a "${state.aspiration}"), generate a list of key books or modules.`;
            schema = { type: 'OBJECT', properties: { books: { type: 'ARRAY', items: { type: 'STRING' } } }, required: ['books'] };
            title = `Books/Modules for: ${state.course}`;
            break;
        case 'book':
            state.book = item;
            nextStep = 'chapter';
            prompt = `For the book "${state.book}" in the course "${state.course}", generate a list of chapters.`;
            schema = { type: 'OBJECT', properties: { chapters: { type: 'ARRAY', items: { type: 'STRING' } } }, required: ['chapters'] };
            title = `Chapters in: ${state.book}`;
            break;
        case 'chapter':
            state.chapter = item;
            nextStep = 'lesson';
            prompt = `For the chapter "${state.chapter}" in the book "${state.book}", generate a list of specific lessons.`;
            schema = { type: 'OBJECT', properties: { lessons: { type: 'ARRAY', items: { type: 'STRING' } } }, required: ['lessons'] };
            title = `Lessons in: ${state.chapter}`;
            break;
        case 'lesson':
            state.lesson = item;
            state.currentStep = 'article';
            state.history.push({ step: 'lesson', value: state.lesson });
            updateBreadcrumbs(elements);
            prompt = `Generate a detailed and educational article for the lesson "${state.lesson}". This is from the chapter "${state.chapter}" in the book "${state.book}" for the course "${state.course}", aimed at someone wanting to become a "${state.aspiration}". The article should be well-structured and easy to understand. Use markdown for formatting.`;
            const articleContent = await callGeminiAPI(prompt);
            if (articleContent) {
                state.articleContent = articleContent;
                renderArticle(state.lesson, articleContent);
            }
            return;
    }

    state.currentStep = nextStep;
    state.history[state.history.length-1].value = item;
    updateBreadcrumbs(elements);

    const result = await callGeminiAPI(prompt, schema);
    if (result) {
        const items = result.courses || result.books || result.chapters || result.lessons;
        if (items) renderList(title, items, nextStep);
    }
}

export async function handleGenerateQuiz() {
    state.currentStep = 'quiz';
    const prompt = `Based on the following article about "${state.lesson}", generate a multiple-choice quiz with 5 questions. For each question, provide 4 options and indicate the correct answer.\n<article>\n${state.articleContent}\n</article>`;
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
    const result = await callGeminiAPI(prompt, schema);
    if (result && result.quiz) {
        state.quizData = result.quiz;
        renderQuiz(`Quiz for: ${state.lesson}`, state.quizData);
    }
}

export function handleQuizSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const questionDivs = form.querySelectorAll('div[data-correct-answer]');
    let score = 0;

    questionDivs.forEach((div, index) => {
        const correctAnswer = div.dataset.correctAnswer;
        const resultMsg = div.querySelector('.result-message');
        const selected = form.querySelector(`input[name=\"question-${index}\"]:checked`);

        if (selected) {
            if (selected.value === correctAnswer) {
                score++;
                resultMsg.textContent = 'Correct!';
                resultMsg.className = 'mt-2 text-sm result-message text-green-600 font-medium';
                selected.parentElement.classList.add('bg-green-100', 'border-green-300');
            } else {
                resultMsg.textContent = `Incorrect. The correct answer is: ${correctAnswer}`;
                resultMsg.className = 'mt-2 text-sm result-message text-red-600 font-medium';
                selected.parentElement.classList.add('bg-red-100', 'border-red-300');
            }
        } else {
            resultMsg.textContent = `No answer selected. The correct answer is: ${correctAnswer}`;
            resultMsg.className = 'mt-2 text-sm result-message text-yellow-600 font-medium';
        }
    });

    const summary = document.createElement('div');
    summary.className = 'mt-8 text-center text-xl font-bold';
    summary.textContent = `You scored ${score} out of ${questionDivs.length}!`;
    form.appendChild(summary);

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.classList.add('opacity-50', 'cursor-not-allowed');
    }
}

export function handleBreadcrumbClick(e) {
    e.preventDefault();
    const target = e.target;
    if (target.tagName !== 'A' || !target.dataset.stepIndex) return;

    const stepIndex = parseInt(target.dataset.stepIndex, 10);

    if (stepIndex === -1) {
        state.history = [];
        state.currentStep = 'aspiration';
        updateBreadcrumbs(elements);
        renderAspirationStep();
        return;
    }

    const targetState = state.history[stepIndex];
    state.history = state.history.slice(0, stepIndex);

    state.currentStep = targetState.step;
    state[targetState.step] = targetState.value;

    const previousStepIndex = stepIndex - 1;
    if (previousStepIndex < 0) {
        handleAspirationSubmit();
    } else {
        const previousState = state.history[previousStepIndex];
        const pseudoEvent = {
            target: {
                closest: () => ({ dataset: { type: previousState.step, item: previousState.value } })
            }
        };
        state.history = state.history.slice(0, previousStepIndex);
        handleListItemClick(pseudoEvent);
    }
}