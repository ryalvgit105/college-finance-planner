const { runAllTests } = require('./utils/__tests__/projectionEngine.test.js');

console.log('Starting V4 Projection Engine Tests...');
try {
    runAllTests();
} catch (error) {
    console.error('Test execution failed:', error);
    process.exit(1);
}
