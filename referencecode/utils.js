export function markdownToHtml(content) {
    if (!content) return '';
    return content
        .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-6 mb-4">$1</h1>')
        .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-5 mb-3">$1</h2>')
        .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mt-4 mb-2">$1</h3>')
        .replace(/\*\*(.*)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/```([\s\S]*?)```/g, (match, p1) => `<pre><code>${p1.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code></pre>`)
        .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
        .split('\n').map(p => p.trim() === '' ? '' : `<p>${p}</p>`).join('')
        .replace(/<p>\* (.*?)<\/p>/g, '<ul><li>$1</li></ul>')
        .replace(/<\/ul>\s*<ul>/g, '')
        .replace(/<p>(\d+)\. (.*?)<\/p>/g, '<ol><li>$2</li></ol>')
        .replace(/<\/ol>\s*<ol>/g, '');
}

export function createElementFromHTML(html) {
    const template = document.createElement('template');
    template.innerHTML = html.trim();
    return template.content.firstChild;
}
