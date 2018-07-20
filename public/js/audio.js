
export class Audio {
	constructor(fileName)
	{
		this.context = new AudioContext();
		this.fileName = fileName;
	}

	play()
	{
		let self = this;
		return (function() {
			let source = self.context.createBufferSource();
			source.connect(self.context.destination);
			source.buffer = self.buffer;
			source.start(0);

			return {
				stop: function()
				{
					source.stop();
				}
			}
		})();
	}

	load()
	{
		let promise;
		if (!this.buffer)
		{
			let url = './sfx/' + this.fileName;
			let self = this;
			promise = new Promise((resolve, reject) => {
				var request = new XMLHttpRequest();
				request.open('GET', url, true);
				request.responseType = 'arraybuffer';

				// Decode asynchronously
				request.onload = () => {
					this.context.decodeAudioData(request.response, (buffer) => {
						this.buffer = buffer;
						resolve(this);
					}, reject);
				}

				request.send();
			});

			return promise;
		}
	}
}