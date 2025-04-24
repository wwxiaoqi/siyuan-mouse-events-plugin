/**
 * 鼠标手势插件类型定义
 */

// 手势轨迹点类型
export interface GesturePoint {
    x: number;
    y: number;
}

// 手势方向类型
export type GestureDirection = 
    'up' | 'down' | 'left' | 'right' | 
    'down-right' | 'left-up' | 'right-up' | 'right-down' | 
    'up-left' | 'up-right' | 'down-left' | 'left-down' | 
    'up-down' | 'down-up' | 'left-right' | 'right-left' | 
    '';

// 手势设置类型
export interface GestureSettings {
    enableGestures: boolean;
    showGestureTrack: boolean;
    showGestureTooltip: boolean;
    hideNoActionTooltip: boolean;
    debugMode: boolean;
    showDirectionInTooltip: boolean;
    gestureActions: {
        [key: string]: string;
    };
}
