'use struct';

module.exports = {

	randomInt(min, max)
	{
		if (max === undefined)
		{
			max = min;
			min = 0;
		}

		return Math.floor(Math.random() * Math.floor(max)) + min;
	},

	instanceSingleton(namespace, klass)
	{
		// from https://derickbailey.com/2016/03/09/creating-a-true-singleton-in-node-js-with-es6-symbols/
		const key = Symbol.for(namespace);

		// check if the global object has this symbol
		// add it if it does not have the symbol, yet
		// ------------------------------------------
		let globalSymbols = Object.getOwnPropertySymbols(global);
		let hasKey = (globalSymbols.indexOf(key) > -1);

		if (!hasKey)
		{
			global[key] = new (Function.prototype.bind.apply(klass, Array.prototype.slice.call(arguments, 1)))();
		}

		return this.singleton(namespace);
	},

	singleton(namespace)
	{
		const key = Symbol.for(namespace);

		// define the singleton API
		// ------------------------
		let singleton = {};
		Object.defineProperty(singleton, 'instance', {
			get: function()
			{
				return global[key];
			}
		});

		// ensure the API is never changed
		// -------------------------------
		Object.freeze(singleton);

		return singleton;
	},

	isVectorEmpty(vector)
	{
		return vector.x === 0 && vector.y === 0;
	}
}