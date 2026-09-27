import { getScrollEdges } from '../src/components/scroll/scrollEdges';

it('скрывает размытие у достигнутого края и при отсутствии прокрутки', () => {
  expect(getScrollEdges(0, 500, 1000)).toEqual({ top: false, bottom: true });
  expect(getScrollEdges(250, 500, 1000)).toEqual({ top: true, bottom: true });
  expect(getScrollEdges(500, 500, 1000)).toEqual({ top: true, bottom: false });
  expect(getScrollEdges(0, 500, 400)).toEqual({ top: false, bottom: false });
});
