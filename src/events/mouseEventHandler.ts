/**
 * 鼠标事件处理模块
 * 负责鼠标事件的处理和响应
 */

import { IObject } from "siyuan";
import { GesturePoint, GestureDirection, GestureSettings } from '../types';
import { CONSTANTS, GESTURE_ACTIONS } from '../constants';
import { GestureUI } from '../ui/gestureUI';
import { handleScrollClick, getCurrentDocId, locateCurrentDocInTree, handleTabSwitch, closeCurrentTab, closeAllTabs, closeOtherTabs } from '../utils/dom';

export class MouseEventHandler {
    private i18n: IObject;
    private settings: GestureSettings;

    private rightMouseDown: boolean = false;
    private gestureTrack: GesturePoint[] = [];
    private isValidGesture: boolean = false;
    private gestureDirection: GestureDirection = '';

    // UI管理器
    private gestureUI: GestureUI;

    constructor(i18n: IObject, settings: GestureSettings) {
        this.i18n = i18n;
        this.settings = settings;
        this.gestureUI = new GestureUI();
    }

    /**
     * 更新设置
     * @param settings 新的设置
     */
    public updateSettings(settings: GestureSettings): void {
        this.settings = settings;
    }

    /**
     * 注册鼠标事件监听
     */
    public registerEvents(): void {
        document.addEventListener("mousedown", this.handleMouseDown, false);
        document.addEventListener("mouseup", this.handleMouseUp, false);
        document.addEventListener("mousemove", this.handleMouseMove, false);
        document.addEventListener("auxclick", this.handleMiddleClick, false);
    }

    /**
     * 注销鼠标事件监听
     */
    public unregisterEvents(): void {
        document.removeEventListener("mousedown", this.handleMouseDown, false);
        document.removeEventListener("mouseup", this.handleMouseUp, false);
        document.removeEventListener("mousemove", this.handleMouseMove, false);
        document.removeEventListener("auxclick", this.handleMiddleClick, false);
    }

    /**
     * 处理鼠标按下事件
     */
    private handleMouseDown = (event: MouseEvent): void => {

        // 如果手势被禁用，直接返回
        if (!this.settings.enableGestures) {
            return;
        }

        // 右键按下
        if (event.button === 2) {
            this.rightMouseDown = true;
            this.gestureTrack = [{ x: event.clientX, y: event.clientY }];
            this.isValidGesture = false;
            this.gestureDirection = '';

            // 创建轨迹元素
            if (this.settings.showGestureTrack) {
                this.gestureUI.createTrackElement();
            }

            // 创建提示窗口
            if (this.settings.showGestureTooltip) {
                this.gestureUI.createTooltipElement();
            }

            // 不阻止默认的右键菜单，允许普通右键点击显示菜单
            // event.preventDefault();
        }
    }

