

var CanvasInspectorApp = function() {
	
	this._canvas = null;
	this._ctx = null;
	
};


CanvasInspectorApp.prototype.start = function() {
	$('#fileInput').change(this._handleFileSelect.bind(this));
	
	this._canvas = document.getElementById('canvas');
	this._ctx = canvas.getContext('2d');
	
	// TODO output
};


// Load image from file input
CanvasInspectorApp.prototype._handleFileSelect = function(event) {
	
	var _this = this;
	
	const file = event.target.files[0];
	
	if (file && file.type.startsWith('image')) {
		const reader = new FileReader();
		
		reader.onload = function(event) {
			_this._canvas_loadImageSrc(event.target.result)
		};
		
		reader.readAsDataURL(file);
	} else {
		alert('Please select a valid image file.');
	}
};



CanvasInspectorApp.prototype._canvas_loadImageSrc = function(imageSrc) {
	
	var _this = this;
	
	const img = new Image();
	img.src = imageSrc;
	
	img.onload = function () {
		const canvas = _this._canvas;
		const ctx = _this._ctx;
		
		// Set canvas size to match the image size
		canvas.width = img.width;
		canvas.height = img.height;
		
		// Clear previous content
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		
		// Draw the image on the canvas
		ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
		
		_this._startInspection();
	};
	
};


CanvasInspectorApp.prototype._startInspection = async function() {
	
	var inspector = new SleepProfileInspector(this._canvas);
	
	var result = await inspector.process();
	
	$('#output').text(result.achievements);
	
};











$(document).ready(function () {
	var app = new CanvasInspectorApp();
	
	app.start();
	
	// app._canvas_loadImageSrc('assets/test1.png');
});







