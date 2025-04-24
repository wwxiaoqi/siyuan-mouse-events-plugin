/**
 * 鼠标手势设置UI管理模块
 * 负责设置界面的创建与更新
 */

import { IObject } from "siyuan";
import { GestureSettings } from "../types";
import { GESTURE_ACTIONS, GESTURE_DIRECTIONS, DEFAULT_SETTINGS } from "../constants";
import { getDirectionIcon } from "../utils/svgIcons";

export class SettingsUI {
    private i18n: IObject;
    private settings: GestureSettings;
    private settingsChanged: (settings: GestureSettings) => void;
    private debugClickCounter: number = 0;
    
    constructor(i18n: IObject, settings: GestureSettings, settingsChanged: (settings: GestureSettings) => void) {
        this.i18n = i18n;
        this.settings = settings;
        this.settingsChanged = settingsChanged;
        this.debugClickCounter = 0;
    }
    
    /**
     * 创建设置面板
     * @returns HTMLElement 设置面板元素
     */
    public createSettingsPanel(): HTMLElement {
        const settingsContainer = document.createElement('div');
        // 最开始是为了防止 UI 撑不开，最后发现会影响滚动
        // settingsContainer.className = 'b3-dialog__content mouse-gesture-settings';
        
        // 创建基本设置部分
        const basicSettingsContainer = this.createBasicSettings();
        settingsContainer.appendChild(basicSettingsContainer);
        
        // 创建手势操作设置部分
        const actionSettingsContainer = this.createActionSettings();
        settingsContainer.appendChild(actionSettingsContainer);
        
        // 如果已经开启了调试模式，显示调试设置
        if (this.settings.debugMode) {
            const debugSettingsContainer = this.createDebugSettings();
            settingsContainer.appendChild(debugSettingsContainer);
        }
        
        return settingsContainer;
    }
    
    /**
     * 创建基本设置部分
     */
    private createBasicSettings(): HTMLElement {
        const container = document.createElement('div');
        container.className = 'config-section';
        
        // 标题
        const title = document.createElement('h2');
        title.textContent = this.i18n.basicSettings as string;
        title.className = 'config-title';

        // 添加点击事件监听
        title.addEventListener('click', () => {
            this.debugClickCounter++;
            if (this.debugClickCounter === 10) {
                this.settings.debugMode = true;
                this.settingsChanged(this.settings);
                
                // 获取父容器
                const parent = container.parentElement;
                if (parent) {
                    // 创建并添加调试设置
                    const debugSettings = this.createDebugSettings();
                    parent.appendChild(debugSettings);
                }
            }
        });

        container.appendChild(title);
        
        // 启用鼠标手势
        const enableGesturesItem = this.createToggleItem(
            this.i18n.enableGestures as string,
            this.settings.enableGestures,
            (checked) => {
                this.settings.enableGestures = checked;
                this.settingsChanged(this.settings);
            }
        );
        container.appendChild(enableGesturesItem);
        
        // 显示鼠标轨迹
        const showTrackItem = this.createToggleItem(
            this.i18n.showGestureTrack as string,
            this.settings.showGestureTrack,
            (checked) => {
                this.settings.showGestureTrack = checked;
                this.settingsChanged(this.settings);
            }
        );
        container.appendChild(showTrackItem);
        
        // 显示操作提示
        const showTooltipItem = this.createToggleItem(
            this.i18n.showGestureTooltip as string,
            this.settings.showGestureTooltip,
            (checked) => {
                this.settings.showGestureTooltip = checked;
                this.settingsChanged(this.settings);
            }
        );
        container.appendChild(showTooltipItem);

        // 隐藏无操作提示
        const hideNoActionTooltipItem = this.createToggleItem(
            this.i18n.hideNoActionTooltip as string || "Hide tooltips for gestures without actions",
            this.settings.hideNoActionTooltip,
            (checked) => {
                this.settings.hideNoActionTooltip = checked;
                this.settingsChanged(this.settings);
            }
        );
        container.appendChild(hideNoActionTooltipItem);

        return container;
    }
    
    /**
     * 创建调试设置部分
     */
    private createDebugSettings(): HTMLElement {
        const debugContainer = document.createElement('div');
        debugContainer.className = 'config-section debug-section';
        
        // 标题容器，包含标题和关闭按钮
        const titleContainer = document.createElement('div');
        titleContainer.className = 'debug-title-container';
        
        // 调试模式标题
        const debugTitle = document.createElement('h2');
        debugTitle.textContent = this.i18n.debugMode as string || "Debug Mode";
        debugTitle.className = 'config-title';
        titleContainer.appendChild(debugTitle);
        
        // 关闭按钮
        const closeButton = document.createElement('button');
        closeButton.textContent = "×";
        closeButton.className = 'debug-close-btn';
        closeButton.title = this.i18n.closeDebugMode as string || "Close Debug Mode";
        closeButton.addEventListener('click', () => {
            this.settings.debugMode = false;
            this.settingsChanged(this.settings);
            
            // 移除调试设置区域
            if (debugContainer.parentElement) {
                debugContainer.parentElement.removeChild(debugContainer);
            }
        });
        titleContainer.appendChild(closeButton);
        
        debugContainer.appendChild(titleContainer);
        
        // 显示方向判断
        const showDirectionItem = this.createToggleItem(
            this.i18n.showDirectionInTooltip as string || "Show Direction in Tooltip",
            this.settings.showDirectionInTooltip,
            (checked) => {
                this.settings.showDirectionInTooltip = checked;
                this.settingsChanged(this.settings);
            }
        );
        debugContainer.appendChild(showDirectionItem);
        
        return debugContainer;
    }
    
