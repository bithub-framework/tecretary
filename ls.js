setImmediate(() => {
    setTimeout(() => {
        console.log('setTimeout');
    }, 8);
    const start = Date.now();
    while (Date.now() - start < 10);
    setImmediate(() => {
        console.log('setImmediate');
    });
});
