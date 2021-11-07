/**
 * Executes a string representing JavaScript Code
 * @function executeJsString
 * @param  {String} str string representing JavaScript code
 * @return {Function} Executed function object
 */
export function executeJsString(str: string) {
    return Function(`'use strict'; return (${str})`)();
}

/**
  * Encode a string to Base64
  * @function utf8Tob64
  * @param  {String} str string to encode to base64
  * @return {String} encoded string
  */
export function utf8Tob64(str: string) {
    return window.btoa(unescape(encodeURIComponent(str)));
}