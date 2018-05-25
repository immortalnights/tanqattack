
/** Returns the x, y, width and height of the polygon */
function minimumAreaRectangle(polygon)
{

	var min = { x: polygon.pos.x, y: polygon.pos.y };
	var max = { x: polygon.pos.x, y: polygon.pos.y };

	for (var pointIndex = 0; pointIndex < polygon.points.length; ++pointIndex)
	{
		var point = polygon.points[pointIndex];
		var relative = {
			x: polygon.pos.x + ~~point.x,
			y: polygon.pos.y + ~~point.y
		};

		if (relative.x < min.x)
		{
			min.x = relative.x;
		}
		else if (relative.x > max.x)
		{
			max.x = relative.x;
		}

		if (relative.y < min.y)
		{
			min.y = relative.y;
		}
		else if (relative.y > max.y)
		{
			max.y = relative.y;
		}
	}

	return {
		x: ~~min.x,
		y: ~~min.y,

		width: Math.floor(max.x - min.x),
		height: Math.floor(max.y - min.y)
	};
}


function SATPolygonFronTiltedPolygon(x, y, tiledPolygon)
{
	var points = [];
	for (var pointIndex = 0; pointIndex < tiledPolygon.length; ++pointIndex)
	// for (var pointIndex = tiledPolygon.length-1; pointIndex >= 0; --pointIndex)
	{
		var point = tiledPolygon[pointIndex];
		points.push(new SAT.Vector(~~point.x, ~~point.y));
	}

	return new SAT.Polygon(new SAT.Vector(x, y), points);
}

function drawSATPolygon(context, polygon)
{
	context.strokeStyle = polygon.color || '#fff';
	context.beginPath();

	context.moveTo(polygon.pos.x, polygon.pos.y);
	for (var pointIndex = 0; pointIndex < polygon.points.length; ++pointIndex)
	{
		var point = polygon.points[pointIndex];
		var relative = {
			x: polygon.pos.x + ~~point.x,
			y: polygon.pos.y + ~~point.y
		};
		
		context.lineTo(relative.x, relative.y);
	}

	context.closePath();
	context.stroke();
}

function drawSATCircle(context, circle)
{
	context.strokeStyle = circle.color || '#fff';
	context.beginPath();

	context.arc(circle.pos.x, circle.pos.y, circle.r, 0, 2 * Math.PI, false);
	context.stroke();
}

function calculateSATCollision(a, b, response)
{
	// response.clear();
	var collided = false;

	if (a instanceof SAT.Circle)
	{
		if (b instanceof SAT.Circle)
		{
			collided = SAT.testCircleCircle(a, b, response);
		}
		else
		{
			collided = SAT.testCirclePolygon(a, b, response);
		}
	}
	else
	{
		if (b instanceof SAT.Circle)
		{
			collided = SAT.testPolygonCircle(a, b, response);
		}
		else
		{
			collided = SAT.testPolygonPolygon(a, b, response);
		}
	}

	return collided;
}
