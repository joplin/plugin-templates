module.exports = {
    transform: { "^.+\\.ts?$": "ts-jest" },
    testEnvironment: "node",
    testRegex: "/tests/.*\\.(test|spec)?\\.(ts|tsx)$",
    moduleFileExtensions: ["ts", "js", "json", "node"],
    moduleNameMapper: {
        "^@templates/(.*)$": "<rootDir>/src/$1",
        "^api$": "<rootDir>/tests/mock-joplin-api.ts"
    },
    globalSetup: "./tests/jest-setup.js",
    collectCoverageFrom: ["src/**/*.{js,ts}"]
};
