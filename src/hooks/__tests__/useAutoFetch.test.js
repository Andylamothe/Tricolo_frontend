import { renderHook } from '@testing-library/react';
import { useAutoFetch } from '../useAutoFetch';

describe('useAutoFetch Hook', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should call fetch function immediately on mount', () => {
    const mockFetch = jest.fn();

    renderHook(() => useAutoFetch(mockFetch, 1000));

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('should call fetch function at specified intervals', () => {
    const mockFetch = jest.fn();

    renderHook(() => useAutoFetch(mockFetch, 1000));

    expect(mockFetch).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(1000);
    expect(mockFetch).toHaveBeenCalledTimes(2);

    jest.advanceTimersByTime(1000);
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it('should cleanup interval on unmount', () => {
    const mockFetch = jest.fn();
    const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

    const { unmount } = renderHook(() => useAutoFetch(mockFetch, 1000));

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
    clearIntervalSpy.mockRestore();
  });

  it('should not run when enabled is false', () => {
    const mockFetch = jest.fn();

    renderHook(() => useAutoFetch(mockFetch, 1000, false));

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('should respect custom interval duration', () => {
    const mockFetch = jest.fn();

    renderHook(() => useAutoFetch(mockFetch, 5000));

    expect(mockFetch).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(2500);
    expect(mockFetch).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(2500);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('should update interval when function changes', () => {
    const mockFetch1 = jest.fn();
    const mockFetch2 = jest.fn();

    const { rerender } = renderHook(
      ({ fetch }) => useAutoFetch(fetch, 1000),
      { initialProps: { fetch: mockFetch1 } }
    );

    expect(mockFetch1).toHaveBeenCalledTimes(1);

    rerender({ fetch: mockFetch2 });

    jest.advanceTimersByTime(1000);

    expect(mockFetch1).toHaveBeenCalledTimes(1);
    expect(mockFetch2).toHaveBeenCalledTimes(1);
  });
});
