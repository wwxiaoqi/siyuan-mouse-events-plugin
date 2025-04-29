/**
 * 鼠标手势插件常量定义
 */

import { GestureSettings } from './types';

// 手势阈值常量
export const CONSTANTS = {
    
    // 水平方向阈值，单位像素
    HORIZONTAL_THRESHOLD: 20,
    
    // 垂直方向阈值，单位像素
    VERTICAL_THRESHOLD: 10,
};

// 手势动作类型
export const GESTURE_ACTIONS = {
    'NO_ACTION': 'noAction',
    'SCROLL_TOP': 'scrollTop',
    'SCROLL_BOTTOM': 'scrollBottom',
    'SWITCH_LEFT': 'switchLeft',
    'SWITCH_RIGHT': 'switchRight',
    'LOCATE_DOC': 'locateDoc',
    'CLOSE_TAB': 'closeTab',
    'CLOSE_ALL_TABS': 'closeAllTabs',
    'CLOSE_OTHER_TABS': 'closeOtherTabs',
    'REFRESH': 'refresh',
    'CREATE_NEW_DOCUMENT': 'createNewDocument'
};

// 手势方向名称
export const GESTURE_DIRECTIONS = {
    'left': 'left',
    'right': 'right',
    'up': 'up',
    'down': 'down',
    'down-right': 'downRight',
    'left-up': 'leftUp',
    'right-up': 'rightUp',
    'right-down': 'rightDown',
    'up-left': 'upLeft',
    'up-right': 'upRight',
    'down-left': 'downLeft',
    'left-down': 'leftDown',
    'up-down': 'upDown',
    'down-up': 'downUp',
    'left-right': 'leftRight',
    'right-left': 'rightLeft'
};

// 默认设置
export const DEFAULT_SETTINGS: GestureSettings = {
    enableGestures: true,
    showGestureTrack: true,
    showGestureTooltip: true,
    hideNoActionTooltip: true,
    debugMode: false,
    showDirectionInTooltip: false,
    horizontalThreshold: CONSTANTS.HORIZONTAL_THRESHOLD,
    verticalThreshold: CONSTANTS.VERTICAL_THRESHOLD,
    clearSelectionAfterGesture: false,
    gestureActions: {
        'left': GESTURE_ACTIONS.SWITCH_LEFT,
        'right': GESTURE_ACTIONS.SWITCH_RIGHT,
        'up': GESTURE_ACTIONS.SCROLL_TOP,
        'down': GESTURE_ACTIONS.SCROLL_BOTTOM,
        'down-right': GESTURE_ACTIONS.NO_ACTION,
        'left-up': GESTURE_ACTIONS.NO_ACTION,
        'right-up': GESTURE_ACTIONS.NO_ACTION,
        'right-down': GESTURE_ACTIONS.NO_ACTION,
        'up-left': GESTURE_ACTIONS.NO_ACTION,
        'up-right': GESTURE_ACTIONS.NO_ACTION,
        'down-left': GESTURE_ACTIONS.NO_ACTION,
        'left-down': GESTURE_ACTIONS.NO_ACTION,
        'up-down': GESTURE_ACTIONS.NO_ACTION,
        'down-up': GESTURE_ACTIONS.NO_ACTION,
        'left-right': GESTURE_ACTIONS.NO_ACTION,
        'right-left': GESTURE_ACTIONS.NO_ACTION
    }
};