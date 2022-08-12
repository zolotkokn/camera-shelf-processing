import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Image } from 'react-native';

export const padding = (a: number, b: number, c: number, d: number) => {
    return {
        paddingTop: a,
        paddingRight: b ? b : a,
        paddingBottom: c ? c : a,
        paddingLeft: d ? d : (b ? b : a)
    };
};

interface IObject {
    [key: string]: string | number;
}

export const setStorageData = async (key: string, value: IObject | any) => {
    try {
        const jsonValue = JSON.stringify(value);
        await AsyncStorage.setItem(key, jsonValue);
    } catch (e) {
        console.log('error save AsyncStorage:', key, e);
    }
};

export const getStorageData = async (key: string) => {
    try {
        const jsonValue = await AsyncStorage.getItem(key);
        return jsonValue !== null ? JSON.parse(jsonValue) : null;
    } catch (e) {
        console.log('error read AsyncStorage:', key, e);
        return null;
    }
};

export const getSource = (source: string) => Platform.OS === 'android' ?  `file://${source}` : source;

export const getImageSize = (uri: string): Promise<{ width: number, height: number }> => {
    return new Promise((resolve, reject) => {
        Image.getSize(uri, (width, height) => {
            resolve({width, height});
        }, reject);
    });
};
