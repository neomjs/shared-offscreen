import Label                   from '../../../node_modules/neo.mjs/src/component/Label.mjs';
import MainContainerController from './MainContainerController.mjs';
import Toolbar                 from '../../../node_modules/neo.mjs/src/toolbar/Base.mjs';
import Viewport                from '../../../node_modules/neo.mjs/src/container/Viewport.mjs';
import WebGlComponent          from './WebGlComponent.mjs';

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
         * @member {Neo.controller.Component} controller=MainContainerController
         */
        controller: MainContainerController,
        /**
         * @member {Object[]} items
         */
        items: [{
            ntype    : 'container',
            flex     : 1,
            items    : [{module: WebGlComponent, reference: 'webgl-component'}],
            layout   : {ntype: 'fit'},
            reference: 'webgl-container',
            vdom     : {tag: 'd3fc-group', 'auto-resize': true, cn: []}
        }, {
            module: Toolbar,
            flex  : 'none',
            items : [{
                handler: 'onStopAnimationButtonClick',
                text   : 'Stop Animation'
            }, {
                handler: 'onStopMainButtonClick',
                style  : {marginLeft: '.2em'},
                text   : 'Stop Main'
            }, {
                handler    : 'changeItemAmount',
                pressed    : true,
                style      : {marginLeft: '2em'},
                text       : `${(10000).toLocaleString()} items`,
                toggleGroup: 'itemAmount',
                value      : 10000
            }, {
                handler    : 'changeItemAmount',
                style      : {marginLeft: '.2em'},
                text       : `${(100000).toLocaleString()} items`,
                toggleGroup: 'itemAmount',
                value      : 100000
            }, {
                handler    : 'changeItemAmount',
                style      : {marginLeft: '.2em'},
                text       : `${(1000000).toLocaleString()} items`,
                toggleGroup: 'itemAmount',
                value      : 1000000
            }, {
                module   : Label,
                reference: 'time-label',
                style    : {marginLeft: '2em'}
            }, {
                handler: 'moveCanvas',
                style  : {marginLeft: 'auto'},
                text   : 'Move Canvas',
            }]
        }],
        /**
         * @member {Object} layout={ntype:'vbox',align:'stretch'}
         */
        layout: {ntype: 'vbox', align: 'stretch'}
    }}

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
     * @returns {String}
     */
    getTime() {
        return new Date().toLocaleString(Neo.config.locale, {
            hour  : '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }
}

Neo.applyClassConfig(MainContainer);

export {MainContainer as default};
