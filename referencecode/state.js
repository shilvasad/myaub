export const state = {
    currentStep: 'aspiration', // aspiration, course, book, chapter, lesson, article, quiz
    aspiration: '',
    course: '',
    book: '',
    chapter: '',
    lesson: '',
    articleContent: '',
    quizData: [],
    history: [],
};

export const elements = {
    get mainContent() { return document.getElementById('main-content'); },
    get loader() { return document.getElementById('loader-container'); },
    get errorContainer() { return document.getElementById('error-container'); },
    get errorMessage() { return document.getElementById('error-message'); },
    get breadcrumbs() { return document.getElementById('breadcrumbs'); },
};