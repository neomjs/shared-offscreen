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
        let count = data.component.value;

        MainApp.canvas.Helper.changeItemsAmount(count);

        this.component.items[1].items.forEach(item => {
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
     * @param {String} [appName]
     * @returns {Neo.component.Base}
     */
    getMainView(appName) {
        if (!appName || appName === 'MainApp') {
            return this.component;
        }

        return Neo.apps[appName].mainView;
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

        console.log('onAppConnect', appName);

        switch(appName) {
            case 'ChildApp': {
                me.getReference('webgl-container').remove(canvasNode, false);

                NeoArray.add(me.connectedApps, appName);

                Neo.apps[appName].on('render', () => {
                    setTimeout(() => {
                        me.getMainView(appName).add(canvasNode);
                    }, 100);
                });
                break;
            }
        }
    }

    /**
     * @param {Object} data
     * @param {String} data.appName
     */
    onAppDisconnect(data) {
        let me         = this,
            appName    = data.appName,
            canvasNode = me.getReference('webgl-component');

        console.log('onAppDisconnect', appName);

        switch(appName) {
            case 'ChildApp': {
                NeoArray.remove(me.connectedApps, appName);

                me.getMainView(appName).remove(canvasNode, false);

                me.getReference('webgl-container').add(canvasNode);
                break;
            }

            case 'MainApp': {
                Neo.Main.windowClose({
                    appName,
                    names: me.connectedApps
                });
                break;
            }
        }

        Neo.apps[appName].destroy();
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
        Neo.Main.alert({
            appName: this.getReference('webgl-component').appName,
            message: [
                'This alert pauses the JS main thread.\n\n',
                'Notice that the time inside the bottom toolbar has stopped updating.\n\n',
                'Closing this alert will resume the main thread.'
            ].join('')
        });
    }
}

Neo.applyClassConfig(MainContainerController);

export default MainContainerController;
