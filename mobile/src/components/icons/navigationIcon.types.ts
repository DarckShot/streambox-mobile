import type { ReactElement } from 'react';

export type NavigationIconProps = {
  color: string;
  focused: boolean;
  size?: number;
};

export type NavigationIconComponent = (props: NavigationIconProps) => ReactElement;
