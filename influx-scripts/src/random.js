import { faker } from '@faker-js/faker';

/**
 * @param {number} min inclusive
 * @param {number} max exclusive
 * @param {boolean} denormalized
 */
export function int(min, max, denormalized = false) {
    const range = max - min
    let randomValue = Math.random()
    if (denormalized) {
        randomValue *= randomValue
    }
    return Math.floor(randomValue * range) + min
}

/**
 * @param {number} threshold 0 <= x <= 1
 * @returns {boolean}
 */
export function boolean(threshold = 0.5) {
    return Math.random() < threshold
}

/**
 * @param {Array<unknown>} array 
 */
export function arrayElement(array, denormalized = true) {
    const index = int(0, array.length, denormalized)
    return array[index]
}

export function sitePath() {
    const url = faker.internet.url();
    const path = new URL(url).pathname;
    return path;
}

/**
 * @template T
 * @param {number} length 
 * @param {() => T} generator
 */
export function array(length, generator = Math.random) {
    const buffer = [];
    for (let i = 0; i < length; i++) {
        buffer.push(generator())
    }
    return buffer
}