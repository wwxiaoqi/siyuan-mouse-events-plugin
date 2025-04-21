/**
 * 鼠标事件处理模块
 * 负责鼠标事件的处理和响应
 */

import { IObject } from "siyuan";
import { GesturePoint, GestureDirection } from '../types';
import { CONSTANTS } from '../constants';
import { GestureUI } from '../ui/gestureUI';
import { handleScrollClick, getCurrentDocId, locateCurrentDocInTree, handleTabSwitch } from '../utils/dom';

export class MouseEventHandler {
    private i18n: IObject;

    private rightMouseDown: boolean = false;
    private gestureTrack: GesturePoint[] = [];
    private isValidGesture: boolean = false;
    private gestureDirection: GestureDirection = '';

    // UI管理器
    private gestureUI: GestureUI;
    
    constructor(i18n: IObject) {
        this.i18n = i18n;
        this.gestureUI = new GestureUI();
    }
    
    /**
     * 注册鼠标事件监听
     */
    public registerEvents(): void {
        document.addEventListener("mousedown", this.handleMouseDown, true);
        document.addEventListener("mouseup", this.handleMouseUp, true);
        document.addEventListener("mousemove", this.handleMouseMove, true);
        document.addEventListener("auxclick", this.handleMiddleClick, true);
    }
    
    /**
     * 注销鼠标事件监听
     */
    public unregisterEvents(): void {
        document.removeEventListener("mousedown", this.handleMouseDown, true);
        document.removeEventListener("mouseup", this.handleMouseUp, true);
        document.removeEventListener("mousemove", this.handleMouseMove, true);
        document.removeEventListener("auxclick", this.handleMiddleClick, true);
    }
    
    /**
     * 处理鼠标按下事件
     */
    private handleMouseDown = (event: MouseEvent): void => {

        // 右键按下
        if (event.button === 2) {
            this.rightMouseDown = true;
            this.gestureTrack = [{x: event.clientX, y: event.clientY}];
            this.isValidGesture = false;
            this.gestureDirection = '';
            
            // 创建轨迹元素和提示窗口
            this.gestureUI.createTrackElement();
            this.gestureUI.createTooltipElement();

            // 阻止默认的右键菜单
            event.preventDefault();
        }
    }
    
    /**
     * 处理鼠标释放事件
     */
    private handleMouseUp = (event: MouseEvent): void => {

        // 右键释放
        if (event.button === 2 && this.rightMouseDown) {

            // 阻止默认的右键菜单
            event.preventDefault();

            // 如果是有效手势，执行相应操作
            if (this.isValidGesture) {
                
                if (this.gestureDirection === 'up') {
                    // scrollToTop();
                    handleScrollClick('up');

                } else if (this.gestureDirection === 'down') {
                    // scrollToBottom();
                    handleScrollClick('down');

                } else if (this.gestureDirection === 'left') {
                    // switchTabLeft(this.i18n);
                    handleTabSwitch('left', this.i18n);


                } else if (this.gestureDirection === 'right') {
                    // switchTabRight(this.i18n);
                    handleTabSwitch('right', this.i18n);

                }
            }
            
            // 清理轨迹和提示窗口
            this.gestureUI.removeTrackElement();
            this.gestureUI.removeTooltipElement();
            
            this.rightMouseDown = false;
            this.gestureTrack = [];
        }
    }
    
    /**
     * 处理鼠标移动事件
     */
    private handleMouseMove = (event: MouseEvent): void => {

        // 只在右键按下时处理
        if (!this.rightMouseDown) {
            return;
        }
        
        // 记录轨迹点
        this.gestureTrack.push({x: event.clientX, y: event.clientY});
        
        // 更新轨迹显示
        this.gestureUI.updateTrackElement(this.gestureTrack, this.isValidGesture);
        
        // 判断手势是否有效
        this.evaluateGesture();
        
        // 更新提示窗口
        this.gestureUI.updateTooltipElement(
            event.clientX, 
            event.clientY, 
            this.isValidGesture, 
            this.gestureDirection, 
            this.i18n
        );
    }
    
    /**
     * 处理鼠标中键点击事件
     */
    private handleMiddleClick = (event: MouseEvent): void => {
        // 中键点击
        if (event.button === 1) {
            // 检查文档树是否打开
            const fileTree = document.querySelector('.layout__fileTree');
            if (fileTree) {
                // 获取当前打开的文档ID
                const currentDocId = getCurrentDocId();
                if (currentDocId) {
                    // 定位到文档树中的当前文档
                    locateCurrentDocInTree(currentDocId, this.i18n);
                    event.preventDefault();
                }
            }
        }
    }
    
    /**
     * 评估手势是否有效
     */
    private evaluateGesture(): void {
        if (this.gestureTrack.length < 2) return;
        
        // 计算手势的总长度
        let totalLength = 0;
        for (let i = 1; i < this.gestureTrack.length; i++) {
            const dx = this.gestureTrack[i].x - this.gestureTrack[i-1].x;
            const dy = this.gestureTrack[i].y - this.gestureTrack[i-1].y;
            totalLength += Math.sqrt(dx*dx + dy*dy);
        }
        
        // 如果手势太短，认为无效
        if (totalLength < CONSTANTS.MIN_GESTURE_LENGTH) {
            this.isValidGesture = false;
            return;
        }
        
        // 计算起点和终点
        const startPoint = this.gestureTrack[0];
        const endPoint = this.gestureTrack[this.gestureTrack.length - 1];
        
        // 计算垂直和水平位移
        const deltaY = startPoint.y - endPoint.y;
        const deltaX = startPoint.x - endPoint.x;
        
        // 判断是否是垂直手势（垂直分量大于水平分量的2倍）
        if (Math.abs(deltaY) > Math.abs(deltaX) * 2) {
            if (deltaY > CONSTANTS.SCROLL_THRESHOLD) {
                this.isValidGesture = true;
                this.gestureDirection = 'up';
            } else if (deltaY < -CONSTANTS.SCROLL_THRESHOLD) {
                this.isValidGesture = true;
                this.gestureDirection = 'down';
            } else {
                this.isValidGesture = false;
            }
        }

        // 判断是否是水平手势（水平分量大于垂直分量的2倍）
        else if (Math.abs(deltaX) > Math.abs(deltaY) * 2) {
            if (deltaX > CONSTANTS.HORIZONTAL_THRESHOLD) {
                this.isValidGesture = true;
                this.gestureDirection = 'left';
            } else if (deltaX < -CONSTANTS.HORIZONTAL_THRESHOLD) {
                this.isValidGesture = true;
                this.gestureDirection = 'right';
            } else {
                this.isValidGesture = false;
            }
        } else {
            this.isValidGesture = false;
        }
    }
    
}