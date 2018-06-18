'use struct';

const SAT = require('sat');
const Game = require('./game');
const Block = require('./block');
const maps = [require('./../data/maps/1.json')];

module.exports = class Level {
	constructor(level)
	{
		this.width = 640;
		this.height = 480;
		this.tileSize = 32;

		this.map = null;
		this.blocks = null;
		this.startLocations = null;

		if (level !== undefined)
		{
			this.load(level);
		}
	}

	toJSON()
	{
		return {
			tileSize: this.tileSize,
			map: {
				rows: this.rows,
				columns: this.columns,
				data: this.map
			},
			blocks: this.blocks.map((b) => { return b.toJSON(); })
		}
	}

	get rows()
	{
		return this.height / this.tileSize;
	}

	get columns()
	{
		return this.width / this.tileSize;
	}

	load(map)
	{
		this.map = null;
		this.blocks = [];

		if (typeof map === 'number')
		{
			this.map = maps[map];
		}
		else
		{
			// unsupported
			console.trace("Map value is unsupported", map, typeof map);
		}

		if (this.map)
		{
			console.log("generating blocks");
			this.blocks = this.generateBlocks();
			console.log("identifying start locations");
			this.startLocations = this.findPlayerStartLocations();

			console.log("loaded map", map, this.blocks.length, this.startLocations.length);
		}

		return this.map != null;
	}

	generateBlocks()
	{
		let blocks = [];
		for (let r = 0; r < this.rows; r++)
		{
			for (let c = 0; c < this.columns; c++)
			{
				let tile = this.map[r][c];
				if (tile > 0)
				{
					let location = {
						x: (c * this.tileSize),
						y: (r * this.tileSize)
					};

					let block = new Block(location, tile);
					Game.instance().spawnActor(block);
					blocks.push(block);
				}
			}
		}

		return blocks;
	}

	findPlayerStartLocations()
	{
		let startLocations = [];
		for (let r = 0; r < this.rows; r++)
		{
			for (let c = 0; c < this.columns; c++)
			{
				let tile = this.map[r][c];

				if (tile < 0)
				{
					startLocations.push({ x: c * this.tileSize, y: r * this.tileSize });
				}
			}
		}

		return startLocations;
	}
}