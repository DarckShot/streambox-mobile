import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text } from 'react-native';

import { VideoDetailsTitle } from '../src/components/videoDetails/VideoDetailsTitle';

it('раскрывает длинное название и позволяет свернуть его обратно', async () => {
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(
      <VideoDetailsTitle title="Очень длинное название видео" isCompact={false} textColor="#111" />,
    );
  });

  const title = (): ReactTestRenderer.ReactTestInstance =>
    renderer.root.findAllByType(Text).find((node) => node.props.ellipsizeMode === 'tail')!;
  expect(title().props.numberOfLines).toBe(2);

  await ReactTestRenderer.act(() => {
    renderer.root
      .findAllByType(Text)
      .find((node) => node.props.onTextLayout)!
      .props.onTextLayout({
        nativeEvent: { lines: [{}, {}, {}] },
      });
  });
  await ReactTestRenderer.act(() => {
    renderer.root.findByProps({ accessibilityRole: 'button' }).props.onPress();
  });
  expect(title().props.numberOfLines).toBeUndefined();
  await ReactTestRenderer.act(() => {
    renderer.root.findByProps({ accessibilityRole: 'button' }).props.onPress();
  });
  expect(title().props.numberOfLines).toBe(2);
  await ReactTestRenderer.act(() => renderer.unmount());
});
