'use strict';

export default class Keyboard {
	constructor()
	{
		this.keys = {};
		this.mapping = {
			ArrowUp: 'MoveUp',
			ArrowDown: 'MoveDown',
			ArrowLeft: 'MoveLeft',
			ArrowRight: 'MoveRight',
			KeyW: 'MoveUp',
			KeyS: 'MoveDown',
			KeyA: 'MoveLeft',
			KeyD: 'MoveRight',
			ControlRight: 'Fire',
			Space: 'Fire'
		};
	}

	init()
	{
		var direction = { x: 0, y: 0 };
		window.addEventListener('keydown', (event) => {
			this.keys[event.code] = true;
		});
		window.addEventListener('keyup', (event) => {
			delete this.keys[event.code];
		});
	}

	reset()
	{
		this.keys = {};
	}

	resolve()
	{
		let result = {};
		Object.keys(this.keys).map((key) => {
			if (this.mapping[key])
			{
				result[this.mapping[key]] = true;
			}
		});

		return result;
	}
}