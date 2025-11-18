const fs = require('fs');

fs.readFile('day_51_notes.txt', (data, err)=> {
    setTimeout(() => {
        console.log('setTimeout')
    }, 0);
    setImmediate(() => {
        console.log('setImmediate')
    });
});