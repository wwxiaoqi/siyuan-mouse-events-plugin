import {
    Plugin,
    showMessage
} from "siyuan";

export default class MouseEventsPlugin extends Plugin {

    private rightMouseDown: boolean = false;

    // 移动阈值，单位像素
    private readonly SCROLL_THRESHOLD: number = 50;

    // 最小有效手势长度
    private readonly MIN_GESTURE_LENGTH: number = 30; 

    // 轨迹相关属性
    private gestureTrack: {x: number, y: number}[] = [];
    private trackElement: HTMLElement | null = null;
    private tooltipElement: HTMLElement | null = null;
    private isValidGesture: boolean = false;
    private gestureDirection: string = '';

    onload() {
        console.log("Mouse Events Plugin loaded");
        this.registerMouseEvents();
    }

    onunload() {
        console.log("Mouse Events Plugin unloaded");
        this.unregisterMouseEvents();
    }

    private registerMouseEvents() {
        document.addEventListener("mousedown", this.handleMouseDown, true);
        document.addEventListener("mouseup", this.handleMouseUp, true);
        document.addEventListener("mousemove", this.handleMouseMove, true);
        document.addEventListener("auxclick", this.handleMiddleClick, true);
    }

    private unregisterMouseEvents() {
        document.removeEventListener("mousedown", this.handleMouseDown, true);
        document.removeEventListener("mouseup", this.handleMouseUp, true);
        document.removeEventListener("mousemove", this.handleMouseMove, true);
        document.removeEventListener("auxclick", this.handleMiddleClick, true);
    }

    private handleMouseDown = (event: MouseEvent) => {

        // 右键按下
        if (event.button === 2) {
            this.rightMouseDown = true;
            this.gestureTrack = [{x: event.clientX, y: event.clientY}];
            this.isValidGesture = false;
            this.gestureDirection = '';
            
            // 创建轨迹元素
            this.createTrackElement();

            // 创建提示窗口
            this.createTooltipElement();

            // 阻止默认的右键菜单
            event.preventDefault();
        }
    }

    private handleMouseUp = (event: MouseEvent) => {

        // 右键释放
        if (event.button === 2 && this.rightMouseDown) {

            // 阻止默认的右键菜单
            event.preventDefault();

            // 如果是有效手势，执行相应操作
            if (this.isValidGesture) {

                // 判断轨迹路径是向上还是向下
                if (this.gestureDirection === 'up') {
                    const element = document.querySelector('.protyle-scroll__up.ariaLabel');
                    if (element) {
                        (element as HTMLElement).click();
                    }
                } else if (this.gestureDirection === 'down') {
                    const element = document.querySelector('.protyle-scroll__down.ariaLabel');
                    if (element) {
                        (element as HTMLElement).click();
                    }
                }
            }

            // 清理轨迹和提示窗口
            this.removeTrackElement();
            this.removeTooltipElement();
            
            this.rightMouseDown = false;
            this.gestureTrack = [];
        }
    }

    private handleMouseMove = (event: MouseEvent) => {

        // 只在右键按下时处理
        if (!this.rightMouseDown) {
            return;
        }
        
        // 记录轨迹点
        this.gestureTrack.push({x: event.clientX, y: event.clientY});
        
        // 更新轨迹显示
        this.updateTrackElement();
        
        // 判断手势是否有效
        this.evaluateGesture();
        
        // 更新提示窗口
        this.updateTooltipElement(event.clientX, event.clientY);
    }

    private handleMiddleClick = (event: MouseEvent) => {

        // 中键点击
        if (event.button === 1) {
            console.log("中键点击");

            // 检查文档树是否打开
            // const fileTree = document.querySelector('.layout__fileTree');
            const element = document.querySelector(".layout__wnd--active > .fn__flex > .layout-tab-bar > .item--focus") ||
            document.querySelector("ul.layout-tab-bar > .item--focus");
            console.log(element);

            if (element) {
                console.log("检查文档树是否打开");
                // 获取当前打开的文档ID
                const currentDocId = this.getCurrentDocId();
                console.log(currentDocId);
                if (currentDocId) {
                    console.log("获取当前打开的文档ID");
                    // 定位到文档树中的当前文档
                    this.locateCurrentDocInTree(currentDocId);
                    event.preventDefault();
                }
            }
        }
    }

    private scrollToTop() {
        // 获取当前编辑器
        const editor = document.querySelector('.protyle-content');
        if (editor instanceof HTMLElement) {
            editor.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            showMessage("已滚动到顶部");
        }
    }
    
