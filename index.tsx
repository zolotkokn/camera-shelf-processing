import React, {useCallback, useLayoutEffect, useMemo, useRef, useState} from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Alert, Dimensions, ActivityIndicator, Pressable } from 'react-native';
import Toast from 'react-native-toast-message';

import { Camera as CameraVision } from 'react-native-vision-camera/lib/typescript/Camera';

import { getStorageData, setStorageData, getSource, getImageSize } from './funcs';
import Header from './header';
import Camera from './camera';
import Matrix, { getDataMatrix } from './matrix';
import PhotoFrame from './framing';
import { loggerJson } from 'component/helper/func'; // todo delete

import { IProps, IDataStorage, TMatrix, IScreen } from './types';

const { width, height } = Dimensions.get('window');
const MATRIX_SIZE = 10;

export const getDataShelfProcessing = (uid: string) => {
    return getStorageData(uid);
};

const CameraShelfProcessing = (props: IProps) => {
    const cameraRef = useRef<CameraVision>(null);

    const [initStorage, setInitStorage] = useState<boolean>(false);
    const [dataStorage, setDataStorage] = useState<IDataStorage | null>(null);
    const [screen, setScreen] = useState<IScreen>('CAMERA');
    const [pendingPhoto, setPendingPhoto] = useState<boolean>(false);
    const [matrix, setMatrix] = useState<TMatrix>(Array.from({ length: MATRIX_SIZE }, () => (Array.from({ length: MATRIX_SIZE }, () => ''))));
    const [idxRow, setIdxRow] = useState<number>(0);
    const [idxCol, setIdxCol] = useState<number>(0);
    const [maxRow, setMaxRow] = useState<number>(1);
    const [maxCol, setMaxCol] = useState<number>(1);

    useLayoutEffect(() => {
        console.log('props.uid:', props.uid);
        getStorageData(props.uid).then((data) => {
            const newData = {...data};
            if (data) {

                let newPropsMatrix = [...matrix];
                props.matrix.map((row_item, row_idx) =>
                    row_item.map((src, col_idx) => {
                        newPropsMatrix[row_idx][col_idx] = src;
                    })
                );

                setMaxRow(data.maxRow);
                setMaxCol(data.maxCol);
                newData.points = props.points.length && props.points || data.points.length && data.points;
                setMatrix(props.matrix.length && newPropsMatrix || data.matrix.length && data.matrix);
            }
            loggerJson('DATA', newData);
            setDataStorage(newData);
            setInitStorage(true);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const takePicture = useCallback(async () => {
        if (!pendingPhoto && cameraRef && cameraRef.current) {
            setPendingPhoto(true);
            const photo = await cameraRef.current.takePhoto({flash: 'on'});
            const source = getSource(photo.path);
            console.log('source src:', `${idxRow}_${idxCol}.jpg`, source);

            const newMatrix = [...matrix];
            newMatrix[idxRow][idxCol] = photo.path;

            const imageSize = await getImageSize(getSource(photo.path));

            const newDataStorage = {
                ...dataStorage,
                uid: props.uid,
                points: dataStorage?.points || [],
                matrix: newMatrix,
                maxRow: maxRow,
                maxCol: maxCol,
                matrixFull: checkMatrix(newMatrix),
                photoWidth: imageSize.width,
                photoHeight: imageSize.height
            };

            setStorageData(props.uid, newDataStorage)
                .then(() => {
                    setDataStorage(newDataStorage);
                    setMatrix(newMatrix);
                    setPendingPhoto(false);

                    if (props.noMatrix) {
                        onPressScreenFraming();
                    }
                })
                .catch(() => {
                    setPendingPhoto(false);
                });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dataStorage, matrix, cameraRef, idxRow, idxCol, maxRow, maxCol, pendingPhoto, props.uid]);

    const checkMatrix = (_matrix: TMatrix) => {
        const noSrcCount = _matrix.filter((row, row_idx) =>
            row_idx < maxRow && row.filter((col, col_idx) =>
                col_idx < maxCol && col === ''
            ).length
        ).length;

        return noSrcCount === 0;
    };

    const onPressMenuItem = (_screen: IScreen): void => {
        switch (_screen) {
            case 'CAMERA': setScreen('CAMERA'); break;
            case 'PHOTOS': setScreen('PHOTOS'); break;
            case 'FRAMING': onPressScreenFraming(); break;
            case 'OVERALL_PLAN': onPressScreenOverallPlan(); break;
            default: setScreen('CAMERA'); break;
        }
    };

    const onPressScreenFraming = () => {
        if (!matrix[0][0]) {
            Toast.show({type: 'error', text1: 'Нет ни одной фотографии для кадрирования'});

            return false;
        }

        setScreen('FRAMING');
    };

    const onPressScreenOverallPlan = () => {
        if (!checkMatrix(matrix)) {
            Alert.alert(
                'Сфотографируйте все блоки матрицы!',
                'Проверьте по матрице все ли фотографии стеллажа сделаны, убедитесь что в матрице нет желтых пустых квадратов.'
            );

            return false;
        }

        setScreen('OVERALL_PLAN');
    };

    const elPartPhoto = useMemo(() => {
        return (
            <>
                <View style={[styles.wrapperFon, {overflow: 'hidden'}]}>
                    {idxRow > 0 && Boolean(matrix[idxRow - 1][idxCol]) && (
                        <Image
                            source={{uri: getSource(matrix[idxRow - 1][idxCol])}}
                            style={[styles.partPhoto, {top: `-${100 - props.photoOverlayPercentage}%`}]}
                        />
                    )}
                </View>
                <View style={[styles.wrapperFon, {overflow: 'hidden'}]}>
                    {idxRow < maxRow - 1 && Boolean(matrix[idxRow + 1][idxCol]) && (
                        <Image
                            source={{uri: getSource(matrix[idxRow + 1][idxCol])}}
                            style={[styles.partPhoto, {top: `${100 - props.photoOverlayPercentage}%`}]}
                        />
                    )}
                </View>
                <View style={[styles.wrapperFon, {overflow: 'hidden'}]}>
                    {idxCol > 0 && Boolean(matrix[idxRow][idxCol - 1]) && (
                        <Image
                            source={{uri: getSource(matrix[idxRow][idxCol - 1])}}
                            style={[styles.partPhoto, {left: `-${100 - props.photoOverlayPercentage}%`}]}
                        />
                    )}
                </View>
                <View style={[styles.wrapperFon, {overflow: 'hidden'}]}>
                    {idxCol < maxCol - 1 && Boolean(matrix[idxRow][idxCol + 1]) && (
                        <Image
                            source={{uri: getSource(matrix[idxRow][idxCol + 1])}}
                            style={[styles.partPhoto, {left: `${100 - props.photoOverlayPercentage}%`}]}
                        />
                    )}
                </View>
            </>
        );
    }, [props.photoOverlayPercentage, matrix, idxRow, idxCol, maxCol, maxRow]);

    const elViewPhoto = useMemo(() => {
        if (matrix[idxRow][idxCol] !== '') {
            return (
                <Image source={{uri: getSource(matrix[idxRow][idxCol])}} style={{width: width, height: height}} />
            );
        }

        return (
            <View><Text>Фото не обнаружено!</Text></View>
        );
    }, [matrix, idxRow, idxCol]);

    const elButtonSnap = useMemo(() => {
        if (pendingPhoto) {
            return (
                <View style={styles.buttonSnapLoader}>
                    <ActivityIndicator size="large" color="#aaa" />
                    <Text style={{color: 'white', shadowColor: '#000'}}>Сохраненяем фото...</Text>
                </View>
            );
        }

        return (
            <View style={styles.wrapperFon}>
                <Pressable onPress={takePicture} style={styles.buttonSnap} />
            </View>
        );
    }, [pendingPhoto, takePicture]);

    const elMatrix = useMemo(() => {
        if (!pendingPhoto) {
            return (
                <View style={styles.wrapperFon}>
                    <Matrix
                        isPhotosScreen={screen === 'PHOTOS'}
                        size={MATRIX_SIZE}
                        matrix={matrix}
                        idxRow={idxRow}
                        setIdxRow={setIdxRow}
                        idxCol={idxCol}
                        setIdxCol={setIdxCol}
                        maxRow={maxRow}
                        setMaxRow={setMaxRow}
                        maxCol={maxCol}
                        setMaxCol={setMaxCol}
                    />
                </View>
            );
        }
    }, [screen, matrix, idxRow, idxCol, maxRow, maxCol, pendingPhoto]);

    const elCamera = useMemo(() => {
        return (
            <>
                <Camera cameraRef={cameraRef} />
                {elPartPhoto}
                {!props.noMatrix && elMatrix}
                {elButtonSnap}
            </>
        );
    }, [cameraRef, elPartPhoto, elMatrix, elButtonSnap, props.noMatrix]);

    const elPhotos = useMemo(() => {
        return (
            <>
                {elViewPhoto}
                {elPartPhoto}
                {!props.noMatrix && elMatrix}
            </>
        );
    }, [elPartPhoto, elViewPhoto, elMatrix, props.noMatrix]);

    const elFraming = useMemo(() => {
        return (
            <PhotoFrame uid={props.uid} />
        );
    }, [props.uid]);

    const elOverallPlan = useMemo(() => {
        const _matrix = getDataMatrix(matrix, maxRow, maxCol);

        const elGrid = _matrix.map((row, row_idx) => {
            const elCol = row.map((source, col_idx) =>
                <Image
                    key={`photos-${row_idx}-${col_idx}`}
                    source={{uri: getSource(source)}}
                    style={{width: width, height: height}}
                />
            );

            return (
                <View key={`grid-row-${row_idx}`}>
                    {elCol}
                </View>
            );
        });

        return (
            <ScrollView>
                <ScrollView horizontal={true}>
                    {elGrid}
                </ScrollView>
            </ScrollView>
        );
    }, [matrix, maxRow, maxCol]);

    const getTitle = useCallback(() => {
        switch (screen) {
            case 'CAMERA': return 'Камера';
            case 'PHOTOS': return 'Просмотр фото';
            case 'FRAMING': return 'Кадрирование';
            case 'OVERALL_PLAN': return 'Общее фото';
            default: return '';
        }
    }, [screen]);

    const getScreen = useCallback(() => {
        switch (screen) {
            case 'CAMERA': return elCamera;
            case 'PHOTOS': return elPhotos;
            case 'FRAMING': return elFraming;
            case 'OVERALL_PLAN': return elOverallPlan;
            default: return null;
        }
    }, [screen, elCamera, elPhotos, elFraming, elOverallPlan]);

    if (!initStorage) {
        return <ActivityIndicator size="large" color="#aaa" />;
    }

    return (
        <View style={styles.container}>
            <Header
                onBack={props.onPressBack}
                title={getTitle()}
                onPressMenuItem={onPressMenuItem}
                activeMenuItem={screen}
            />
            <View style={styles.wrapperBox}>
                {getScreen()}
            </View>
        </View>
    );
};

CameraShelfProcessing.defaultProps = {
    noMatrix: false,
    photoOverlayPercentage: 20,
    matrix: [],
    points: []
};

export default CameraShelfProcessing;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#000'
    },

    wrapperBox: {
        position: 'relative',
        flex: 1,
        flexDirection: 'column',
        height: '100%'
    },
    wrapperFon: {
        flex: 1,
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%'
    },
    buttonSnapLoader: {
        position: 'absolute',
        bottom: 20,
        alignSelf: 'center',
    },
    buttonSnap: {
        position: 'absolute',
        bottom: 20,
        alignSelf: 'center',
        width: 50,
        height: 50,
        borderRadius: 50,
        backgroundColor: '#aa0c0c',
        borderWidth: 1,
        borderColor: '#aaa'
    },
    partPhoto: {
        resizeMode: 'stretch',
        width: '100%',
        height: '100%',
        opacity: 0.3
    }
});
