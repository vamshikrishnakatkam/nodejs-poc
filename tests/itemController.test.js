const request = require('supertest');
const app = require('../app');
const Item = require('../models/item');

// Mocking the authMiddleware to bypass authentication
jest.mock('../middleware/authMiddleware', () => (req, res, next) => next());
jest.mock('../models/item');



describe('Item Controller', () => {
    beforeEach(() => {
        jest.clearAllMocks(); // Clear mocks before each test
    });

    describe('GET /api/items', () => {
        it('should return all items', async () => {
            const items = [{ name: 'Item 1', description: 'Description 1' }];
            Item.find.mockResolvedValue(items);

            const res = await request(app).get('/api/items');

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual(items);
            expect(Item.find).toHaveBeenCalledTimes(1);
        });

        it('should return 400 if there is an error', async () => {
            Item.find.mockRejectedValue(new Error('Error fetching items'));

            const res = await request(app).get('/api/items');

            expect(res.statusCode).toBe(400);
            expect(res.text).toBe('Error fetching items');
        });
    });

    describe('POST /api/items', () => {
        it('should create a new item', async () => {
            const newItem = { name: 'New Item', description: 'New Description' };
            const savedItem = { _id: 'itemId', ...newItem };
            Item.prototype.save = jest.fn().mockResolvedValue(savedItem);

            const res = await request(app).post('/api/items').send(newItem);

            expect(res.statusCode).toBe(201);
            expect(res.body).toEqual(savedItem);
            expect(Item.prototype.save).toHaveBeenCalledTimes(1);
        });

        it('should return 400 if name or description is missing', async () => {
            const res = await request(app).post('/api/items').send({ name: 'New Item' });

            expect(res.statusCode).toBe(400);
            expect(res.text).toBe('Name and description are required');
        });

        it('should return 400 if there is an error saving the item', async () => {
            const newItem = { name: 'New Item', description: 'New Description' };
            Item.prototype.save = jest.fn().mockRejectedValue(new Error('Error saving item'));

            const res = await request(app).post('/api/items').send(newItem);

            expect(res.statusCode).toBe(400);
            expect(res.text).toBe('Error saving item');
        });
    });

    describe('PUT /api/items/:id', () => {
        it('should update an item', async () => {
            const updatedItem = { name: 'Updated Item', description: 'Updated Description' };
            Item.findByIdAndUpdate.mockResolvedValue(updatedItem);

            const res = await request(app).put('/api/items/itemId').send(updatedItem);

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual(updatedItem);
            expect(Item.findByIdAndUpdate).toHaveBeenCalledWith('itemId', updatedItem, { new: true });
        });

        it('should return 400 if there is an error updating the item', async () => {
            Item.findByIdAndUpdate.mockRejectedValue(new Error('Error updating item'));

            const res = await request(app).put('/api/items/itemId').send({ name: 'Updated Item' });

            expect(res.statusCode).toBe(400);
            expect(res.text).toBe('Error updating item');
        });
    });

    describe('DELETE /api/items/:id', () => {
        it('should delete an item', async () => {
            Item.findByIdAndDelete.mockResolvedValue({});

            const res = await request(app).delete('/api/items/itemId');

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual({ message: 'Item deleted successfully.' });
            expect(Item.findByIdAndDelete).toHaveBeenCalledWith('itemId');
        });

        it('should return 400 if there is an error deleting the item', async () => {
            Item.findByIdAndDelete.mockRejectedValue(new Error('Error deleting item'));

            const res = await request(app).delete('/api/items/itemId');

            expect(res.statusCode).toBe(400);
            expect(res.text).toBe('Error deleting item');
        });
    });
});
