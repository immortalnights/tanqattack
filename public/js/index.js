
import Game from '/js/game.js';

window.addEventListener('load', function() {
	const game = new Game(document.getElementsByTagName('canvas')[0]);

	game.start();
});
