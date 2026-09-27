/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App, { queryClient } from '../App';

jest.mock('../src/api/videos', () => ({ getVideos: jest.fn(async () => []) }));

test('renders correctly', async () => {
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(<App />);
  });
  await ReactTestRenderer.act(() => renderer.unmount());
  queryClient.clear();
});
