import Label          from '../../../node_modules/neo.mjs/src/component/Label.mjs';
import Toolbar        from '../../../node_modules/neo.mjs/src/toolbar/Base.mjs';
import Viewport       from '../../../node_modules/neo.mjs/src/container/Viewport.mjs';
import WebGlComponent from './WebGlComponent.mjs';

/**
 * @class MainApp.view.MainContainer
 * @extends Neo.container.Viewport
 */
class MainContainer extends Viewport {
    static getConfig() {return {
        /**
         * @member {String} className='MainApp.view.MainContainer'
         * @protected
         */
        className: 'MainApp.view.MainContainer',
        /**
         * @member {Boolean} autoMount=true
         * @protected
         */
        autoMount: true,
        /**
         * @member {Object} layout={ntype:'vbox',align:'stretch'}
         */
        layout: {ntype: 'vbox', align: 'stretch'}
    }}

    /**
     * @param {Object} config
     */
    construct(config) {
        super.construct(config);

        let me = this;

        me.items = [{
            ntype : 'container',
            flex  : 1,
            items : [WebGlComponent],
            layout: {ntype: 'fit'},
            vdom  : {tag: 'd3fc-group', 'auto-resize': true, cn: []}
        }, {
            module: Toolbar,
            flex  : 'none',
            items : [{
                handler: me.onStopAnimationButtonClick.bind(me),
                text   : 'Stop Animation'
            }, {
                handler: me.onStopMainButtonClick.bind(me),
                style  : {marginLeft: '.2em'},
                text   : 'Stop Main'
            }, {
                handler    : me.changeItemAmount.bind(me, 10000),
                pressed    : true,
                style      : {marginLeft: '2em'},
                text       : `${(10000).toLocaleString()} items`,
                toggleGroup: 'itemAmount',
                value      : 10000
            }, {
                handler    : me.changeItemAmount.bind(me, 100000),
                style      : {marginLeft: '.2em'},
                text       : `${(100000).toLocaleString()} items`,
                toggleGroup: 'itemAmount',
                value      : 100000
            }, {
                handler    : me.changeItemAmount.bind(me, 1000000),
                style      : {marginLeft: '.2em'},
                text       : `${(1000000).toLocaleString()} items`,
                toggleGroup: 'itemAmount',
                value      : 1000000
            }, {
                module   : Label,
                reference: 'time-label',
                style    : {marginLeft: '2em'},
                text     : `Time: ${me.getTime()}`
            }]
        }];
    }

    /**
     * Triggered after the mounted config got changed
     * @param {Boolean} value
     * @param {Boolean} oldValue
     * @protected
     */
    afterSetMounted(value, oldValue) {
        super.afterSetMounted(value, oldValue);

        if (value) {
            setInterval(() => {
                this.down({reference: 'time-label'}).text = `Time: ${this.getTime()}`;
            }, 1000);
        }
    }

    /**
     * @param {Number} count
     */
    changeItemAmount(count) {
        let me = this;

        MainApp.canvas.Helper.changeItemsAmount(count);

        me.items[1].items.forEach(item => {
            if (item.toggleGroup === 'itemAmount') {
                item.pressed = item.value === count;
            }
        });
    }

    getTime() {
        return new Date().toLocaleString(Neo.config.locale, {
            hour  : '2-digit',
            minute: '2-digit',
            second: '2-digit'
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

Neo.applyClassConfig(MainContainer);

export {MainContainer as default};
