import Base from '../../../node_modules/neo.mjs/src/core/Base.mjs';

/**
 * @class MainApp.canvas.Helper
 * @extends Neo.core.Base
 * @singleton
 */
class Helper extends Base {
    /**
     * @member {String|null} canvasId=null
     */
    canvasId = null
    /**
     * Contains height and width properties
     * @member {Object} canvasSize=null
     */
    canvasSize = null
    /**
     * @member {Object[]|null} data=null
     */
    data = null
    /**
     * @member {Function|null} series=null
     */
    series = null
    /**
     * @member {Function|null} xScale=null
     */
    xScale = null
    /**
     * @member {Function|null} yScale=null
     */
    yScale = null

    static getConfig() {return {
        /**
         * @member {String} className='MainApp.canvas.Helper'
         * @protected
         */
        className: 'MainApp.canvas.Helper',
        /**
         * @member {Boolean} singleton=true
         * @protected
         */
        singleton: true,
        /**
         * @member {Number} itemsAmount_=10000
         */
        itemsAmount_: 10000,
        /**
         * Remote method access for other workers
         * @member {Object} remote
         * @protected
         */
        remote: {
            app: [
                'changeItemsAmount',
                'enableAnimation',
                'renderSeries',
                'transferNode',
                'updateSize'
            ]
        },
        /**
         * @member {Boolean} stopAnimation_=false
         */
        stopAnimation_: false
    }}

    /**
     * @param {Object} config
     */
    construct(config) {
        super.construct(config);

        let me = this;

        me.promiseImportD3().then(() => {
            me.xScale = d3.scaleLinear().domain([-5, 5]);
            me.yScale = d3.scaleLinear().domain([-5, 5]);

            me.generateData();
            me.generateSeries();

            // In case the d3 scripts get loaded after the canvas ownership got transferred,
            // we need to trigger the previously prevented logic
            if (me.canvasId) {
                me.renderSeries(me.canvasId);
                me.updateSize(me.canvasSize);
            }
        });
    }

    /**
     * Triggered after the itemsAmount config got changed
     * @param {Number} value
     * @param {Number} oldValue
     */
    afterSetItemsAmount(value, oldValue) {
        if (value && Neo.isNumber(oldValue)) {
            let me = this;

            me.stopAnimation = true;

            me.generateData();
            me.generateSeries();
            me.renderSeries(me.canvasId, true);

            me.stopAnimation = false;
        }
    }

    /**
     * Triggered after the stopAnimation config got changed
     * @param {Boolean} value
     * @param {Boolean} oldValue
     */
    afterSetStopAnimation(value, oldValue) {
        if (!value && Neo.isBoolean(oldValue)) {
            this.render();
        }
    }

    /**
     * @param {Number} count
     */
    changeItemsAmount(count) {
        this.itemsAmount = count;
    }

    /**
     * @param {Boolean} enable
     */
    enableAnimation(enable) {
        this.stopAnimation = !enable;
    }

    /**
     *
     */
    generateData() {
        let randomNormal    = d3.randomNormal(0, 1),
            randomLogNormal = d3.randomLogNormal();

        this.data = Array.from({ length: this.itemsAmount }, () => ({
            x   : randomNormal(),
            y   : randomNormal(),
            size: randomLogNormal() * 10
        }));
    }

    /**
     *
     */
    generateSeries() {
        let me         = this,
            colorScale = d3.scaleOrdinal(d3.schemeAccent),

        series = fc
            .seriesWebglPoint()
            .xScale(me.xScale)
            .yScale(me.yScale)
            .crossValue(d => d.x)
            .mainValue(d => d.y)
            .size(d => d.size)
            .equals(previousData => previousData.length > 0),

        webglColor = color => {
            let { r, g, b, opacity } = d3.color(color).rgb();
            return [r / 255, g / 255, b / 255, opacity];
        },

        fillColor = fc
            .webglFillColor()
            .value((d, i) => webglColor(colorScale(i)))
            .data(me.data);

        series.decorate(program => fillColor(program));

        me.series = series;
    }

    /**
     * Dynamically import all d3 related dependencies
     * @returns {Promise<resolve>}
     */
    async promiseImportD3() {
        let imports = [
            () => import('../../../node_modules/d3-array/dist/d3-array.js'),
            () => import('../../../node_modules/d3-color/dist/d3-color.js'),
            () => import('../../../node_modules/d3-format/dist/d3-format.js'),
            () => import('../../../node_modules/d3-interpolate/dist/d3-interpolate.js'),
            () => import('../../../node_modules/d3-scale-chromatic/dist/d3-scale-chromatic.js'),
            () => import('../../../node_modules/d3-random/dist/d3-random.js'),
            () => import('../../../node_modules/d3-scale/dist/d3-scale.js'),
            () => import('../../../node_modules/d3-shape/dist/d3-shape.js'),
            () => import('../../../node_modules/d3-time-format/dist/d3-time-format.js'),
            () => import('../../../node_modules/@d3fc/d3fc-extent/build/d3fc-extent.js'),
            () => import('../../../node_modules/@d3fc/d3fc-random-data/build/d3fc-random-data.js'),
            () => import('../../../node_modules/@d3fc/d3fc-rebind/build/d3fc-rebind.js'),
            () => import('../../../node_modules/@d3fc/d3fc-series/build/d3fc-series.js'),
            () => import('../../../node_modules/@d3fc/d3fc-webgl/build/d3fc-webgl.js')
        ],

        modules = [],
        i       = 0,
        len     = imports.length,
        item;

        for (; i < len; i++) {
            item = await imports[i]();
            modules.push(item);
        }

        // Bug: Inside the webpack based dist envs, d3fc will copy its function to the module,
        // instead of putting them into the global fc namespace.
        // This hack resolves it.
        if (!self.fc) {
            self.fc = {};

            modules.forEach(item => {
                if (Object.keys(item).length > 0) {
                    Object.assign(self.fc, item);
                }
            });
        }

        return Promise.resolve();
    }

    /**
     *
     */
    render(force=false) {
        let me = this,
        ease;

        if (force || !me.stopAnimation) {
            ease = 5 * (0.51 + 0.49 * Math.sin(Date.now() / 1e3));

            me.xScale.domain([-ease, ease]);
            me.yScale.domain([-ease, ease]);

            me.series(me.data);

            // sadly not available
            // requestAnimationFrame(me.render.bind(me));
        }
    }

    /**
     * @param {String} canvasId
     * @param {Boolean} silent=false
     */
    renderSeries(canvasId, silent=false) {
        let me = this,
            webGl;

        me.canvasId = canvasId;

        if (me.series) {
            webGl = Neo.currentWorker.map[canvasId].getContext('webgl');

            me.series.context(webGl);

            // enforced rendering to apply the state when stopAnimation is present
            setTimeout(() => {
                me.render(true);

                // poor hack to fake requestAnimationFrame inside a SharedWorker
                !silent && setInterval(me.render.bind(me), 1000 / 60);
            }, 1000 / 60);
        }
    }

    /**
     * @param {Object} data
     * @param {Number} data.height
     * @param {Number} data.width
     */
    updateSize(data) {
        let me = this;

        me.canvasSize = data;

        if (me.series) {
            let webGl = me.series.context();

            Object.assign(webGl.canvas, {
                height: data.height,
                width : data.width
            });

            webGl.viewport(0, 0, webGl.canvas.width, webGl.canvas.height);
        }
    }
}

Neo.applyClassConfig(Helper);

let instance = Neo.create(Helper);

Neo.applyToGlobalNs(instance);

export default instance;
