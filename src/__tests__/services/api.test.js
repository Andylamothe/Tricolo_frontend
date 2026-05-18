import { api } from '../../services/api';
import { API_BASE_URL } from '../../utils/constants';

// Mock global fetch
global.fetch = jest.fn();

describe('API Service', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  describe('request function', () => {
    it('should perform a GET request successfully', async () => {
      const mockData = { dechets: [] };
      fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockData),
      });

      const result = await api.get('/dechets');

      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/dechets`,
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
      expect(result).toEqual(mockData);
    });

    it('should perform a POST request with body', async () => {
      const mockData = { id: 1, name: 'Plastique' };
      const postBody = { name: 'Plastique' };

      fetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () => Promise.resolve(mockData),
      });

      const result = await api.post('/dechets', postBody);

      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/dechets`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(postBody),
        })
      );
      expect(result).toEqual(mockData);
    });

    it('should handle 204 No Content response', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      const result = await api.put('/dechets/1', {});

      expect(result).toBeNull();
    });

    it('should throw error on failed request', async () => {
      const errorMessage = 'Not found';
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: () => Promise.resolve(errorMessage),
      });

      await expect(api.get('/invalid')).rejects.toThrow(errorMessage);
    });

    it('should throw error on network failure', async () => {
      const networkError = new Error('Network error');
      fetch.mockRejectedValueOnce(networkError);

      await expect(api.get('/dechets')).rejects.toThrow('Network error');
    });
  });

  describe('convenience methods', () => {
    it('should call getAllDechets endpoint', async () => {
      const mockData = [];
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      await api.getAllDechets();

      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/dechets`,
        expect.any(Object)
      );
    });

    it('should call getAllStats endpoint', async () => {
      const mockStats = { total: 100 };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockStats),
      });

      await api.getAllStats();

      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/stats`,
        expect.any(Object)
      );
    });

    it('should call getAllNotifs endpoint', async () => {
      const mockData = [];
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      await api.getAllNotifs();

      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/notif`,
        expect.any(Object)
      );
    });

    it('should call updateNotif endpoint with category', async () => {
      const payload = { isFull: false, notifIsSent: true };

      fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ message: 'ok' }),
      });

      await api.updateNotif('poubelle', payload);

      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/notif/poubelle`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(payload),
        })
      );
    });
  });
});
