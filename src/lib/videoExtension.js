import { Node, mergeAttributes } from '@tiptap/core';

function getEmbedUrl(url) {
    const youtube = /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/.exec(url);
    if (youtube) return `https://www.youtube-nocookie.com/embed/${youtube[1]}`;
    const vimeo = /vimeo\.com\/(\d+)/.exec(url);
    if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
    return null;
}

export const VideoEmbed = Node.create({
    name: 'videoEmbed',
    group: 'block',
    atom: true,
    addAttributes() { return { src: { default: null }, title: { default: 'StoryGrid video' } }; },
    parseHTML() { return [{ tag: 'div[data-video-embed]', getAttrs: element => ({ src: element.querySelector('iframe')?.getAttribute('src') || null, title: element.querySelector('iframe')?.getAttribute('title') || 'StoryGrid video' }) }]; },
    renderHTML({ HTMLAttributes }) { return ['div', { 'data-video-embed': '', class: 'storygrid-video' }, ['iframe', mergeAttributes(HTMLAttributes, { class: 'storygrid-video-frame', frameborder: '0', allowfullscreen: 'true', loading: 'lazy', title: HTMLAttributes.title || 'StoryGrid video' })]]; },
    addCommands() { return { setVideoEmbed: (options) => ({ commands }) => commands.insertContent({ type: this.name, attrs: { src: getEmbedUrl(options.src), title: options.title || 'StoryGrid video' } }) }; },
    addInputRules() { return []; },
});

export { getEmbedUrl };
