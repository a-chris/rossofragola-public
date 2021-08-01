/**
 * If response has been successful it will resolve and return the response body,
 * otherwise it will reject and return the error from the server with a status code
 *
 * @param {string} endpoint
 * @param {Object} options
 */
export function fetchWrapper(endpoint, options) {
    return new Promise((resolve, reject) => {
        fetch(endpoint, options)
            .then((response) => {
                response.json().then((body) => {
                    if (response.status !== 200) {
                        return reject(body);
                    } else {
                        resolve(body);
                    }
                });
            })
            .catch((err) => reject({ error: err }));
    });
}

const CACHE = new Map();

export function matchIngredients(ingredients, type) {
    const key = [...ingredients, type].join('_');
    if (CACHE.has(key)) {
        return Promise.resolve(CACHE.get(key));
    } else {
        return new Promise((resolve, reject) => {
            fetchWrapper('api/match', {
                method: 'post',
                body: JSON.stringify({ ingredients, type }),
            })
                .then((response) => {
                    const matches = JSON.parse(response.matches);
                    CACHE.set(key, matches);
                    resolve(matches);
                })
                .catch((result) => reject(result));
        });
    }
}
