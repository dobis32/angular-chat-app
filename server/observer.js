function Observer(cb) {
	this.cb = cb;
}

Observer.prototype = {
	next: function(data) {
		this.cb(data);
	}
};
