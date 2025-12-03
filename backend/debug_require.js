try {
    const tests = require('./utils/__tests__/projectionEngine.test.js');
    tests.runAllTests();
} catch (e) {
    console.error('❌ Failed:', e);
}
