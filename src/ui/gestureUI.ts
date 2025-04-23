/**
 * 鼠标手势UI管理模块
 * 负责轨迹显示和提示窗口的创建与更新
 */

import { IObject } from "siyuan";
import { GesturePoint, GestureDirection } from '../types';
import { GESTURE_TOOLTIPS } from '../constants';

export class GestureUI {
    private trackElement: HTMLElement | null = null;
    private tooltipElement: HTMLElement | null = null;
    
    /**
     * 创建轨迹元素
     */
    public createTrackElement(): void {

        // 移除可能存在的旧元素
        this.removeTrackElement();
        
        // 创建新的轨迹元素
        this.trackElement = document.createElement('div');
        this.trackElement.className = 'mouse-gesture-track';
        this.trackElement.style.position = 'fixed';
        this.trackElement.style.top = '0';
        this.trackElement.style.left = '0';
        this.trackElement.style.width = '100%';
        this.trackElement.style.height = '100%';
        this.trackElement.style.pointerEvents = 'none';
        this.trackElement.style.zIndex = '9999';
        document.body.appendChild(this.trackElement);
    }
    
    /**
     * 更新轨迹显示
     * @param gestureTrack 手势轨迹点数组
     * @param isValidGestureWithAction 是否是有效手势且有对应操作
     */
    public updateTrackElement(gestureTrack: GesturePoint[], isValidGestureWithAction: boolean): void {
        if (!this.trackElement || gestureTrack.length < 2) return;
        
        // 清除旧的轨迹
        this.trackElement.innerHTML = '';
        
        // 创建SVG元素
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');
        svg.style.position = 'absolute';
        svg.style.top = '0';
        svg.style.left = '0';
        
        // 创建路径
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        let d = `M ${gestureTrack[0].x} ${gestureTrack[0].y}`;
        
        for (let i = 1; i < gestureTrack.length; i++) {
            d += ` L ${gestureTrack[i].x} ${gestureTrack[i].y}`;
        }
        
        path.setAttribute('d', d);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', isValidGestureWithAction ? '#4CAF50' : '#9E9E9E');
        path.setAttribute('stroke-width', '3');
        path.setAttribute('stroke-linecap', 'round');
        path.setAttribute('stroke-linejoin', 'round');
        
        svg.appendChild(path);
        this.trackElement.appendChild(svg);
    }
    
    /**
     * 移除轨迹元素
     */
    public removeTrackElement(): void {
        if (this.trackElement && this.trackElement.parentNode) {
            this.trackElement.parentNode.removeChild(this.trackElement);
            this.trackElement = null;
        }
    }
    
    /**
     * 创建提示窗口
     */
    public createTooltipElement(): void {
        
        // 移除可能存在的旧元素
        this.removeTooltipElement();
        
        // 创建新的提示窗口
        this.tooltipElement = document.createElement('div');
        this.tooltipElement.className = 'mouse-gesture-tooltip';
        this.tooltipElement.style.position = 'fixed';
        this.tooltipElement.style.padding = '5px 10px';
        this.tooltipElement.style.background = 'rgba(0, 0, 0, 0.7)';
        this.tooltipElement.style.color = 'white';
        this.tooltipElement.style.borderRadius = '4px';
        this.tooltipElement.style.fontSize = '14px';
        this.tooltipElement.style.pointerEvents = 'none';
        this.tooltipElement.style.zIndex = '10000';
        this.tooltipElement.style.display = 'none';
        document.body.appendChild(this.tooltipElement);
    }
    
    /**
     * 更新提示窗口
     * @param x 鼠标X坐标
     * @param y 鼠标Y坐标
     * @param isValidGesture 是否是有效手势
     * @param gestureDirection 手势方向
     * @param i18n 语言
     * @param hasAssociatedAction 是否有关联操作
     */
    public updateTooltipElement(
        x: number, 
        y: number, 
        isValidGesture: boolean, 
        gestureDirection: GestureDirection, 
        i18n: IObject,
        hasAssociatedAction: boolean = true
    ): void {
        if (!this.tooltipElement) return;
        
        // 更新位置
        this.tooltipElement.style.left = `${x + 15}px`;
        this.tooltipElement.style.top = `${y + 15}px`;
        
        // 更新内容和显示状态
        if (isValidGesture && gestureDirection) {
            // 检查是否是复合手势
            if (gestureDirection.includes('-')) {
                const directions = gestureDirection.split('-');
                const dirKey1 = directions[0];
                const dirKey2 = directions[1];
                
                // 在语言包中查找对应的复合手势描述
                const tooltipKey = `${directions[0]}-${directions[1]}`;
                
                // 如果有特定的复合手势提示，使用它；否则组合两个方向的描述
                if (i18n[tooltipKey]) {
                    this.tooltipElement.textContent = i18n[tooltipKey];
                } else {
                    // 组合两个方向的描述
                    const dir1Name = i18n[dirKey1] || dirKey1;
                    const dir2Name = i18n[dirKey2] || dirKey2;
                    this.tooltipElement.textContent = `${dir1Name} → ${dir2Name}`;
                }
            } else {
                // 简单手势
                const tooltipKey = GESTURE_TOOLTIPS[gestureDirection];
                this.tooltipElement.textContent = tooltipKey ? i18n[tooltipKey] || gestureDirection : gestureDirection;
            }

            // 如果没有关联操作，添加无操作标记
            if (!hasAssociatedAction) {
                const noActionText = i18n['noAction'] || 'No Action';
                this.tooltipElement.textContent += ` (${noActionText})`;
                this.tooltipElement.style.color = '#ff9800'; // 警告色
            } else {
                this.tooltipElement.style.color = 'white'; // 恢复默认颜色
            }
            
            this.tooltipElement.style.display = 'block';
        } else {
            this.tooltipElement.style.display = 'none';
        }
    }
    
    /**
     * 移除提示窗口
     */
    public removeTooltipElement(): void {
        if (this.tooltipElement && this.tooltipElement.parentNode) {
            this.tooltipElement.parentNode.removeChild(this.tooltipElement);
            this.tooltipElement = null;
        }
    }

    /**
     * 隐藏提示窗口
     */
    public hideTooltip(): void {
        if (this.tooltipElement) {
            this.tooltipElement.style.display = 'none';
        }
    }
}