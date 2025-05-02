module.exports = {
    testEnvironment: 'node',
    collectCoverage: true,
    collectCoverageFrom: [
        'app.js',
        'routes/**/*.js',
        'controllers/**/*.js',
        'middlewares/**/*.js',
        'config/*.js'
    ],
    coverageDirectory: 'coverage',
    coverageThreshold: {
        global: {
            branches: 100,
            functions: 100,
            lines: 100,
            statements: 100
        }
    }
};
