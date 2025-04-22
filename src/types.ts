/**
 * 鼠标手势插件类型定义
 */

// 手势轨迹点类型
export interface GesturePoint {
    x: number;
    y: number;
}

// 手势方向类型
export type GestureDirection = 'up' | 'down' | 'left' | 'right' | '';

// 手势设置类型
export interface GestureSettings {
    enableGestures: boolean;
    showGestureTrack: boolean;
    showGestureTooltip: boolean;
    gestureActions: {
        [key: string]: string;
    };
}