    // 创建轨迹元素
    private createTrackElement() {
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
    
    // 更新轨迹显示
    private updateTrackElement() {
        if (!this.trackElement || this.gestureTrack.length < 2) return;
        
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
        let d = `M ${this.gestureTrack[0].x} ${this.gestureTrack[0].y}`;
        
        for (let i = 1; i < this.gestureTrack.length; i++) {
            d += ` L ${this.gestureTrack[i].x} ${this.gestureTrack[i].y}`;
        }
        
        path.setAttribute('d', d);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', this.isValidGesture ? '#4CAF50' : '#9E9E9E');
        path.setAttribute('stroke-width', '3');
        path.setAttribute('stroke-linecap', 'round');
        path.setAttribute('stroke-linejoin', 'round');
        
        svg.appendChild(path);
        this.trackElement.appendChild(svg);
    }
    
    // 移除轨迹元素
    private removeTrackElement() {
        if (this.trackElement && this.trackElement.parentNode) {
            this.trackElement.parentNode.removeChild(this.trackElement);
            this.trackElement = null;
        }
    }
    
    // 创建提示窗口
    private createTooltipElement() {
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
    
    // 更新提示窗口
    private updateTooltipElement(x: number, y: number) {
        if (!this.tooltipElement) return;
        
        // 更新位置
        this.tooltipElement.style.left = `${x + 15}px`;
        this.tooltipElement.style.top = `${y + 15}px`;
        
        // 更新内容和显示状态
        if (this.isValidGesture) {
            this.tooltipElement.textContent = this.gestureDirection === 'up' ? '跳转至顶部' : '跳转至底部';
            this.tooltipElement.style.display = 'block';
        } else {
            this.tooltipElement.style.display = 'none';
        }
    }
    
    // 移除提示窗口
    private removeTooltipElement() {
        if (this.tooltipElement && this.tooltipElement.parentNode) {
            this.tooltipElement.parentNode.removeChild(this.tooltipElement);
            this.tooltipElement = null;
        }
    }
    
    // 评估手势是否有效
    private evaluateGesture() {
        if (this.gestureTrack.length < 2) return;
        
        // 计算手势的总长度
        let totalLength = 0;
        for (let i = 1; i < this.gestureTrack.length; i++) {
            const dx = this.gestureTrack[i].x - this.gestureTrack[i-1].x;
            const dy = this.gestureTrack[i].y - this.gestureTrack[i-1].y;
            totalLength += Math.sqrt(dx*dx + dy*dy);
        }
        
        // 如果手势太短，认为无效
        if (totalLength < this.MIN_GESTURE_LENGTH) {
            this.isValidGesture = false;
            return;
        }
        
        // 计算起点和终点
        const startPoint = this.gestureTrack[0];
        const endPoint = this.gestureTrack[this.gestureTrack.length - 1];
        
        // 计算垂直和水平位移
        const deltaY = startPoint.y - endPoint.y;
        const deltaX = endPoint.x - startPoint.x;
        
        // 判断是否是垂直手势（垂直分量大于水平分量的2倍）
        if (Math.abs(deltaY) > Math.abs(deltaX) * 2) {
            if (deltaY > this.SCROLL_THRESHOLD) {
                this.isValidGesture = true;
                this.gestureDirection = 'up';

            } else if (deltaY < -this.SCROLL_THRESHOLD) {
                this.isValidGesture = true;
                this.gestureDirection = 'down';

            } else {
                this.isValidGesture = false;

            }
        } else {
            this.isValidGesture = false;

        }
    }

    private scrollToBottom() {
        // 获取当前编辑器
        const editor = document.querySelector('.protyle-content');
        if (editor instanceof HTMLElement) {
            editor.scrollTo({
                top: editor.scrollHeight,
                behavior: 'smooth'
            });
            showMessage("已滚动到底部");
        }
    }

    private getCurrentDocId(): string | null {
        // 获取当前打开的文档ID
        const activeTab = document.querySelector('.layout__wnd--active .protyle[data-id]');
        if (activeTab) {
            return activeTab.getAttribute('data-id');
        }
        return null;
    }

    private locateCurrentDocInTree(docId: string | null) {
        if (!docId) {
            showMessage("无法获取当前文档ID");
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
            showMessage("已定位到当前文档");
        } else {
            showMessage("无法在文档树中找到当前文档");
        }
    }
}