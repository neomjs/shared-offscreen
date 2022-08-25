import Component from '../../../node_modules/neo.mjs/src/controller/Component.mjs';

/**
 * @class MainApp.view.MainContainerController
 * @extends Neo.controller.Component
 */
class MainContainerController extends Component {
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
     * @param {Object} data
     */
    moveCanvas(data) {
        console.log('moveCanvas')
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
