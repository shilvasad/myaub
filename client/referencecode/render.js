import { markdownToHtml } from './utils.js';
import { state } from './state.js';

export function renderAspirationStep() {
    state.history = state.history || [];
    const main = document.getElementById('main-content');
    main.innerHTML = `
        <div class="bg-white p-8 rounded-xl shadow-lg text-center">
            <h2 class="text-2xl font-semibold mb-4">What do you want to become?</h2>
            <p class="text-gray-600 mb-6">Enter a career, skill, or topic you want to master.</p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
                <input id="aspiration-input" type="text" class="w-full flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="e.g., a Full-Stack Web Developer">
                <button id="start-btn" class="btn-primary">Start Learning Path</button>
            </div>
        </div>
    `;
}

export function renderList(title, items, type) {
    const itemsHtml = items.map((item) => `
        <div class="card p-5" data-type="${type}" data-item="${item}">
            <h3 class="text-lg font-semibold text-blue-600">${item}</h3>
        </div>
    `).join('');

    const main = document.getElementById('main-content');
    main.innerHTML = `
        <div class="text-center mb-6">
            <h2 class="text-3xl font-bold">${title}</h2>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            ${itemsHtml}
        </div>
    `;
}

export function renderArticle(title, content) {
    const htmlContent = markdownToHtml(content);
    const main = document.getElementById('main-content');
    main.innerHTML = `
        <div class="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
            <article class="prose max-w-none">
                <h1>${title}</h1>
                ${htmlContent}
            </article>
            <div class="mt-8 text-center">
                <button id="generate-quiz-btn" class="btn-primary">Test My Knowledge</button>
            </div>
        </div>
    `;
}

export function renderQuiz(title, questions) {
    const questionsHtml = questions.map((q, index) => {
        const optionsHtml = q.options.map((opt) => `
            <label class="block p-3 border rounded-lg hover:bg-gray-100 cursor-pointer">
                <input type="radio" name="question-${index}" value="${opt}" class="mr-3">
                ${opt}
            </label>
        `).join('');
        return `
            <div class="mb-6" data-correct-answer="${q.correctAnswer}">
                <p class="font-semibold mb-3">${index + 1}. ${q.question}</p>
                <div class="space-y-2">${optionsHtml}</div>
                 <div class="mt-2 text-sm result-message"></div>
            </div>
        `;
    }).join('');

    const main = document.getElementById('main-content');
    main.innerHTML = `
         <div class="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
            <h2 class="text-2xl font-bold mb-6 text-center">${title}</h2>
            <form id="quiz-form">
                ${questionsHtml}
                <div class="mt-8 text-center">
                    <button type="submit" class="btn-primary">Check Answers</button>
                </div>
            </form>
        </div>
    `;
}

export function updateBreadcrumbs(elements) {
    const breadcrumbs = elements.breadcrumbs;
    if (!state.history || state.history.length === 0) {
        breadcrumbs.innerHTML = '';
        return;
    }
    const homeCrumb = `<a href="#" class="hover:underline" data-step-index="-1">Home</a>`;
    const pathCrumbs = state.history.map((item, index) => {
        const text = item.value.length > 30 ? item.value.substring(0, 27) + '...' : item.value;
        return `<span class="text-gray-400 mx-1">/</span><a href="#" class="hover:underline" data-step-index="${index}">${text}</a>`;
    }).join('');

    breadcrumbs.innerHTML = homeCrumb + pathCrumbs;
}