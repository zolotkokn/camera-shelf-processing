import React, { FC, Fragment, useState } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
    faBars,
    faXmark,
    faArrowLeft,
    faCameraAlt,
    faImage,
    faVectorSquare,
    faImages
} from '@fortawesome/free-solid-svg-icons';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

import { padding } from 'component/helper/func';
import ButtonIcon from 'component/form/button-icon';
import { BottomSheet } from './menu';

import { IScreen } from '../types';
import { IProps, IMenuItem } from './types';

const Header: FC<IProps> = ({
    title,
    onBack = null,
    onPressMenuItem,
    activeMenuItem
}) => {
    const menuItems: Array<IMenuItem> = [
        {title: 'Камера', screen: 'CAMERA', icon: faCameraAlt},
        {title: 'Фото', screen: 'PHOTOS', icon: faImage},
        {title: 'Кадрирование', screen: 'FRAMING', icon: faVectorSquare},
        {title: 'Итоговое фото', screen: 'OVERALL_PLAN', icon: faImages}
    ];

    const [showHeaderMenu, setShowHeaderMenu] = useState(false);

    const hideMenu = () => {
        setShowHeaderMenu(false);
    };

    const onPressBack = async () => {
        if (onBack) {
            await onBack();
        }
    };

    const onPressMenu = (screen: IScreen) => () => {
        hideMenu();
        onPressMenuItem && onPressMenuItem(screen);
    };

    const elMenuItem = (titleItem: string, screen: IScreen, icon: IconProp) => {
        const styleActiveItem = (activeMenuItem === screen && {...styles.activeItem}) || {};

        return (
            <Pressable onPress={onPressMenu(screen)} style={styles.menuItemWrapper} >
                <FontAwesomeIcon icon={icon} size={24} style={[ {marginRight: 20, color: '#444'}, styleActiveItem ]} />
                <Text style={[styles.menuItemText, styleActiveItem]}>
                    {titleItem}
                </Text>
            </Pressable>
        );
    };

    return (
        <>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>{title}</Text>
                {onBack && <ButtonIcon icon={faArrowLeft} onPress={onPressBack} />}
                <Pressable onPress={() => { setShowHeaderMenu(true); }}>
                    <FontAwesomeIcon icon={ showHeaderMenu ? faXmark : faBars } style={{color: 'white'}} size={24} />
                </Pressable>
            </View>

            <BottomSheet show={showHeaderMenu} height={290} onOuterClick={hideMenu}>
                <View style={styles.wrapperButtons}>
                    {menuItems.map((item) => (
                        <Fragment key={item.title}>
                            {elMenuItem(item.title, item.screen, item.icon)}
                        </Fragment>
                    ))}
                </View>
            </BottomSheet>
        </>
    );
};

export default Header;

const styles = StyleSheet.create({
    header: {
        backgroundColor: '#444',
        height: 40,
        alignItems: 'center',
        flexDirection: 'row',
        ...padding(0, 10, 0, 0),
        justifyContent: 'space-between'
    },
    headerTitle: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10,
        position: 'absolute',
        textAlign: 'center',
        width: '100%',
        left: 0
    },

    wrapperButtons: {
        padding: 20,
        alignItems: 'center',
    },
    menuItemWrapper: {
        ...padding(22, 0, 22, 0),
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#444',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%'
    },
    menuItemText: {
        fontWeight: '600',
        fontSize: 14,
        lineHeight: 16,
        color: '#444'
    },
    activeItem: {
        color: '#9874ff'
    }
});
