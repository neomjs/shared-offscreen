import Viewport from '../../../node_modules/neo.mjs/src/container/Viewport.mjs';

/**
 * @class ChildApp.view.MainContainer
 * @extends Neo.container.Viewport
 */
class MainContainer extends Viewport {
    static getConfig() {return {
        /*
         * @member {String} className='ChildApp.view.MainContainer'
         * @protected
         */
        className: 'ChildApp.view.MainContainer',
        /*
         * @member {Boolean} autoMount=true
         */
        autoMount: true,
        /*
         * @member {Object} layout={ntype:'fit'}
         */
        layout: {ntype: 'fit'}
    }}
}

Neo.applyClassConfig(MainContainer);

export default MainContainer;
