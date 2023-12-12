

var SleepProfileInspector = function(canvas) {
	
	this._canvas = canvas;
	this._ctx = canvas.getContext('2d');
	
};



SleepProfileInspector.prototype.process = async function() {
	
	result = {};
	
	result.achievements = (await this._detectAchievements()).join(',');
	
	return result;
	
};



SleepProfileInspector.prototype._detectAchievements = async function() {
	
	let y = 2062;
	let interval_y = 440;
	let rows = 5;
	
	let achievementResults = [];
	
	for (let i = 0; i < rows; i++) {
		achievementResults = achievementResults.concat(await this._detectAchievementsRow(y + (interval_y * i)));
	}
	
	return achievementResults;
	
};

SleepProfileInspector.prototype._detectAchievementsRow = async function(y) {
	
	const canvas = this._canvas;
	const ctx = this._ctx;
	
	canvas_width = canvas.width;
	
	
	let lvlLookup = {
		'0' : 5,
		'1' : 15,
		'2' : 30,
		'3' : 50,
		'4' : 70,
		'5' : 100,
		'6' : 140,
		'7' : 180,
		'8' : 240,
		'9' : 300,
		'10' : 300,	// Max
	};
	
	
	let achievementResults = [];
	
	let startPixel_i = null;
	let greenPixels = 0;
	let greyPixels = 0;
	
	
	var pixels = ctx.getImageData(0, y, canvas_width, 1).data;
	
	for (let i = 0; i < pixels.length; i += 4) {
		
		// var pixel = ctx.getImageData(x, y, 1, 1).data;
		var pixel_hex = '#' + ("000000" + rgbToHex(pixels[i+0], pixels[i+1], pixels[i+2])).slice(-6);
		
		if (startPixel_i === null) {
			// Currently looking for the start pixel
			if (pixel_hex == '#26cc62' || pixel_hex == '#ebebeb') {
				startPixel_i = i;
			}
		}
		if (startPixel_i !== null) {
			// Currently counting pixels and looking for the end pixel
			if (pixel_hex == '#26cc62') {
				greenPixels++;
			} else if (pixel_hex == '#ebebeb') {
				greyPixels++;
			} else if (pixel_hex == '#ffffff') {
				// End pixel!
				
				// Determine the progress percent using the ratio of green to grey pixels found.
				let percent = greenPixels / (greenPixels + greyPixels);
				
				
				
				// Determine the Lv.
				var lvlImageData = ctx.getImageData((i/4)-10, y - 145, 25, 25).data;
				
				var lvlCanvas = document.createElement('canvas');
				lvlCanvas.width = 25;
				lvlCanvas.height = 25;
				lvlCanvas.getContext('2d').drawImage(canvas, (i/4)-10, y - 145, 25, 25,  0,0,25,25);
				let base64Image = lvlCanvas.toDataURL();
				
				var lvlText = '0';
				try {
					// Use Tesseract.js to detect text
					const result = await Tesseract.recognize(base64Image, 'eng', {
						logger: function (info) {
							console.log(info);
						}
					});
					
					lvlText = result.text.trim();
					// Handle the detected text as needed
				} catch (error) {
					console.error('Error:', error);
				}
				
				ctx.strokeRect((i/4)-10, y - 145, 25, 25);
				
				
				
				// Determine the sleep styles count given the progress & the level.
				let sleepStyleCount = lvlLookup[lvlText] * percent;
				
				sleepStyleCount = Math.floor(sleepStyleCount);
				// console.log(sleepStyleCount);
				
				
				achievementResults.push(sleepStyleCount);
				
				
				// Reset the tracking so we start finding the next column.
				startPixel_i = null;
				greenPixels = 0;
				greyPixels = 0;
			}
		}
		
	}
	
	ctx.rect(0, y, 30, 1);
	ctx.fill();
	
	
	return achievementResults;
	
};


SleepProfileInspector.prototype._countPixelsWithColour = function(imageData, colourHex) {
	
	let count = 0;
	
	for (let i = 0; i < imageData.length; i += 4) {
		
		var pixel_hex = '#' + ("000000" + rgbToHex(imageData[i+0], imageData[i+1], imageData[i+2])).slice(-6);
		
		if (pixel_hex == colourHex) {
			count++;
		}
		
	}
	
	return count;
	
};



function rgbToHex(r, g, b) {
	if (r > 255 || g > 255 || b > 255)
		throw "Invalid color component";
	return ((r << 16) | (g << 8) | b).toString(16);
}