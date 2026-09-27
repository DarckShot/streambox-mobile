import MaskedView from '@react-native-masked-view/masked-view';
import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { ScrollView } from 'react-native';

import { ScrollEdgeBlur } from '../src/components/scroll/ScrollEdgeBlur';

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({ colors: { background: '#FFFFFF' }, dark: false }),
}));

it('показывает размытие только там, где список продолжается', async () => {
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(
      <ScrollEdgeBlur>
        <ScrollView />
      </ScrollEdgeBlur>,
    );
  });

  const scroll = renderer.root.findByType(ScrollView);
  await ReactTestRenderer.act(() => {
    scroll.props.onLayout({ nativeEvent: { layout: { height: 100 } } });
    scroll.props.onContentSizeChange(100, 300);
  });
  expect(renderer.root.findAllByType(MaskedView)).toHaveLength(1);

  await ReactTestRenderer.act(() => {
    scroll.props.onScroll({
      nativeEvent: {
        contentOffset: { y: 100 },
        layoutMeasurement: { height: 100 },
        contentSize: { height: 300 },
      },
    });
  });
  expect(renderer.root.findAllByType(MaskedView)).toHaveLength(2);

  await ReactTestRenderer.act(() => {
    scroll.props.onScroll({
      nativeEvent: {
        contentOffset: { y: 200 },
        layoutMeasurement: { height: 100 },
        contentSize: { height: 300 },
      },
    });
  });
  expect(renderer.root.findAllByType(MaskedView)).toHaveLength(1);

  await ReactTestRenderer.act(() => renderer.unmount());
});
