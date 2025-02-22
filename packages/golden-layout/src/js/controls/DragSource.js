/**
 * Allows for any DOM item to create a component on drag
 * start tobe dragged into the Layout
 *
 * @param {jQuery element} element
 * @param {Object} itemConfig the configuration for the contentItem that will be created
 * @param {LayoutManager} layoutManager
 *
 * @constructor
 */
lm.controls.DragSource = function (element, itemConfig, layoutManager, customDragListener) {
	this._element = element;
	this._itemConfig = itemConfig;
	this._layoutManager = layoutManager;
	this._dragListener = null;
	this._dragProxy = null;

	this._createDragListener(customDragListener);
};

lm.utils.copy(lm.controls.DragSource.prototype, {

	/**
	 * Called initially and after every drag
	 *
	 * @returns {void}
	 */
	_createDragListener: function (customDragListener) {
		if (this._dragListener !== null) {
			this._dragListener.destroy();
		}

		this._dragListener = customDragListener || new lm.utils.DragListener(this._element);
		if (typeof this._dragListener.on != "function") {
			return;
		}
		this._dragListener.on('dragStart', this._onDragStart, this);
		this._dragListener.on('dragStop', this._createDragListener, this);
	},

	/**
	 * Callback for the DragListener's dragStart event
	 *
	 * @param   {int} x the x position of the mouse on dragStart
	 * @param   {int} y the x position of the mouse on dragStart
	 *
	 * @returns {void}
	 */
	_onDragStart: function (x, y) {
		var itemConfig = this._itemConfig;
		if (lm.utils.isFunction(itemConfig)) {
			itemConfig = itemConfig();
		}
		var contentItem = this._layoutManager._$normalizeContentItem($.extend(true, {}, itemConfig));
			this._dragProxy = new lm.controls.DragProxy(x, y, this._dragListener, this._layoutManager, contentItem, null);

		this._layoutManager.transitionIndicator.transitionElements(this._element, this._dragProxy.element);
	}
});
