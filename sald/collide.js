//Implementation by Gabriel Burgess.

/* Circle vs Circle
 * INPUT: two circles specified by position and radius:
 *  c1 = {x:, y:, r:}, c2 = {x:, y:, r:}
 * RETURN VALUE:
 *  false if c1 and c2 do not intersect
 *  true if c1 and c2 do intersect
 */
function circleCircle(c1,c2)
{    
    //Closest distance the circles can be without overlap.
	var threshold = c1.r + c2.r;
    
    var vector2= function()
    {
        x : NaN,
        y : NaN
    };
    
    var temp = new vector2(c1.x - c2.x, c1.y - c2.y);
    
    //It is squared so that we don't have to take the square root.
    var magnitudeSquared = (temp.x * temp.x) + (temp.y * temp.y);
    
    //The threshold must be squared since the magnitude is also squared.
    if(magnitudeSquared < (threshold * threshold))
    {
        return true;
    }

	return false;
}

/* Rectangle vs Rectangle
 * INPUT: rectangles specified by their minimum and maximum extents:
 *  r = {min:{x:, y:}, max:{x:, y:}}
 * RETURN VALUE:
 *  false if r1 and r2 do not intersect
 *  true if r1 and r2 do intersect
 */
function rectangleRectangle(r1, r2)
{
	//Check to see if they are separated horizontally.
    if(r1.max.x < r2.min.x || r2.max.x < r1.min.x)
    {
        return false;
    }
    
    //Check to see if they are separated vertically.
    if(r1.max.y < r2.min.y || r2.max.y < r1.min.y)
    {
        return false;
    }
    
	return true;
}

/* Convex vs Convex
 * INPUT: convex polygons as lists of vertices in CCW order
 *  p = [{x:,y:}, ..., {x:, y:}]
 * RETURN VALUE:
 *  false if p1 and p2 do not intersect
 *  true if p1 and p2 do intersect
 */
function convexConvex(p1, p2)
{
	//An implementation of what we discussed in class. Essentially just a cross product check.
    var p1Length = p1.length;
    var p2Length = p2.length;
    
    for (var i = 0; i < p1Length; i++)
    {
        for(var j = 0; j <p2Length; j ++)
        {
            var position = ( (p1[i + 1].x - p1[i].x) * (p2[j].y - p1[i].y) ) - ( (p1[i + 1].y - p1[i].y) * (p2[j].x - p1[i].x) );
            
            if(position <= 0)
            {
                return true;
            }
        }
    }
    
	return false;
}

/* Rav vs Circle
 * INPUT: ray specified as a start and end point, circle as above.
 *  ray = {start:{x:, y:}, end:{x:, y:}}
 * RETURN VALUE:
 *  null if no intersection
 *  {t:} if intersection
 *    -- NOTE: 0.0 <= t <= 1.0 gives the position of the first intersection
 */
function rayCircle(r, c)
{
	//This method uses the quadratic formula in combination with the equation of a circle.
    var xDiff = r.end.x - r.start.x;
    var yDiff = r.end.y - r.start.y;
    var a = (xDiff * xDiff) + (yDiff * yDiff);
    var b = (2 * xDiff * (r.start.x - c.x)) + (2 * yDiff * (r.start.y - c.y));
    var c = ((r.start.x - c.x) * (r.start.x - c.x)) + ((r.start.y - c.y) * (r.start.y - c.y)) - (c.r * c.r);
    
    var dividend = -b - Math.sqrt((b * b) - (4 * a * c));
    var divisor = 2 * a;
    var t = dividend / divisor;
    
    if(t >= 0)
    {
        return {t: t};
    }
    
	return null;
}

/* Rav vs Rectangle
 * INPUT: ray as above, rectangle as above.
 * RETURN VALUE:
 *  null if no intersection
 *  {t:} if intersection
 *    -- NOTE: 0.0 <= t <= 1.0 gives the position of the first intersection
 */
function rayRectangle(r, b)
{
	//Implementation of the algorithm found here: https://www.siggraph.org/education/materials/HyperGraph/raytrace/rtinter3.htm
    var tOne = (b.min.x - r.start.x) / r.end.x;
    var tTwo = (b.max.x - r.start.x) / r.end.x;
    
    if(tOne > tTwo)
    {
        var temp = tOne;
        tOne = tTwo;
        tTwo = temp;
    }
    
    var tNear = tOne;
    var tFar = tTwo;
    
    if( !(tNear > tFar || tFar < 0) )
    {
        return {t: tNear};
    }
    
	return null;
}

/* Rav vs Convex
 * INPUT: ray as above, convex polygon as above.
 * RETURN VALUE:
 *  null if no intersection
 *  {t:} if intersection
 *    -- NOTE: 0.0 <= t <= 1.0 gives the position of the first intersection
 */
function rayConvex(r, p)
{
   /* First I determine if there's any intersection at all, then do a check to find t.
    * Inspired in part by this article: http://geomalgorithms.com/a13-_intersect-4.html
    * However, the approach they use requires too many operations in the worst case. So this is my attempt at shaving off some operations even though it may not look like it.
    * I need more time to test this.
    */
    var pLength = p.length;
    
    for(var i = 0; i < pLength; i++)
    {
        var position = ( (r.end.x - r.start.x) * (p[i].y - r.start.y) ) - ( (r.end.y - r.start.y) * (p[i].x - r.start.x) );
        
        //Then an intersection has occured.
        if(position <= 0)
        {
            //If the point is the vertex between the last and first edge of the polygon.
            var j = i;
            if(j === 0)
            {
                j = pLength - 2;
            }
            
            //Here's where I get a bit unconventional, because I'm going to check the value of t for two edges and then take the min.
            //This was so I could avoid running the following code for each edge.
            var nOne = {p1: p[j + 1], p2: {x: -p[j].x, y: -p[j].y}};
            var tempOne = { x: r.start.x - p[j].x, y : r.start.y - p[j].y };
            var tempTwo = { x: nOne.p2.x - nOne.p1.x, y: nOne.p2.y - nOne.p1.y };
            var numeratorOne =  (tempOne.x * tempTwo.x) + (tempOne.y * tempTwo.y);
            var denominatorOne = ((r.end.x - r.start.x) * tempTwo.x) + ((r.end.y - r.start.y) * tempTwo.y);
            var tOne = numeratorOne / denominatorOne;
            
            //Will fill this out later.
            var nTwo = {p1: p[j + 2], p2: {x: -p[j + 1].x, y: -p[j + 1].y}};
            var numeratorTwo;
            var denominatorTwo;
            var tTwo = numeratorTwo / denominatorTwo;
            
            if(tOne < tTwo)
            {
                return {t: tOne};
            }
            else
            {
                return {t: tTwo};
            }
        }
    }
    
	return null;
}




module.exports = {
	circleCircle: circleCircle,
	rectangleRectangle: rectangleRectangle,
	convexConvex: convexConvex,
	rayCircle: rayCircle,
	rayRectangle: rayRectangle,
	rayConvex: rayConvex
};