    /**
     * 处理鼠标释放事件
     */
    private handleMouseUp = (event: MouseEvent): void => {

        // 如果手势被禁用，直接返回
        if (!this.settings.enableGestures) {
            return;
        }

        // 右键释放
        if (event.button === 2 && this.rightMouseDown) {

            // 如果是有效手势，执行相应操作
            if (this.isValidGesture) {
                event.preventDefault();

                // 获取当前方向的配置操作
                const action = this.settings.gestureActions[this.gestureDirection] || GESTURE_ACTIONS.NO_ACTION;

                // 只有当操作不是无操作时，才执行相应操作
                if (action !== GESTURE_ACTIONS.NO_ACTION) {
                    this.executeGestureAction(action);
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
     * 执行手势动作
     * @param action 要执行的动作
     */
    private executeGestureAction(action: string): void {
        switch (action) {
            case GESTURE_ACTIONS.SCROLL_TOP:
                handleScrollClick('up');
                break;
            case GESTURE_ACTIONS.SCROLL_BOTTOM:
                handleScrollClick('down');
                break;
            case GESTURE_ACTIONS.SWITCH_LEFT:
                handleTabSwitch('left', this.i18n);
                break;
            case GESTURE_ACTIONS.SWITCH_RIGHT:
                handleTabSwitch('right', this.i18n);
                break;
            case GESTURE_ACTIONS.LOCATE_DOC:
                const currentDocId = getCurrentDocId();
                if (currentDocId) {
                    locateCurrentDocInTree(currentDocId, this.i18n);
                }
                break;
            case GESTURE_ACTIONS.CLOSE_TAB:
                closeCurrentTab();
                break;
            case GESTURE_ACTIONS.CLOSE_ALL_TABS:
                closeAllTabs();
                break;
            case GESTURE_ACTIONS.CLOSE_OTHER_TABS:
                closeOtherTabs();
                break;
            default:
                // 未知操作不执行任何动作
                break;
        }
    }

    /**
     * 处理鼠标移动事件
     */
    private handleMouseMove = (event: MouseEvent): void => {

        // 如果手势被禁用，直接返回
        if (!this.settings.enableGestures) {
            return;
        }

        // 只在右键按下时处理
        if (!this.rightMouseDown) {
            return;
        }

        // 记录轨迹点
        this.gestureTrack.push({ x: event.clientX, y: event.clientY });

        // 保存当前手势状态
        const wasValidGesture = this.isValidGesture;

        // 判断手势是否有效
        this.evaluateGesture();

        // 检查当前手势对应的操作是否为无操作
        const hasAssociatedAction = this.checkHasAssociatedAction();

        // 更新轨迹显示，传入是否有关联操作的信息
        if (this.settings.showGestureTrack) {
            this.gestureUI.updateTrackElement(this.gestureTrack, this.isValidGesture && hasAssociatedAction);
        }
        
        // 如果手势变为有效，阻止默认右键菜单
        if (!wasValidGesture && this.isValidGesture) {
            event.preventDefault();
        }

        // 更新提示窗口 - 如果设置了隐藏无操作提示且当前手势没有关联操作，则不显示提示
        if (this.settings.showGestureTooltip && !(this.settings.hideNoActionTooltip && !hasAssociatedAction)) {
            this.gestureUI.updateTooltipElement(
                event.clientX, 
                event.clientY, 
                this.isValidGesture,
                this.gestureDirection,
                this.i18n,
                hasAssociatedAction,
                this.settings.gestureActions
            );
        } else if (this.settings.hideNoActionTooltip && !hasAssociatedAction) {
            // 隐藏提示窗口
            this.gestureUI.hideTooltip();
        }
    }

    /**
     * 检查当前手势是否有关联的操作
     * @returns 是否有关联操作
     */
    private checkHasAssociatedAction(): boolean {
        if (this.isValidGesture && this.gestureDirection) {
            const action = this.settings.gestureActions[this.gestureDirection];
            return Boolean(action) && action !== GESTURE_ACTIONS.NO_ACTION;
        }
        return false;
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
            const dx = this.gestureTrack[i].x - this.gestureTrack[i - 1].x;
            const dy = this.gestureTrack[i].y - this.gestureTrack[i - 1].y;
            totalLength += Math.sqrt(dx * dx + dy * dy);
        }

        // 如果手势太短，认为无效
        if (totalLength < CONSTANTS.MIN_GESTURE_LENGTH) {
            this.isValidGesture = false;
            return;
        }

        // 分析手势轨迹，检测复合手势
        this.analyzeGestureTrack();
    }

    /**
     * 分析手势轨迹，检测方向变化
     */
    private analyzeGestureTrack(): void {
        if (this.gestureTrack.length < 2) return;

        // 将轨迹分成若干段，每段识别一个主方向
        const segments = this.segmentTrack();

        // 如果只有一个段，则为简单手势
        if (segments.length === 1) {
            const direction = segments[0] as GestureDirection;
            this.gestureDirection = direction;
            this.isValidGesture = direction !== '';
            return;
        }

        // 如果有两个段，则为复合手势
        if (segments.length === 2) {
            // 组合两个方向段为复合手势
            const combinedDirection = `${segments[0]}-${segments[1]}` as GestureDirection;
            this.gestureDirection = combinedDirection;
            this.isValidGesture = true;
            return;
        }

        // 对于更复杂的情况，只使用前两个显著方向段
        if (segments.length > 2) {
            const combinedDirection = `${segments[0]}-${segments[1]}` as GestureDirection;
            this.gestureDirection = combinedDirection;
            this.isValidGesture = true;
        }
    }

    /**
     * 计算两点之间的垂直和水平位移
     * @param startPoint 起点
     * @param endPoint 终点
     * @returns 位移对象 {deltaX, deltaY}
     */
    private calculateDelta(startPoint: GesturePoint, endPoint: GesturePoint): { deltaX: number, deltaY: number } {
        return {
            deltaX: startPoint.x - endPoint.x,
            deltaY: startPoint.y - endPoint.y
        };
    }

    /**
     * 将轨迹分段，每段识别一个主方向
     * @returns 主方向数组
     */
    private segmentTrack(): string[] {
        const segments: string[] = [];

        // 如果轨迹点太少，无法分段
        if (this.gestureTrack.length < 3) {
            // 计算起点和终点
            const startPoint = this.gestureTrack[0];
            const endPoint = this.gestureTrack[this.gestureTrack.length - 1];

            // 计算垂直和水平位移
            const { deltaX, deltaY } = this.calculateDelta(startPoint, endPoint);

            // 添加简单方向
            segments.push(this.getDirection(deltaX, deltaY));
            return segments;
        }

        // 根据角度变化划分段
        let currentDirection = '';
        let segmentStart = 0;

        for (let i = 2; i < this.gestureTrack.length; i++) {
            // 计算前两点之间的角度
            const prevAngle = Math.atan2(
                this.gestureTrack[i - 1].y - this.gestureTrack[i - 2].y,
                this.gestureTrack[i - 1].x - this.gestureTrack[i - 2].x
            );

            // 计算当前两点之间的角度
            const currentAngle = Math.atan2(
                this.gestureTrack[i].y - this.gestureTrack[i - 1].y,
                this.gestureTrack[i].x - this.gestureTrack[i - 1].x
            );

            // 计算角度差（转换为度）
            let angleDiff = Math.abs(currentAngle - prevAngle) * (180 / Math.PI);

            // 调整角度差到 0-180 范围
            if (angleDiff > 180) angleDiff = 360 - angleDiff;

            // 如果角度差大于阈值，认为是方向变化
            if (angleDiff > 60) {
                // 计算当前段的主方向
                const startPoint = this.gestureTrack[segmentStart];
                const endPoint = this.gestureTrack[i - 1];

                // 计算垂直和水平位移
                const { deltaX, deltaY } = this.calculateDelta(startPoint, endPoint);

                // 获取主方向
                const direction = this.getDirection(deltaX, deltaY);

                // 如果方向有效且与上一段不同，添加到段列表
                if (direction && direction !== currentDirection) {
                    segments.push(direction);
                    currentDirection = direction;

                    // 最多识别两个方向变化
                    if (segments.length >= 2) break;

                    // 更新段起点
                    segmentStart = i - 1;
                }
            }
        }

        // 处理最后一段
        if (segmentStart < this.gestureTrack.length - 1) {
            const startPoint = this.gestureTrack[segmentStart];
            const endPoint = this.gestureTrack[this.gestureTrack.length - 1];

            // 计算垂直和水平位移
            const { deltaX, deltaY } = this.calculateDelta(startPoint, endPoint);

            // 获取主方向
            const direction = this.getDirection(deltaX, deltaY);

            // 如果方向有效且与上一段不同，添加到段列表
            if (direction && direction !== currentDirection) {
                segments.push(direction);
            }
        }

        // 如果没有找到有效段，尝试整体方向
        if (segments.length === 0) {
            const startPoint = this.gestureTrack[0];
            const endPoint = this.gestureTrack[this.gestureTrack.length - 1];

            // 计算垂直和水平位移
            const { deltaX, deltaY } = this.calculateDelta(startPoint, endPoint);

            // 获取主方向
            const direction = this.getDirection(deltaX, deltaY);
            if (direction) {
                segments.push(direction);
            }
        }
        return segments;
    }

    /**
     * 根据位移获取主方向
     * @param deltaX 水平位移
     * @param deltaY 垂直位移
     * @returns 主方向字符串
     */
    private getDirection(deltaX: number, deltaY: number): string {
        // 计算总位移大小
        const displacement = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        // 如果位移太小，认为没有方向
        if (displacement < CONSTANTS.MIN_GESTURE_LENGTH) {
            return '';
        }

        // 判断是否是垂直手势（垂直分量大于水平分量的2倍）
        if (Math.abs(deltaY) > Math.abs(deltaX) * 2) {
            if (deltaY > CONSTANTS.SCROLL_THRESHOLD) {
                return 'up';
            } else if (deltaY < -CONSTANTS.SCROLL_THRESHOLD) {
                return 'down';
            }
        }
        // 判断是否是水平手势（水平分量大于垂直分量的2倍）
        else if (Math.abs(deltaX) > Math.abs(deltaY) * 2) {
            if (deltaX > CONSTANTS.HORIZONTAL_THRESHOLD) {
                return 'left';
            } else if (deltaX < -CONSTANTS.HORIZONTAL_THRESHOLD) {
                return 'right';
            }
        }
        // 对角线手势
        else {
            // 基于角度判断对角线方向
            const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

            if (angle >= 45 && angle < 135) {
                return 'up'; // 向上
            } else if (angle >= -45 && angle < 45) {
                return 'left'; // 向左
            } else if (angle >= -135 && angle < -45) {
                return 'down'; // 向下
            } else {
                return 'right'; // 向右
            }
        }
        return '';
    }
}