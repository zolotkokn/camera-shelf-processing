import React, { FC, useState, useEffect, useCallback } from 'react';
import { LogBox, StyleSheet, Text, ActivityIndicator, Linking } from 'react-native';
import { Camera, useCameraDevices, CameraPermissionStatus } from 'react-native-vision-camera';

import { ICameraProps } from '../types';

LogBox.ignoreLogs(['new NativeEventEmitter']);

const PhotoCamera: FC<ICameraProps> = ({cameraRef}) => {
    const devices = useCameraDevices();
    const device = devices.back;

    const [cameraPermission, setCameraPermission] = useState<CameraPermissionStatus>();
    // const [cameraPermissionStatus, setCameraPermissionStatus] = useState<CameraPermissionStatus>('not-determined');

    useEffect(() => {
        Camera.getCameraPermissionStatus().then(setCameraPermission);
        requestCameraPermission().catch(() => {
            // todo error permission
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const requestCameraPermission = useCallback(async () => {
        const permission = await Camera.requestCameraPermission();
        console.log(`Camera permission status: ${permission}`);

        if (permission === 'denied') {
            await Linking.openSettings();
        }
        // setCameraPermissionStatus(permission);
    }, []);

    if (cameraPermission === null) {
        return <Text>Нет разрешения на использование камеры</Text>;
    }

    if (!device) {
        return <ActivityIndicator size="large" color="#aaa" />;
    }

    return (
        <Camera
            ref={cameraRef}
            style={styles.camera}
            device={device}
            photo={true}
            preset="high"
            isActive={true}
        />
    );
};

export default PhotoCamera;

const styles = StyleSheet.create({
    camera: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        backgroundColor: '#f7f7f8'
    }
});
