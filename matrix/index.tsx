import React, { FC, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft, faImage } from '@fortawesome/free-solid-svg-icons';
import { faSquare } from '@fortawesome/free-regular-svg-icons';

import { IMatrixProps, IArrowType, TMatrix } from '../types';

export const getDataMatrix = (matrix: TMatrix, maxRow: number, maxCol: number) => {
    return matrix
        .map((row) => row.filter((col, col_idx) => col_idx < maxCol))
        .filter((row, row_idx) => row_idx < maxRow)
        .reverse();
};

const Matrix: FC<IMatrixProps> = ({
    isPhotosScreen,
    size,
    matrix,
    idxCol,
    idxRow,
    setIdxCol,
    setIdxRow,
    maxRow,
    setMaxRow,
    maxCol,
    setMaxCol
}) => {

    const _checkNullRow = (row: number) => {
        return matrix[row].filter(col => col !== '').length;
    };

    const onPressArrow = (arrow: IArrowType) => ():void => {
        if (arrow === 'RIGHT') {
            if (idxRow === 0 && idxCol === maxCol - 1) {
                setMaxCol(maxCol + 1);
            }
            setIdxCol(idxCol + 1);
        }
        if (arrow === 'LEFT') {
            if (idxRow === 0 && idxCol === maxCol - 1 && matrix[idxRow][idxCol] === '') {
                setMaxCol(maxCol - 1);
            }

            setIdxCol(idxCol - 1);
        }
        if (arrow === 'BOTTOM') {
            if (idxRow === maxRow - 1 && (idxCol === 0 || idxCol === maxCol - 1)) {
                setMaxRow(maxRow + 1);
            }

            setIdxRow(idxRow + 1);
        }
        if (arrow === 'TOP') {
            if (idxRow === maxRow - 1 && !_checkNullRow(idxRow)) {
                setMaxRow(maxRow - 1);
            }

            setIdxRow(idxRow - 1);
        }
    };

    const elImages = useMemo(() => {
        const newMatrix: TMatrix = [];
        for (let i = 0; i < maxRow; i++) {
            const arrCol = [];
            for (let j = 0; j < maxCol; j++) {
                arrCol.push(matrix[i][j]);
            }
            newMatrix.push(arrCol);
        }

        const max = Math.max(maxRow, maxCol);

        return newMatrix.map((row, row_idx) => (
            <View key={`row${row_idx}`} style={{flexDirection:'row'}}>
                {row.map((item, col_idx) => {
                    return (
                        <FontAwesomeIcon
                            key={`col${row_idx}${col_idx}`}
                            icon={item ? faImage : faSquare} size={100 / max - 2}
                            style={{
                                color: item ? 'cyan' : 'yellow',
                                opacity: idxRow === row_idx && idxCol === col_idx ? 1 : 0.7,
                                marginRight: 2
                            }}
                        />
                    );
                })}
            </View>
        ));
    }, [matrix, idxRow, idxCol, maxRow, maxCol]);

    const _cell = () => {
        const top = idxRow !== 0 || (idxRow > 0 && matrix[idxRow - 1][idxCol] !== '');
        const bottom = idxRow !== maxRow - 1 || (idxRow < maxRow - 1 && matrix[idxRow + 1][idxCol] !== '');
        const left = idxCol !== 0 || (idxCol > 0 && matrix[idxRow][idxCol - 1] !== '');
        const right = idxCol !== maxCol - 1 || (idxCol < maxCol - 1 && matrix[idxRow][idxCol + 1] !== '');
        const src = matrix[idxRow][idxCol] !== '';

        return {top, bottom, left, right, src};
    };

    const elArrowLeft = useMemo(() => {
        const cell = _cell();
        if (
            cell.left && idxRow === 0 ||
            cell.left && idxRow > 0 && cell.src
        ) {
            return (
                <Pressable onPress={onPressArrow('LEFT')} style={styles.arrowLeft}>
                    <FontAwesomeIcon icon={faArrowLeft} size={50} style={styles.icon}/>
                </Pressable>
            );
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [matrix, idxRow, idxCol]);

    const elArrowRight = useMemo(() => {
        const cell = _cell();
        if (maxCol === size || isPhotosScreen && idxCol === maxCol - 1) {
            return null;
        }

        if (
            cell.right && cell.src ||
            idxRow === 0 && cell.src && maxRow === 1
        ) {
            return (
                <Pressable onPress={onPressArrow('RIGHT')} style={styles.arrowRight}>
                    <FontAwesomeIcon icon={faArrowLeft} size={50} style={{...styles.icon, transform: [{ rotate: '180deg'}]}} />
                </Pressable>
            );
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isPhotosScreen, matrix, idxRow, idxCol]);

    const elArrowTop = useMemo(() => {
        const cell = _cell();
        if (
            cell.top
        ) {
            return (
                <Pressable onPress={onPressArrow('TOP')} style={styles.arrowTop}>
                    <FontAwesomeIcon icon={faArrowLeft} size={50} style={{...styles.icon, transform: [{rotate: '90deg'}]}} />
                </Pressable>
            );
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [matrix, idxRow, idxCol]);

    const elArrowBottom = useMemo(() => {
        const cell = _cell();
        if (maxRow === size || isPhotosScreen && idxRow === maxRow - 1) {
            return null;
        }

        if (
            cell.src && _checkNullRow(idxRow) === maxCol && maxCol > 1 && (
                (idxCol === 0 && matrix[idxRow + 1][maxCol - 1] === '') ||
                (idxCol === maxCol - 1 && matrix[idxRow + 1][0] === '') ||
                (idxRow < maxRow - 1 && matrix[idxRow + 1][idxCol + 1] !== '')
            ) ||
            cell.src && _checkNullRow(idxRow) === maxCol && maxCol === 1

        ) {
            return (
                <Pressable onPress={onPressArrow('BOTTOM')} style={styles.arrowBottom}>
                    <FontAwesomeIcon icon={faArrowLeft} size={50} style={{...styles.icon, transform: [{rotate: '-90deg'}]}} />
                </Pressable>
            );
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isPhotosScreen, matrix, idxRow, idxCol, maxRow, maxCol]);

    return (
        <View style={styles.container}>
            {elImages}
            {elArrowLeft}
            {elArrowRight}
            {elArrowTop}
            {elArrowBottom}
            <View style={{position: 'absolute', top: -20, left: -2}}>
                <Text style={{color: 'cyan'}}>{idxCol + 1}, {idxRow + 1}</Text>
            </View>
        </View>
    );
};

export default Matrix;

const styles = StyleSheet.create({
    container: {
        borderColor: 'cyan',
        borderWidth: 1,
        position: 'absolute',
        bottom: 140,
        alignSelf: 'center',
        width: 100,
        height: 100,
        opacity: 0.4,
        flex: 1
    },
    arrowLeft: {
        position: 'absolute',
        top: 25,
        left: -55
    },
    arrowRight: {
        position: 'absolute',
        top: 25,
        right: -55
    },
    arrowTop: {
        position: 'absolute',
        top: -55,
        left: 25
    },
    arrowBottom: {
        position: 'absolute',
        bottom: -55,
        left: 25
    },
    icon: {
        color: 'cyan'
    }
});
