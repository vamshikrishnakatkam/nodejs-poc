// tests/setupTest.js
const mongoose = require('mongoose');

beforeAll(async () => {
    // Mock the Mongoose connect method to prevent real DB connection
    jest.spyOn(mongoose, 'connect').mockImplementation(() => Promise.resolve());
});

afterAll(async () => {
    // Restore all mocks after tests
    jest.restoreAllMocks();
});
