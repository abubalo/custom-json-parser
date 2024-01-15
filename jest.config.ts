import type {Config} from "@jest/types"

const config: Config.InitialOptions = {
  "preset": "ts-jest",
  transform: {
    '^.+\\.ts?$': ['ts-jest', {
      tsconfig: './tsconfig.json',
    }],
  },
  testEnvironment: 'node',
  transformIgnorePatterns: [
    '/node_modules/', 
  ],
  testRegex: './test/.*\\.(test|spec)?\\.(ts)$',
  moduleFileExtensions: ['ts', 'js', 'json'],
  roots: ['<rootDir>test'],
  verbose: true,
  automock: true,
};


export default config