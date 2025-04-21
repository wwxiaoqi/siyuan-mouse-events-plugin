/**
 * 思源笔记鼠标手势插件
 * 主文件 - 负责插件的初始化和生命周期管理
 */

import {
    Plugin
} from "siyuan";

import { MouseEventHandler } from "./events/mouseEventHandler";

class MouseEventsPlugin extends Plugin {

    // 鼠标事件处理器
    private mouseEventHandler: MouseEventHandler =  new MouseEventHandler(this.i18n);

    /**
     * 插件加载
     */
    onload() {
        console.log(this.i18n.pluginOnload);

        // 注册鼠标事件
        this.mouseEventHandler.registerEvents();
    }
    
    /**
     * 插件卸载
     */
    onunload() {
        console.log(this.i18n.pluginOnunload);

        // 注销鼠标事件
        this.mouseEventHandler.unregisterEvents();
    }
};

export default MouseEventsPlugin;
