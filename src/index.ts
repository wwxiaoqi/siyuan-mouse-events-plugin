/**
 * 思源笔记鼠标手势插件
 * 主文件 - 负责插件的初始化和生命周期管理
 */

import {
    Plugin,
    showMessage
} from "siyuan";

import { Setting } from "siyuan";
import { MouseEventHandler } from "./events/mouseEventHandler";
import { SettingsUI } from "./ui/settingsUI";
import { GestureSettings } from "./types";
import { DEFAULT_SETTINGS } from "./constants";
import "./index.scss";


class MouseEventsPlugin extends Plugin {

    // 鼠标事件处理器
    private mouseEventHandler!: MouseEventHandler;

    // 插件设置
    private settings!: GestureSettings;

    /**
     * 插件加载
     */
    onload() {
        console.log(this.i18n.pluginOnload);

        // 加载设置
        this.loadSettings();

        // 初始化鼠标事件处理器
        this.mouseEventHandler = new MouseEventHandler(this.i18n, this.settings);

        // 仅在启用手势时注册事件
        if (this.settings.enableGestures) {
            this.mouseEventHandler.registerEvents();
        }
    }

    /**
     * 插件卸载
     */
    onunload() {
        console.log(this.i18n.pluginOnunload);

        // 注销鼠标事件
        this.mouseEventHandler.unregisterEvents();
    }

    /**
     * 打开设置面板
     */
    openSetting() {
        const settingPanel = this.createSettingsPanel();
        const setting = new Setting({
            confirmCallback: () => {
                // 关闭设置面板时的回调
            }
        });

        setting.addItem({
            title: "",
            direction: "row",
            description: "",
            actionElement: settingPanel
        });

        setting.open(this.i18n.settings as string);
    }

    /**
     * 创建设置面板
     */
    private createSettingsPanel(): HTMLElement {
        // 创建设置UI实例
        const settingsUI = new SettingsUI(this.i18n, this.settings, (updatedSettings) => {
            // 保存更新后的设置
            this.settings = updatedSettings;
            this.saveSettings();

            // 根据设置更新鼠标事件处理
            this.updateMouseEventHandler();
        });

        // 返回设置面板元素
        return settingsUI.createSettingsPanel();
    }

    /**
     * 根据当前设置更新鼠标事件处理
     */
    private updateMouseEventHandler() {
        // 先注销所有事件
        this.mouseEventHandler.unregisterEvents();

        // 更新设置
        this.mouseEventHandler.updateSettings(this.settings);

        // 如果启用了手势，重新注册事件
        if (this.settings.enableGestures) {
            this.mouseEventHandler.registerEvents();
            showMessage(this.i18n.gesturesEnabled as string);
        } else {
            showMessage(this.i18n.gesturesDisabled as string);
        }
    }

    /**
     * 加载设置
     */
    private loadSettings() {
        const savedSettings = this.data[STORAGE_NAME];
        if (savedSettings) {
            try {
                this.settings = JSON.parse(savedSettings);
            } catch (e) {
                console.error("Failed to parse settings:", e);
                this.settings = { ...DEFAULT_SETTINGS };
            }
        } else {
            this.settings = { ...DEFAULT_SETTINGS };
        }
    }

    /**
     * 保存设置
     */
    private saveSettings() {
        this.data[STORAGE_NAME] = JSON.stringify(this.settings);
    }

};

// 存储设置的键名
const STORAGE_NAME = "mouse-events-plugin-settings";

export default MouseEventsPlugin;
