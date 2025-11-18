setTimeout(() => {
    console.log('setTimeout')
}, 0);
setImmediate(() => {
    console.log('setImmediate')
});
// order is non-deterministic