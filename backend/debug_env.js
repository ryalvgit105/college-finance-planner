console.log('Node Version:', process.version);
try {
    console.log('Require type:', typeof require);
    console.log('Module type:', typeof module);
    console.log('__filename:', __filename);
} catch (e) {
    console.error('Error inspecting env:', e);
}