    /**
     * 创建手势操作设置部分
     */
    private createActionSettings(): HTMLElement {
        const container = document.createElement('div');
        container.className = 'config-section';
        
        // 标题
        const title = document.createElement('h2');
        title.textContent = this.i18n.gestureActions as string;
        title.className = 'config-title';
        container.appendChild(title);

        // 手势操作设置列表
        const actionList = document.createElement('div');
        actionList.className = 'gesture-action-list';
        
        // 添加每个手势方向的操作设置
        Object.entries(GESTURE_DIRECTIONS).forEach(([key, value]) => {
            const directionKey = value;
            const actionItem = this.createActionSelectItem(
                key,
                this.i18n[directionKey] as string || key,
                this.settings.gestureActions[key] || GESTURE_ACTIONS.NO_ACTION
            );
            actionList.appendChild(actionItem);
        });
        
        container.appendChild(actionList);
        
        // 添加高级按钮区域
        const advancedArea = document.createElement('div');
        advancedArea.className = 'config-advanced-area';
        
        // 提示文本
        const advancedHint = document.createElement('div');
        advancedHint.className = 'config-hint heart-hint';
        const heartIconDiv = document.createElement('div');
        heartIconDiv.innerHTML = getDirectionIcon('heart');
        advancedHint.appendChild(heartIconDiv);

        advancedArea.appendChild(advancedHint);
        
        // 手势重置按钮
        const resetButton = document.createElement('button');
        resetButton.textContent = this.i18n.resetAllGestures as string;
        resetButton.className = 'config-reset-btn';
        resetButton.addEventListener('click', () => {
            this.settings.gestureActions = {...DEFAULT_SETTINGS.gestureActions};
            this.settingsChanged(this.settings);

            // 需要刷新UI
            const parent = container.parentElement;
            if (parent) {
                const oldActionSettings = container;
                const newActionSettings = this.createActionSettings();
                parent.replaceChild(newActionSettings, oldActionSettings);
            }
        });

        advancedArea.appendChild(resetButton);
        

        container.appendChild(advancedArea);

        return container;
    }
    
    /**
     * 创建开关项
     */
    private createToggleItem(label: string, checked: boolean, onChange: (checked: boolean) => void): HTMLElement {
        const item = document.createElement('div');
        item.className = 'config-item';
        
        const labelEl = document.createElement('span');
        labelEl.textContent = label;
        labelEl.className = 'config-label';
        
        const toggle = document.createElement('input');
        toggle.type = 'checkbox';
        toggle.checked = checked;
        toggle.className = 'b3-switch fn__flex-center';
        toggle.addEventListener('change', () => {
            onChange(toggle.checked);
        });
        
        item.appendChild(labelEl);
        item.appendChild(toggle);
        
        return item;
    }
    
    /**
     * 创建手势操作选择项
     */
    private createActionSelectItem(direction: string, label: string, currentAction: string): HTMLElement {
        const item = document.createElement('div');
        item.className = 'config-item';
        
        // 方向图标（可选）
        const directionIcon = this.createDirectionIcon(direction);
        if (directionIcon) {
            item.appendChild(directionIcon);
        }
        
        // 方向标签
        const labelEl = document.createElement('span');
        labelEl.textContent = label;
        labelEl.className = 'config-label';
        item.appendChild(labelEl);
        
        // 操作选择下拉框
        const select = document.createElement('select');
        select.className = 'config-select';
        
        // 添加操作选项
        Object.entries(GESTURE_ACTIONS).forEach(([key, value]) => {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = this.i18n[value] as string || key;
            option.selected = currentAction === value;
            select.appendChild(option);
        });
        
        // 监听选择变化
        select.addEventListener('change', () => {
            this.settings.gestureActions[direction] = select.value;
            this.settingsChanged(this.settings);
        });
        
        item.appendChild(select);
        
        return item;
    }
    
    /**
     * 创建方向图标
     */
    private createDirectionIcon(direction: string): HTMLElement | null {
        const icon = document.createElement('span');
        icon.className = `direction-icon direction-${direction}`;
        
        // 使用svgIcons工具获取对应方向的图标
        const svgContent = getDirectionIcon(direction);
        if (svgContent) {
            icon.innerHTML = svgContent;
            return icon;
        }
        
        return null;
    }
}