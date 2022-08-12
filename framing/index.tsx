import React, { FC, useState, useMemo, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, Image, ScrollView, Button, Dimensions, ActivityIndicator } from 'react-native';
import Draggable from 'component/draggable';
import Svg, { Line } from 'react-native-svg';
import Toast from 'react-native-toast-message';

import { getSource, getStorageData, setStorageData } from 'component/helper/func';
import { getDataMatrix } from '../matrix';

import { IDataStorage, IFramingProps, IPoint } from '../types';

const POINT_SIZE = 40;
const OFFSET = 0.2;

const { width, height } = Dimensions.get('window');

const PhotoFrame: FC<IFramingProps> = (props) => {
    const [initStorage, setInitStorage] = useState<boolean>(false);
    const [points, setPoints] = useState<Array<[number, number]>>([]);
    const [circles, setCircles] = useState<Array<[number, number]>>([]);
    const [changePoint, setChangePint] = useState<boolean>(false);
    const [dataStorage, setDataStorage] = useState<IDataStorage | null>(null);
    const [pending, setPending] = useState<boolean>(false);

    useEffect(() => {
        getStorageData(props.uid).then((data) => {
            setDataStorage(data);
            if (data.points?.length) {
                const newPoints = data.points.map((point: IPoint) => [
                    point.x * width / data.photoWidth,
                    point.y * height / data.photoHeight,
                ]);

                setPoints(newPoints);
                setCircles(newPoints);
            } else {
                const h = height + height * (data.maxRow - 1) * (1 - OFFSET);
                const w = width + width * (data.maxCol - 1) * (1 - OFFSET);

                const defaultPoints: Array<[number, number]> = [
                    [0, 0],
                    [w, 0],
                    [w, h],
                    [0, h]
                ];

                setPoints(defaultPoints);
                setCircles(defaultPoints);
            }
            setInitStorage(true);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onPressSaveFrame = useCallback(() => {
        if (!dataStorage) {
            Toast.show({
                type: 'error',
                text1: 'Ошибка сохранения точек кадрирования!',
                text2: 'Данные не найдены.'
            });

            return false;
        }

        setPending(true);

        const newPoints: Array<IPoint> = points.map((point, idx) => ({
            x: point[0] * dataStorage.photoWidth / width,
            y: point[1] * dataStorage.photoHeight / height,
            number: idx + 1
        }));

        const newDataStorage = {
            ...dataStorage,
            uid: props.uid,
            points: newPoints
        };

        setStorageData(props.uid, newDataStorage)
            .then(() => {
                setPending(false);
                setChangePint(false);
            })
            .catch((err) => {
                Toast.show({
                    type: 'error',
                    text1: 'Ошибка сохранения точек кадрирования!',
                    text2: err
                });

                setPending(false);
            });
    }, [props.uid, points, dataStorage]);

    const onDragEnd = useCallback((idx: number, x: number, y: number) => {
        const newPoints = [...points];
        newPoints[idx] = [x + POINT_SIZE / 2, y + POINT_SIZE / 2];
        setPoints(newPoints);
        if (!changePoint) {
            setChangePint(true);
        }
    }, [points, changePoint]);

    const elPoints = useMemo(() => {
        return circles.map((point, idx) => {
            const [x, y] = point;

            return (
                <Draggable
                    key={`point${idx}`}
                    index={idx}
                    initX={x - POINT_SIZE / 2}
                    initY={y - POINT_SIZE / 2}
                    onDragEnd={onDragEnd}
                />
            );
        });
    }, [circles, onDragEnd]);

    const elLines = useMemo(() => {
        return points.map((point, idx) => {
            const i = (idx === points.length - 1) ? 0 : idx + 1;

            return (
                <Line
                    key={idx}
                    x1={points[idx][0]}
                    y1={points[idx][1]}
                    x2={points[i][0]}
                    y2={points[i][1]}
                    stroke="cyan"
                    strokeWidth="1"
                />
            );
        });
    }, [points]);

    const elContent = useMemo(() => {
        if (!initStorage) {
            return <ActivityIndicator size="large" color="#aaa" />;
        }

        if (!dataStorage) {
            return (
                <View>
                    <Text>Данные по фотографиям не найдены, сделайте фотографии заново.</Text>
                </View>
            );
        }

        const matrix = getDataMatrix(dataStorage.matrix, dataStorage.maxRow, dataStorage.maxCol);

        const elGrid = matrix.map((row, row_idx) => {
            const elCol = row.map((source, col_idx) =>
                <View
                    key={`photos-${row_idx}-${col_idx}`}
                    style={[
                        {
                            width: col_idx > 0 ? width * (1 - OFFSET) : width,
                            height: row_idx > 0 ? height * (1 - OFFSET) : height
                        },
                    ]}
                >
                    <Image
                        source={{uri: getSource(source)}}
                        style={[
                            {
                                width,
                                height
                            },
                            col_idx > 0 && {...{left: -width * OFFSET}},
                            row_idx > 0 && {...{top: -height * OFFSET}}
                        ]}
                    />
                </View>
            );

            return (
                <View key={`grid-row-${row_idx}`} style={{flexDirection: 'row', width: '100%'}}>
                    {elCol}
                </View>
            );
        });

        return (
            <ScrollView>
                <ScrollView horizontal={true} style={{position: 'relative'}}>
                    <View style={{flexDirection: 'column'}}>
                        {elGrid}
                        <View style={styles.wrapperFon}>
                            <Svg width="100%" height="100%">
                                {elLines}
                            </Svg>
                        </View>
                        {elPoints}
                    </View>
                </ScrollView>
            </ScrollView>
        );
    }, [initStorage, dataStorage, elLines, elPoints]);

    const elButtonSave = useMemo(() => {
        if (pending) {
            return (
                <View style={styles.buttonSave}>
                    <ActivityIndicator size="large" color="#aaa" />
                </View>
            );
        }

        if (changePoint) {
            return (
                <View style={styles.buttonSave}>
                    <Button onPress={onPressSaveFrame} title="Сохранить" />
                </View>
            );
        }
    }, [changePoint, pending, onPressSaveFrame]);

    return (
        <View style={styles.container}>
            <View style={styles.wrapperBox}>
                {elContent}
            </View>
            {elButtonSave}
        </View>
    );
};

export default PhotoFrame;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#444'
    },
    wrapperBox: {
        flex: 1,
        flexDirection: 'column',
        width: '100%',
        height: '100%'
    },
    wrapperFon: {
        flex: 1,
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        resizeMode: 'contain'
    },
    buttonSave: {
        position: 'absolute',
        bottom: 40,
        alignSelf: 'center'
    },
});
