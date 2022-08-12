import { RefObject } from 'react';
import { Camera } from 'react-native-vision-camera';

export interface IProps {
    uid: string;
    matrix: TMatrix;
    points: TPoints;
    photoOverlayPercentage: number;
    noMatrix?: boolean;
    onPressBack?(): void;
}

export interface ICameraProps {
    cameraRef: RefObject<Camera> | null;
}

export interface IFramingProps {
    uid: string;
}

export type TMatrix = string[][];

export interface IMatrixProps {
    isPhotosScreen: boolean;
    size: number;
    matrix: TMatrix;
    idxRow: number;
    setIdxRow(idx: number): void;
    idxCol: number;
    setIdxCol(idx: number): void;
    maxRow: number;
    setMaxRow(idx: number): void;
    maxCol: number;
    setMaxCol(idx: number): void;
}

export type IArrowType = 'LEFT' | 'RIGHT' | 'TOP' | 'BOTTOM';

export type IScreen = 'CAMERA' | 'PHOTOS' | 'FRAMING' | 'OVERALL_PLAN';

export interface IPoint {
    x: number;
    y: number;
    number: number;
}

export type TPoints = Array<IPoint>;

export interface IDataStorage {
    uid: string;
    matrix: string[][];
    maxRow: number;
    maxCol: number;
    matrixFull: boolean;
    points: TPoints;
    photoWidth: number;
    photoHeight: number;
}
