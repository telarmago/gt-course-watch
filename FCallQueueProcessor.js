'use strict'

function FCallQueueProcessor(func, thisArg, delay) {
	this.dispatch_delay_ms = 
		typeof delay !== 'undefined' ? delay : 100;
	this.fcall_q = [];
	this.processing_active = false;
	this.func = func;
	this.func_context = thisArg;
};

//check_probe_q
// Using setTimeout, recursively keep polling the 'fcall_q'
FCallQueueProcessor.prototype.poll_q = function() {
	var _this = this;

	if(_this.fcall_q.length > 0) {
		// each 'fcall' is a list of parameters to be supplied to this.func
		var fcall = _this.fcall_q.shift();
		_this.processing_active = true;
		// TRACKING show the current CRN being tested
		// console.log(fcall[0]);
		_this.func.apply(_this.func_context, fcall);
		setTimeout(function() {
			_this.poll_q();
		}, _this.dispatch_delay_ms);
	} else {
		_this.processing_active = false;
	}	
}

// Only start the recursive polling function 'poll_q' if it is not
// currently recursively calling itself.
FCallQueueProcessor.prototype.alert_q_to_poll = function() {
	if (!this.processing_active) {
		this.poll_q();	
	}
};

FCallQueueProcessor.prototype.empty = function() {
	return !this.fcall_q.length;
}

module.exports = FCallQueueProcessor;
