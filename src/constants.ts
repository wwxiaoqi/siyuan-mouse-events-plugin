/**
 * 鼠标手势插件常量定义
 */

// 手势阈值常量
export const CONSTANTS = {
    // 滚动阈值，单位像素
    SCROLL_THRESHOLD: 50,
    
    // 水平方向阈值，单位像素
    HORIZONTAL_THRESHOLD: 50,
    
    // 最小有效手势长度
    MIN_GESTURE_LENGTH: 30,
    
    // 方向变化阈值，单位毫秒
    DIRECTION_CHANGE_THRESHOLD: 300
};

// 手势提示文本
export const GESTURE_TOOLTIPS = {
    'up': 'uptooltipText',
    'down': 'downtooltipText',
    'left': 'lefttooltipText',
    'right': 'righttooltipText'
};
