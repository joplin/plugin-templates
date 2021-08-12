module.exports = {
    transform: { "^.+\\.ts?$": "ts-jest" },
    testEnvironment: "node",
    testRegex: "/tests/.*\\.(test|spec)?\\.(ts|tsx)$",
    moduleFileExtensions: ["ts", "js", "json", "node"],
    moduleNameMapper: {
        "^@templates/(.*)$": "<rootDir>/src/$1"
    },
    globalSetup: "./tests/jest-setup.js"
};
