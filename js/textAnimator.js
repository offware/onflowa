/**
 * Animates the text content of an HTML element with a scramble effect.
 * @param {HTMLElement} element The HTML element whose text will be animated.
 * @param {string} final_text The target text to reveal.
 * @param {number} duration The total duration of the animation in milliseconds.
 */
export function animateScrambleText(element, final_text, duration = 800) {
    const chars = '!<>-_\\/[]{}—=+*^?#________';
    let frame = 0;
    const frame_rate = 20; // ms per frame
    const num_frames = duration / frame_rate;

    const intervalId = setInterval(() => {
        let scrambled_text = '';
        for (let i = 0; i < final_text.length; i++) {
            const progress = frame / num_frames;
            const reveal_progress = (i + 1) / final_text.length;

            if (progress >= reveal_progress) {
                scrambled_text += final_text[i];
            } else if (final_text[i] === ' ' || final_text[i] === '[' || final_text[i] === ']') {
                scrambled_text += final_text[i]; // Don't scramble spaces or brackets
            } else {
                scrambled_text += chars[Math.floor(Math.random() * chars.length)];
            }
        }
        element.innerText = scrambled_text;

        frame++;
        if (frame >= num_frames) {
            element.innerText = final_text;
            clearInterval(intervalId);
        }
    }, frame_rate);
}
