import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { IScreen } from '../types';

export interface IProps {
    title: string;
    onBack?(): void;
    onPressMenuItem(screen: IScreen): void;
    activeMenuItem: IScreen;
}

export interface IMenuItem {
    title: string;
    screen: IScreen;
    icon: IconProp;
}
