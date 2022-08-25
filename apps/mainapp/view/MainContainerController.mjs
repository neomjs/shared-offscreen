import Component from '../../../node_modules/neo.mjs/src/controller/Component.mjs';
import NeoArray  from '../../../node_modules/neo.mjs/src/util/Array.mjs';

/**
 * @class MainApp.view.MainContainerController
 * @extends Neo.controller.Component
 */
class MainContainerController extends Component {
    /**
     * @member {String[]} connectedApps=[]
     */
    connectedApps = []

    static getConfig() {return {
        /*
         * @member {String} className='MainApp.view.MainContainerController'
         * @protected
         */
        className: 'MainApp.view.MainContainerController'
    }}

    /**
     * @param {Object} data
     */
    changeItemAmount(data) {
        let me    = this,
            count = data.component.value;

        MainApp.canvas.Helper.changeItemsAmount(count);

        me.items[1].items.forEach(item => {
            if (item.toggleGroup === 'itemAmount') {
                item.pressed = item.value === count;
            }
        });
    }

    /**
     * @param {String} containerReference
     * @param {String} url
     * @param {String} windowName
     */
    createPopupWindow(containerReference, url, windowName) {
        let me = this;

        Neo.Main.getWindowData().then(winData => {
            me.component.getDomRect(me.getReference(containerReference).id).then(data => {
                let {height, left, top, width} = data;

                height -= 50; // popup header in Chrome
                left   += winData.screenLeft;
                top    += (winData.outerHeight - winData.innerHeight + winData.screenTop);

                Neo.Main.windowOpen({
                    url           : `../${url}/index.html`,
                    windowFeatures: `height=${height},left=${left},top=${top},width=${width}`,
                    windowName
                });
            });
        });
    }

    /**
     * @param {Object} data
     */
    moveCanvas(data) {
        this.createPopupWindow('webgl-component', 'childapp', 'ChildApp');
    }

    /**
     * @param {Object} data
     * @param {String} data.appName
     */
    onAppConnect(data) {
        let me         = this,
            appName    = data.appName,
            canvasNode = me.getReference('webgl-component');

        console.log('onAppConnect', appName, canvasNode);

        switch(appName) {
            case 'ChildApp': {
                NeoArray.add(me.connectedApps, appName);

                canvasNode.unmount();

                setTimeout(() => {
                    MainApp.canvas.Helper.transferNode({
                        appName,
                        canvasId: canvasNode.id
                    });
                }, 100);
                break;
            }
        }
    }

    /**
     * @param {Object} data
     * @param {String} data.appName
     */
    onAppDisconnect(data) {
        let me      = this,
            appName = data.appName;

        console.log('onAppDisconnect', appName);

        switch(appName) {
            case 'MainApp': {
                Neo.Main.windowClose({
                    appName,
                    names: me.connectedApps,
                });
                break;
            }
        }

        NeoArray.remove(me.connectedApps, appName);
    }

    /**
     *
     */
    onConstructed() {
        super.onConstructed();

        let me = this;

        Neo.currentWorker.on({
            connect   : me.onAppConnect,
            disconnect: me.onAppDisconnect,
            scope     : me
        });
    }

    /**
     * @param {Object} data
     */
    onStopAnimationButtonClick(data) {
        let enableAnimation = true,
            buttonText;

        if (data.component.text === 'Stop Animation') {
            buttonText      = 'Start Animation';
            enableAnimation = false;
        } else {
            buttonText = 'Stop Animation';
        }

        data.component.text = buttonText;

        MainApp.canvas.Helper.enableAnimation(enableAnimation);
    }

    /**
     * @param {Object} data
     */
    onStopMainButtonClick(data) {
        Neo.Main.alert([
            'This alert pauses the JS main thread.\n\n',
            'Notice that the time inside the bottom toolbar has stopped updating.\n\n',
            'Closing this alert will resume the main thread.'
        ].join(''));
    }
}

Neo.applyClassConfig(MainContainerController);

export default MainContainerController;
