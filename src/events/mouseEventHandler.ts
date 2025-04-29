/**
 * 鼠标事件处理模块
 * 负责鼠标事件的处理和响应
 */

import { IObject } from "siyuan";
import { GesturePoint, GestureDirection, GestureSettings } from '../types';
import { CONSTANTS, GESTURE_ACTIONS } from '../constants';
import { GestureUI } from '../ui/gestureUI';
import { handleScrollClick, getCurrentDocId, locateCurrentDocInTree, handleTabSwitch, closeCurrentTab, closeAllTabs, closeOtherTabs, clearTextSelection, hideContextMenu, refreshPage, createNewDocument } from '../utils/dom';

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
        
        // 如果在设置中没有水平和垂直阈值，使用默认值
        if (this.settings.horizontalThreshold === undefined) {
            this.settings.horizontalThreshold = CONSTANTS.HORIZONTAL_THRESHOLD;
        }
        
        if (this.settings.verticalThreshold === undefined) {
            this.settings.verticalThreshold = CONSTANTS.VERTICAL_THRESHOLD;
        }
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
            case GESTURE_ACTIONS.REFRESH:
                refreshPage();
                break;
            case GESTURE_ACTIONS.CREATE_NEW_DOCUMENT:
                createNewDocument();
                break;
            default:
                // 未知操作不执行任何动作
                break;
        }

        // 只有当启用清除文本选择功能时才执行
        if (this.settings.clearSelectionAfterGesture) {
            // 在手势执行完毕后，循环执行清除文本选择和隐藏右键菜单操作，持续300毫秒
            const startTime = Date.now();
            const clearSelectionInterval = setInterval(() => {
                clearTextSelection();
                hideContextMenu();
                
                // 停止循环
                if (Date.now() - startTime >= 300) {
                    clearInterval(clearSelectionInterval);
                }
            }, 100); // 每100毫秒执行一次
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
                this.settings.gestureActions,
                this.settings.showDirectionInTooltip
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

        // 计算手势的总长度和距离
        let totalLength = 0;
        const startPoint = this.gestureTrack[0];
        const endPoint = this.gestureTrack[this.gestureTrack.length - 1];
        const deltaX = endPoint.x - startPoint.x;
        const deltaY = endPoint.y - startPoint.y;
        const directDistance = Math.sqrt(
            Math.pow(deltaX, 2) + 
            Math.pow(deltaY, 2)
        );

        // 计算总轨迹长度
        for (let i = 1; i < this.gestureTrack.length; i++) {
            const dx = this.gestureTrack[i].x - this.gestureTrack[i - 1].x;
            const dy = this.gestureTrack[i].y - this.gestureTrack[i - 1].y;
            totalLength += Math.sqrt(dx * dx + dy * dy);
        }

        // 计算直线度 - 越接近1表示越直，越接近0表示越弯曲
        const straightness = directDistance / totalLength;

        // 判断是否为主要水平移动
        const isHorizontalDominant = Math.abs(deltaX) > Math.abs(deltaY);
        
        // 获取当前设置的阈值或使用默认值
        const horizontalThreshold = this.settings.horizontalThreshold || CONSTANTS.HORIZONTAL_THRESHOLD;
        const verticalThreshold = this.settings.verticalThreshold || CONSTANTS.VERTICAL_THRESHOLD;
        
        // 根据主导方向使用不同的阈值
        let minLength;
        if (isHorizontalDominant) {
            minLength = horizontalThreshold;
        } else {
            minLength = verticalThreshold;
        }

        // 如果轨迹总长度太短，认为无效
        if (totalLength < minLength) {
            this.isValidGesture = false;
            return;
        }

        // 分析手势轨迹，检测方向
        this.analyzeGestureTrack(straightness);
    }

    /**
     * 分析手势轨迹，检测方向变化
     * @param straightness 轨迹的直线度，用于调整识别灵敏度
     */
    private analyzeGestureTrack(straightness: number = 0.8): void {
        if (this.gestureTrack.length < 2) return;

        // 将轨迹分成若干段，每段识别一个主方向
        const segments = this.segmentTrack(straightness);

        // 如果没有识别出任何方向，认为手势无效
        if (segments.length === 0) {
            this.gestureDirection = '';
            this.isValidGesture = false;
            return;
        }

        // 如果只有一个段，则为简单手势
        if (segments.length === 1) {
            const direction = segments[0] as GestureDirection;
            this.gestureDirection = direction;
            this.isValidGesture = direction !== '';
            return;
        }

        // 如果有两个段，则为复合手势
        if (segments.length >= 2) {
            // 组合两个方向段为复合手势（只使用前两个段）
            const combinedDirection = `${segments[0]}-${segments[1]}` as GestureDirection;
            this.gestureDirection = combinedDirection;
            this.isValidGesture = true;
        }
    }

    /**
     * 将轨迹分段，每段识别一个主方向
     * @param straightness 轨迹的直线度，用于调整识别灵敏度
     * @returns 主方向数组
     */
    private segmentTrack(straightness: number = 0.8): string[] {
        const segments: string[] = [];
        
        // 如果轨迹点太少，计算整体方向
        if (this.gestureTrack.length < 3) {
            const startPoint = this.gestureTrack[0];
            const endPoint = this.gestureTrack[this.gestureTrack.length - 1];
            const { deltaX, deltaY } = this.calculateDelta(startPoint, endPoint);
            const direction = this.getDirection(deltaX, deltaY);
            if (direction) segments.push(direction);
            return segments;
        }

        // 使用贝塞尔曲线拟合来处理曲线手势
        const smoothedPoints = this.smoothTrajectory(this.gestureTrack);
        
        // 查找主要的转折点
        const inflectionPoints = this.findInflectionPoints(smoothedPoints, straightness);
        
        // 处理找到的转折点，提取方向
        if (inflectionPoints.length > 0) {
            let prevDirection = '';
            let startIdx = 0;
            
            // 遍历所有转折点
            for (let i = 0; i < inflectionPoints.length; i++) {
                const inflectionIdx = inflectionPoints[i];
                
                // 计算当前段的方向
                if (inflectionIdx - startIdx > 2) { // 确保段长足够
                    const startPoint = smoothedPoints[startIdx];
                    const endPoint = smoothedPoints[inflectionIdx];
                    const { deltaX, deltaY } = this.calculateDelta(startPoint, endPoint);
                    const direction = this.getDirection(deltaX, deltaY);
                    
                    // 如果方向有效且与前一个不同，添加到结果中
                    if (direction && direction !== prevDirection) {
                        segments.push(direction);
                        prevDirection = direction;
                        
                        // 最多识别两个方向
                        if (segments.length >= 2) break;
                    }
                }
                
                startIdx = inflectionIdx;
            }
            
            // 处理最后一段（如果需要且还没有识别出两个方向）
            if (segments.length < 2 && startIdx < smoothedPoints.length - 2) {
                const startPoint = smoothedPoints[startIdx];
                const endPoint = smoothedPoints[smoothedPoints.length - 1];
                const { deltaX, deltaY } = this.calculateDelta(startPoint, endPoint);
                const direction = this.getDirection(deltaX, deltaY);
                
                if (direction && direction !== prevDirection) {
                    segments.push(direction);
                }
            }
        }
        
        // 如果没有找到有效段，分析整体方向
        if (segments.length === 0) {
            const startPoint = this.gestureTrack[0];
            const endPoint = this.gestureTrack[this.gestureTrack.length - 1];
            const { deltaX, deltaY } = this.calculateDelta(startPoint, endPoint);
            const direction = this.getDirection(deltaX, deltaY);
            if (direction) segments.push(direction);
        }
        
        return segments;
    }
    
    /**
     * 查找轨迹中的主要转折点
     * @param points 平滑后的轨迹点
     * @param straightness 轨迹的直线度，用于调整识别灵敏度
     * @returns 转折点索引数组
     */
    private findInflectionPoints(points: GesturePoint[], straightness: number): number[] {
        const result: number[] = [];
        if (points.length < 5) return result;
        
        // 根据轨迹直线度调整角度阈值
        // 水平和垂直方向使用不同的基础角度阈值
        const horizontalBaseAngleThreshold = 15; // 水平方向使用更低的角度阈值
        const verticalBaseAngleThreshold = 20;   // 垂直方向保持较高的角度阈值
        
        let lastInflectionIdx = 0;
        const minSegmentLength = Math.max(2, Math.floor(points.length * 0.04)); // 减小最小段长度
        
        // 使用滑动窗口检测转折点
        for (let i = 2; i < points.length - 2; i++) {
            // 计算前段方向向量
            const prevVectorX = points[i].x - points[i-2].x;
            const prevVectorY = points[i].y - points[i-2].y;
            
            // 计算后段方向向量
            const nextVectorX = points[i+2].x - points[i].x;
            const nextVectorY = points[i+2].y - points[i].y;
            
            // 计算向量夹角（弧度）
            const dot = prevVectorX * nextVectorX + prevVectorY * nextVectorY;
            const prevMag = Math.sqrt(prevVectorX * prevVectorX + prevVectorY * prevVectorY);
            const nextMag = Math.sqrt(nextVectorX * nextVectorX + nextVectorY * nextVectorY);
            
            // 避免除以零
            if (prevMag < 0.0001 || nextMag < 0.0001) continue;
            
            // 计算角度（角度制）
            const cosAngle = Math.max(-1, Math.min(1, dot / (prevMag * nextMag)));
            const angle = Math.acos(cosAngle) * (180 / Math.PI);
            
            // 判断是否为主要水平移动
            const isPrevHorizontal = Math.abs(prevVectorX) > Math.abs(prevVectorY);
            const isNextHorizontal = Math.abs(nextVectorX) > Math.abs(nextVectorY);
            
            // 根据主要方向选择基础角度阈值
            let baseAngleThreshold;
            if (isPrevHorizontal || isNextHorizontal) {
                baseAngleThreshold = horizontalBaseAngleThreshold;
            } else {
                baseAngleThreshold = verticalBaseAngleThreshold;
            }
            
            // 计算最终调整后的角度阈值
            const adjustedThreshold = baseAngleThreshold + (50 * straightness);
            
            // 方向变化超过阈值，且与上一个转折点距离足够
            if (angle > adjustedThreshold && (i - lastInflectionIdx) >= minSegmentLength) {
                result.push(i);
                lastInflectionIdx = i;
            }
        }
        
        return result;
    }
    
    /**
     * 平滑轨迹点，减少噪声影响
     * @param points 原始轨迹点
     * @returns 平滑后的轨迹点
     */
    private smoothTrajectory(points: GesturePoint[]): GesturePoint[] {
        if (points.length <= 5) return points;
        
        const result: GesturePoint[] = [];
        
        // 添加起点
        result.push(points[0]);
        
        // 使用移动平均平滑中间点
        const windowSize = Math.min(5, Math.floor(points.length / 10) + 2);
        const halfWindow = Math.floor(windowSize / 2);
        
        for (let i = 1; i < points.length - 1; i++) {
            let sumX = 0;
            let sumY = 0;
            let count = 0;
            
            // 计算窗口内点的平均位置
            for (let j = Math.max(0, i - halfWindow); j <= Math.min(points.length - 1, i + halfWindow); j++) {
                sumX += points[j].x;
                sumY += points[j].y;
                count++;
            }
            
            // 添加平滑后的点
            result.push({
                x: sumX / count,
                y: sumY / count
            });
        }
        
        // 添加终点
        result.push(points[points.length - 1]);
        
        return result;
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
     * 根据位移获取主方向
     * @param deltaX 水平位移
     * @param deltaY 垂直位移
     * @returns 主方向字符串
     */
    private getDirection(deltaX: number, deltaY: number): string {
        // 计算总位移大小
        const displacement = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        // 判断主要移动方向是水平还是垂直
        const isHorizontalDominant = Math.abs(deltaX) > Math.abs(deltaY);

        // 获取当前设置的阈值或使用默认值
        const horizontalThreshold = this.settings.horizontalThreshold || CONSTANTS.HORIZONTAL_THRESHOLD;
        const verticalThreshold = this.settings.verticalThreshold || CONSTANTS.VERTICAL_THRESHOLD;

        // 根据主导方向应用相应的阈值
        if (isHorizontalDominant) {
            // 水平方向使用水平阈值
            if (displacement < horizontalThreshold) {
                return '';
            }
        } else {
            // 垂直方向使用垂直阈值
            if (displacement < verticalThreshold) {
                return '';
            }
        }

        // 计算角度（弧度）
        const angle = Math.atan2(deltaY, deltaX);
        const degrees = angle * (180 / Math.PI);
        
        // 将角度规范化到 -180 到 180 度范围内
        let normDegrees = degrees;
        while (normDegrees < -180) normDegrees += 360;
        while (normDegrees > 180) normDegrees -= 360;
        
        // 8方向判定，每个方向45度区间
        // 对接近边界的情况做特殊处理
        if (normDegrees >= -22.5 && normDegrees < 22.5) {
            return 'left';      // 向左
        } else if (normDegrees >= 22.5 && normDegrees < 67.5) {
            // 对于接近边界的曲线手势，判断哪个分量更明显
            if (Math.abs(deltaY) > Math.abs(deltaX) * 1.2) { // 降低阈值比例
                return 'up';    // 垂直分量更明显，判为向上
            } else if (Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
                return 'left';  // 水平分量更明显，判为向左
            } else {
                return 'up-left';   // 两者差不多，判为左上
            }
        } else if (normDegrees >= 67.5 && normDegrees < 112.5) {
            return 'up';        // 向上
        } else if (normDegrees >= 112.5 && normDegrees < 157.5) {
            // 同理处理接近边界情况
            if (Math.abs(deltaY) > Math.abs(deltaX) * 1.2) {
                return 'up';    // 垂直分量更明显
            } else if (Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
                return 'right'; // 水平分量更明显
            } else {
                return 'up-right';  // 两者差不多
            }
        } else if ((normDegrees >= 157.5 && normDegrees <= 180) || (normDegrees >= -180 && normDegrees < -157.5)) {
            return 'right';     // 向右
        } else if (normDegrees >= -157.5 && normDegrees < -112.5) {
            // 同理处理接近边界情况
            if (Math.abs(deltaY) > Math.abs(deltaX) * 1.2) {
                return 'down';  // 垂直分量更明显
            } else if (Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
                return 'right'; // 水平分量更明显
            } else {
                return 'down-right'; // 两者差不多
            }
        } else if (normDegrees >= -112.5 && normDegrees < -67.5) {
            return 'down';      // 向下
        } else if (normDegrees >= -67.5 && normDegrees < -22.5) {
            // 同理处理接近边界情况
            if (Math.abs(deltaY) > Math.abs(deltaX) * 1.2) {
                return 'down';  // 垂直分量更明显
            } else if (Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
                return 'left';  // 水平分量更明显
            } else {
                return 'down-left'; // 两者差不多
            }
        }
        
        // 默认情况下，返回空字符串
        return '';
    }
}