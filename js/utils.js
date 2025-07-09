// js/utils.js

/**
 * A mathematical easing function that starts slow, accelerates, and then slows down.
 * This is used to make animations feel smooth and natural.
 * @param {number} x A value between 0 and 1.
 * @returns {number} The eased value, also between 0 and 1.
 */
export function easeInOutCubic(x) {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}