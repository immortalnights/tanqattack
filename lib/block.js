'use strict';

const SAT = require('sat');
const Actor = require('./actor');
const tileCollisionPolygons = require('./../data/tilecollisionmap.json');

module.exports = class Block extends Actor {
	constructor(options)
	{
		super(options);
		this.type = 'block';
		this.setCollisionPolygon();
	}

	setCollisionPolygon()
	{
		let collisionMap = tileCollisionPolygons[this.tile];
		if (collisionMap)
		{
			this.location.x += collisionMap.offset[0];
			this.location.y += collisionMap.offset[1];

			let vectors = collisionMap.points.map(function(arr) {
				return new SAT.Vector(arr[0], arr[1]);
			});

			vectors.unshift(new SAT.Vector(0, 0));
			this.polygon = new SAT.Polygon(new SAT.Vector(this.location.x, this.location.y), vectors);
		}
	}

	toJSON()
	{
		return this.polygon;
	}
};