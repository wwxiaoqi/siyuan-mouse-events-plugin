/**
 * DOM操作相关工具函数
 */
import { showMessage, IObject } from "siyuan";

/**
 * 滚动到顶部
 */
export function scrollToTop(): void {
    // 获取当前编辑器
    const editor = document.querySelector('.protyle-content');
    if (editor instanceof HTMLElement) {
        editor.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
}

/**
 * 滚动到底部
 */
export function scrollToBottom(): void {
    const editor = document.querySelector('.protyle-content');
    if (editor instanceof HTMLElement) {
        editor.scrollTo({
            top: editor.scrollHeight,
            behavior: 'smooth'
        });
    }
}

/**
 * 根据 direction 跳转到对应位置（顶部 up、底部 down）
 */
export function handleScrollClick(direction: 'up' | 'down'): void {
    const getScrollSelector = (dir: 'up' | 'down'): string => {
        return dir === 'up' 
            ? '.protyle-scroll__up.ariaLabel' 
            : '.protyle-scroll__down.ariaLabel';
    };

    // 获取中心布局容器
    const centerLayout = document.querySelector('.layout__center.fn__flex-1.fn__flex');
    if (!centerLayout) return;

    // 获取分割线两侧的内容区域
    const contentDivs = centerLayout.querySelectorAll('.fn__flex-1.fn__flex');

    // 查找当前激活的窗口
    let activeContentDiv = null;
    contentDivs.forEach(div => {
        if (div.querySelector('.layout__wnd--active')) {
            activeContentDiv = div;
        }
    });

    if (activeContentDiv) {
        // 获取激活窗口中的所有标签页
        const tabs = activeContentDiv.querySelectorAll('.layout-tab-bar li[data-type="tab-header"]');
        
        // 查找当前激活的标签页索引
        let activeTabIndex = -1;
        tabs.forEach((tab, index) => {
            if (tab.classList.contains('item--focus')) {
                activeTabIndex = index;
            }
        });

        // 获取所有编辑器容器
        const protyleContainers = activeContentDiv.querySelectorAll('.protyle');
        
        // 如果找到了激活的标签页，则在对应的容器中查找并点击目标元素
        if (activeTabIndex !== -1 && protyleContainers.length > activeTabIndex) {
            // 获取当前激活标签页对应的编辑器容器
            const targetContainer = protyleContainers[activeTabIndex];
            // 在容器中查找滚动按钮
            const targetElement = targetContainer.querySelector(getScrollSelector(direction)) as HTMLElement;
            
            // 如果找到了目标元素，则触发点击事件
            if (targetElement) {
                targetElement.click();
            }
        }
    }
}

/**
 * 获取当前文档ID
 */
export function getCurrentDocId(): string | null {
    const activeTab = document.querySelector('.layout__wnd--active .protyle[data-id]');
    if (activeTab) {
        return activeTab.getAttribute('data-id');
    }
    return null;
}

/**
 * 在文档树中定位当前文档
 */
export function locateCurrentDocInTree(docId: string | null, i18n: IObject): void {
    if (!docId) {
        showMessage(i18n["locateCurrentDocInTreeErr1"]);
        return;
    }

    // 在文档树中定位并高亮当前文档
    const docItem = document.querySelector(`.fileTree__item[data-node-id="${docId}"]`);
    if (docItem) {
        // 展开父级文件夹
        let parent = docItem.parentElement;

        while (parent) {
            if (parent.classList.contains('fileTree__item')) {
                // 展开折叠的文件夹
                const collapseIcon = parent.querySelector('.b3-list-item__arrow--open');
                if (collapseIcon) {
                    (collapseIcon as HTMLElement).click();
                }
            }
            parent = parent.parentElement;
        }
        
        // 滚动到视图中并高亮
        docItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        (docItem as HTMLElement).click();
    } else {
        showMessage(i18n["locateCurrentDocInTreeErr2"]);
    }
}

/**
 * 切换到左侧页签
 */
export function switchTabLeft(i18n: IObject): void {
    const activeTab = document.querySelector('.layout-tab-bar .item--focus');
    if (activeTab) {
        const prevTab = activeTab.previousElementSibling;
        if (prevTab && prevTab.classList.contains('item')) {
            (prevTab as HTMLElement).click();
        } else {
            showMessage(i18n["switchTabLeft"]);
        }
    }
}

/**
 * 切换到右侧页签
 */
export function switchTabRight(i18n: IObject): void {
    const activeTab = document.querySelector('.layout-tab-bar .item--focus');
    if (activeTab) {
        const nextTab = activeTab.nextElementSibling;
        if (nextTab && nextTab.classList.contains('item')) {
            (nextTab as HTMLElement).click();
        } else {
            showMessage(i18n["switchTabRight"]);
        }
    }
}

/**
 * 根据方向切换标签页（左 left、右 right）
 */
export function handleTabSwitch(direction: 'left' | 'right', i18n: IObject): void {
    // 获取中心布局容器
    const centerLayout = document.querySelector('.layout__center.fn__flex-1.fn__flex');
    if (!centerLayout) return;

    // 获取分割线两侧的内容区域
    const contentDivs = centerLayout.querySelectorAll('.fn__flex-1.fn__flex');

    // 查找当前激活的窗口
    let activeContentDiv = null;
    contentDivs.forEach(div => {
        if (div.querySelector('.layout__wnd--active')) {
            activeContentDiv = div;
        }
    });

    if (activeContentDiv) {
        // 在激活窗口中查找当前激活的标签页
        const activeTab = activeContentDiv.querySelector('.layout-tab-bar .item--focus');
        if (activeTab) {
            // 根据方向获取目标标签页
            const targetTab = direction === 'left' 
                ? activeTab.previousElementSibling
                : activeTab.nextElementSibling;

            // 如果目标标签页存在且是有效的标签页，则触发点击
            if (targetTab && targetTab.classList.contains('item')) {
                (targetTab as HTMLElement).click();
            } else {
                // 显示提示消息
                showMessage(i18n[direction === 'left' ? "switchTabLeft" : "switchTabRight"]);
            }
        }
    }
}