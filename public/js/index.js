
import Game from '/js/game.js';
import Keyboard from '/js/keyboard.js';

window.keyboard = new Keyboard();


window.addEventListener('load', function() {
	const game = new Game(document.getElementsByTagName('canvas')[0]);

	game.start();
});
