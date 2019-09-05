	
	// dom elements used by many functions
	const svg = d3.select("svg")
	var target,targetC,dGo;
	
	const FADEIN=100,
	FADEOUT=100,
	ACTIVE=500,
	FDELAY=300
	
	const  
	radius=120,
	time=60,
	shots=35,
	between=(1000*time/shots-FADEIN-ACTIVE-FADEOUT-FDELAY)*2
	if (between<=0) {alert("impossible settings");throw '';}
	
	var width, height, legendSize, delay, score, ct, tm;
	
	legendSize=40; //parseInt(d3.select(".legend text").style("font-size"));
	var dp=[
	]
	
	start()
	
	// from https://stackoverflow.com/questions/1248081/get-the-browser-viewport-dimensions-with-javascript
	function viewPort(){
		if(window.innerWidth !== undefined && window.innerHeight !== undefined) { 
			var w = window.innerWidth;
			var h = window.innerHeight;
			} else {  
			var w = document.documentElement.clientWidth;
			var h = document.documentElement.clientHeight;
		}
		return [w,h]
	}
	
	// https://www.visualcinnamon.com/2016/05/data-based-svg-gradient-d3.html
	function defineDefs(svg) {
		svg.append("defs")
		.selectAll("radialGradient")
		.data([{color:"#c8c8c8"},{color:"#f8f8f8"},{color:"#c8c8c8"},{color:"#f8f8f8"},{color:"#c8c8c8"}])
		.enter()
		.append("radialGradient")
		.attr("id", function(d,i){ return "gradient" + i; })
		.attr("cx", "30%")
		.attr("cy", "30%")
		.attr("r", "65%")
		.each(function(d, i) {
			d3.select(this)
			.selectAll("stop")
			.data([
			{offset:"0%",color: -0.25},
			{offset:"50%",color: 0},
			{offset:"100%",color: 0.25 }
			])
			.enter()
			.append("stop")
			.attr("offset", function(dd){return dd.offset})
			.attr("stop-color", function(dd){return d3.rgb(d.color).darker(dd.color)})
		})
		;
		var filter = svg.append("defs")
		.append("filter")
		.attr("id", "brightness")
		.append("feComponentTransfer")
		filter.append("feFuncR").attr("type","linear").attr("slope","1");
		filter.append("feFuncG").attr("type","linear").attr("slope","1");
		filter.append("feFuncB").attr("type","linear").attr("slope","1");
	}
	
	function prepare() {
		
		[width, height]=viewPort();
		width=width-20;
		height=height-20;
		
		width=Math.min(width,height-legendSize);
		height=width+legendSize;
		
		alert("width:"+width+", radius:"+radius)
		
		var ok=(width/radius<6) ? false : true 
		
		d3.select("#container").style("width",width+"px");
		d3.select("#container").style("height",height+"px");
		svg
		.attr("width", width-2)
		.attr("height", height-2)
		.attr("rx",5)
		.attr("ry",5)
		;
		
		delay=d3
		.range(shots)
		.map(x => [x/(shots-1),Math.random()])
		.sort((x,y) => (x[1]-y[1]))
		.map(x => x[0])
		;
		
		defineDefs(svg)
		prepareText()
		prepareTarget()
		prepareGo(ok) 
		dp.forEach(function(d) {
			appendShot({x:d[0],y:d[1],animation:false})
		});
		return (ok) 
		
		function prepareText() {
			var text=[
			{"id":"dTime","text":"time: ...","tanchor":"start","x":10},
			{"id":"dScore","text":"score: ...","tanchor":"end","x":parseInt(svg.style("width"))-10}
			];
			
			svg
			.append("g")
			.attr("class","legend")
			.selectAll("text")
			.data(text)
			.enter()
			.append("text")
			.attr("x",function(d){return d.x})
			.attr("y",0)
			//		.attr("dy",40)
			.attr("id",function(d){return d.id})
			.text(function(d){return d.text})
			.attr("text-anchor",function(d){return d.tanchor})
			//		.attr("alignment-baseline","hanging")
			//		.attr("font-family", "Sigmar One")
			.attr("font-size", legendSize+"px")
			//		.attr("font-weight", "900")
			//		.attr("fill", "#0070b0")
			;
		}
		
		function prepareTarget() {
			
			targetC=svg.append("g")
			.attr("id","dTargetC")
			.attr("opacity",0)
			;
	
			target=targetC.append("g")
			.attr("transform","rotate(0)")
			.attr("id","dTarget")
			;
			
			target
			.selectAll('circle')
			.data([1,4/5,3/5,2/5,1/5])
			.enter()
			.append("circle")
			.classed("t",true)
			.attr("class",function(d,i){return "target itarget"+i})	
			.attr("cx", 0)
			.attr("cy", 0)
			.attr("r", function(d,i){return radius*d})
			//.style("fill", "url(#target-gradient)")
			.style("fill", function(d,i) { return "url(#gradient" + i + ")"; });
			;
			target.append("g");
			target.append("g");
			
			target.append("circle")
			.classed("shot1",true)
			.attr("cx", radius)
			.attr("cy", 0*radius/2)
			.attr("opacity",0)
			.attr("r", 3);
		}	
		
		function prepareGo(ok) {
			dGo=svg.append("g").classed("go",true); //.attr("opacity",0);
			
			dGo
			.append("rect")
			.attr("id","dGo")
			.attr("width",200)
			.attr("height",100)
			.attr("x",(width-200)/2)
			.attr("y",(height-100)/2)
			.attr("rx",5)
			.attr("ry",5)
			;
			dGo
			.append("text")
			.classed("text",true)
			.attr("x",width/2)
			.attr("y",height/2)
			.text((ok) ? "go!" : "window too small")
			.attr("font-size", legendSize+"px")	
			;
			var l=dGo.select("text").node().getComputedTextLength()
			dGo.select("rect")
			.attr("width",l+50)
			.attr("x",(width-l-50)/2)
		}
	}
	
	// from https://stackoverflow.com/questions/38224875/replacing-d3-transform-in-d3-v4
	function getTranslation(transform) {
		// Create a dummy g for calculation purposes only. This will never
		// be appended to the DOM and will be discarded once this function 
		// returns.
		var g = document.createElementNS("http://www.w3.org/2000/svg", "g");
		
		// Set the transform attribute to the provided string value.
		g.setAttributeNS(null, "transform", transform);
		
		// consolidate the SVGTransformList containing all transformations
		// to a single SVGTransform of type SVG_TRANSFORM_MATRIX and get
		// its SVGMatrix. 
		var matrix = g.transform.baseVal.consolidate().matrix;
		
		// Below calculations are taken and adapted from the private function
		// transform/decompose.js of D3's module d3-interpolate.
		var {a, b, c, d, e, f} = matrix;   // ES6, if this doesn't work, use below assignment
		// var a=matrix.a, b=matrix.b, c=matrix.c, d=matrix.d, e=matrix.e, f=matrix.f; // ES5
		var scaleX, scaleY, skewX;
		if (scaleX = Math.sqrt(a * a + b * b)) a /= scaleX, b /= scaleX;
		if (skewX = a * c + b * d) c -= a * skewX, d -= b * skewX;
		if (scaleY = Math.sqrt(c * c + d * d)) c /= scaleY, d /= scaleY, skewX /= scaleY;
		if (a * d < b * c) a = -a, b = -b, skewX = -skewX, scaleX = -scaleX;
		return {
			translateX: e,
			translateY: f,
			rotate: Math.atan2(b, a) * 180 / Math.PI,
			skewX: Math.atan(skewX) * 180 / Math.PI,
			scaleX: scaleX,
			scaleY: scaleY
		};
	}			
	
	function endlessRotate({duration,step}) {
		var shape=target;
		var pos=getTranslation(shape.attr("transform"));
		if (step!=0) shape.classed("stop",true);
		shape
		.transition()
		.ease((step==0) ? d3.easeLinear : d3.easeQuadOut)
		.duration(duration)
		.attrTween("transform", () => d3.interpolate("rotate("+pos.rotate+")", "rotate("+1*(pos.rotate+((step==0) ? 360 : 360))+")"))
		.on("end",function(){
			if (step==0 && !shape.classed("stop")) {
			endlessRotate({duration:duration,step:0})}
			else {if (step!=0 && shape.classed("stop")) processScore()}
		})
		;
	}	
	
	function startTimer(time) {
		function updateTime(msec) {
			var dTime=d3.select("#dTime");
			var remTime=Math.floor(time+1-msec/1000);
			dTime.text("time: "+remTime);
			if (remTime<=10) {
				dTime.style("fill","#d00000")
			}
		}
		score=0;
		d3.select("#dScore").text("score: 0");
		
		t = d3.timer(function(elapsed) {
			svg.classed("cursorOff",true)
			elapsed2=ct*1000+between*delay.filter((d,i) => (i<ct)).reduce((total, d) => total + d,0)+d3.now()-tm;
			if (ct<shots) {
				console.log(Math.round(elapsed2))
				updateTime(elapsed2);
			}
			else {
				t.stop();
			}
		}, 100);
		return t
	}
	
	function processScore() {
		
		if (target.selectAll("circle.shot").size()>1) {
			var xScale=d3.scaleLinear()
			.domain([-3, +3])
			.range([-84/2,84/2]);
			dAxis = d3.axisBottom(xScale)
			.ticks(12)
			.tickFormat(function(d,i){return (i % 2 ==0) ? d : ''}) 
			.tickSize(4)
			.tickPadding(10)
			
			var tr="translate(0,"+1*(height-0.5*radius-getTranslation(targetC.attr("transform")).translateY)+")";
			var hi=targetC.append("g").attr("transform",tr) //.attr("transform","rotate(90)");
			hi.append("g").call(dAxis);
			hi.selectAll("g g.tick line")
			.attr("y2", function(d,i){return (i % 2 ==0) ? 6 : 3});
			var cn=d3.range(-6,+7)	
			var points=cn.map((d) => [d*7,0])
			var lineGenerator = d3.line().curve(d3.curveCardinal);
			var pathData = lineGenerator(points);
			
			var ss=computeSS();
			
			var zebra=createZebra() 
			
			function createZebra() {
				
				var zebra=target.select("g")
				
				var pointsArea = [
				[0, -1*radius],
				[0, 1*radius],
				[1, 2*radius],
				[1, -(Math.round(legendSize*1.5+radius))+height-0.5*radius]
				];
				
				var pos=getTranslation(target.attr("transform")) 
				
				zebra
				.attr("transform","rotate("+(-1*pos.rotate)+")")
				.attr("opacity",0)
				
				var temp=getTranslation(zebra.attr("transform"))
				
				cn.forEach(function(dd){
					var striscia=(dd>0) ? dd-1 : dd;
					
					if (Math.abs(dd) % 2 == 1) return;
					
					var areaGenerator=d3.area()
					.curve(d3.curveMonotoneY)
					.x0(function(d){return (d[0]==0) ? ss/2*striscia : striscia*7})
					.x1(function(d){return (striscia==0) ? 1 : (d[0]==0) ? ss/2*(striscia+1) : (striscia+1)*7})
					.y0(function(d,i){return d[1]})
					.y1(function(d,i){return d[1]})
					;
					
					var area = areaGenerator(pointsArea);
					
					zebra
					.append('path')
					.attr('d', area)
					.attr("fill","#0070b0")
					;
					
					zebra
					.transition()
					.duration(1000)
					.attr("opacity",0.05)
				});
			}
			
			var dCn=hi.append("g").attr("id","cnorm");
			
			dCn.append('path')
			.attr("fill","none")
			.attr("stroke","#999")
			.attr('d', pathData);
			
			points=cn.map((d,i) => [d*7,-Math.round(7*target.selectAll(".shot").size()*Math.exp(-Math.pow(d/2,2)/2)/Math.sqrt(2*Math.PI))])
			pathData = lineGenerator(points);
			
			dCn.select("path")
			.transition()
			.duration(1500)
			.attr('d', pathData)
			.on("end",function() {
				var gpn=targetC.append("g").attr("id","nSample");
				//				console.log(xxx.xxx);
				buildNormal(gpn,tr) 
			})
			;
		} 
		
		else {
			dGo.select("text").text("too few shots")
			var l=dGo.select("text").node().getComputedTextLength()
			dGo.select("rect")
			.attr("width",l+50)
			.attr("x",(width-l-50)/2)
			dGo.attr("transform","")
			dGo.on("click",null)
			limbo()
		}
	}
	
	function limbo() {
		svg.classed("cursorOff",false)
		svg.on("click",function(){
			svg.on("click",null)
			svg.selectAll("*").remove();
			console.log("rimosso")
			start()
		})
	}
	
	function computeSS() {
		
		// from https://stackoverflow.com/questions/14846767/std-normal-cdf-normal-cdf-or-error-function/14873282
		function erf(x) {
			// save the sign of x
			var sign = (x >= 0) ? 1 : -1;
			x = Math.abs(x);
			
			// constants
			var a1 =  0.254829592;
			var a2 = -0.284496736;
			var a3 =  1.421413741;
			var a4 = -1.453152027;
			var a5 =  1.061405429;
			var p  =  0.3275911;
			
			// A&S formula 7.1.26
			var t = 1.0/(1.0 + p*x);
			var y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
			return sign * y; // erf(-x) = -erf(x);
		}
		
		var ss=target.selectAll(".shot").nodes().reduce((total, circle) => total + Math.pow(circle.cx.baseVal.value,2)+Math.pow(circle.cy.baseVal.value,2),0); 
		var sigma=Math.sqrt(ss/2/target.selectAll(".shot").size());
		var nRadius=radius/sigma
		// from https://en.wikipedia.org/wiki/Truncated_normal_distribution#Two_sided_truncation[2]
		var sigmaC=sigma/Math.sqrt(1-nRadius*Math.exp(-nRadius*nRadius/2)/(Math.sqrt(2*Math.PI))/(erf(nRadius)-0.5));
		return (sigmaC) ? sigmaC : sigma;
	}
	
	function getXY(circle) {
		var x=1*circle.getAttribute("cx"); 
		var y=1*circle.getAttribute("cy"); 
		var theta=getTranslation(target.attr("transform")).rotate;
		return rotate(x,y,-theta)
	}
	
	function orderShots() {
		
		var shotOrder=[];
		target.selectAll("circle.shot").each(function(d,i){
			var [x,y]=getXY(this);
			shotOrder.push([x,y,this.getAttribute("cx"),this.getAttribute("cy")])
		})
		shotOrder.sort(function(a,b){return b[1]-a[1]})
		shotOrder.forEach(function(item) {
		})
		
		target.selectAll("circle.shot").classed("todelete",true)
		
		shotOrder.forEach(function(item) {
			appendShot({x:item[2],y:item[3],animation:false})		
		})
		
		target.selectAll("circle.shot.todelete").remove()
		
	}		
	
	function buildNormal(gpn) {
		
		function rotateTarget90(gpn) {
			var zebra=target.select("g")
			zebra
			.transition()
			.ease(d3.easeQuadInOut)
			.duration(1000)
			.attr("transform",zebra.attr("transform")+" rotate(-90)")
			
			target
			.transition()
			.ease(d3.easeQuadInOut)
			//			.ease(d3.easeLinear)
			.duration(1000)
			.attr("transform",target.attr("transform")+" rotate(90)")
			.on("end",function(){buildNormal(gpn)})
			;	
		}
		
		var range=d3.range(-84/2,+84/2,7) //
		
		// usata per i colpi
		var nScale=d3.scaleQuantize()
		.domain([-3, +3])
		.range(range);
		
		var ss=computeSS();
		
		orderShots();
		
		target.selectAll("circle.shot").each(function(da,ia){	
			
			var [x1,y1]=getXY(this);
			var xs=x1/ss
			var temp=nScale(xs)+4;
			
			var pn=gpn
			.append("circle")
			.classed("normal",true)
			.attr("r",0)
			.attr("cx",0)
			.attr("cy",0)
			.attr("nscale",function() {return nScale(xs)})
			.attr("opacity",0*1)
			;
			
			var nScaleCount=gpn.selectAll("circle").filter(function(d){return (d3.select(this).attr("nscale")==nScale(xs))}).size();
			
			var points = [
			[x1, y1],
			[x1, 1*radius],
			[nScale(xs)+4, 2*radius],
			[nScale(xs)+4, -(Math.round(legendSize*1.5+radius))+height-0.5*radius+4-7*nScaleCount]
			];
			
			var path = gpn.append("path")
			.data([points])
			.attr("d", d3.line().curve(d3.curveMonotoneY))
			.attr("opacity",0)
			
			var l = path.node().getTotalLength();
			
			// Returns an attrTween for translating along the specified path element.
			// https://bl.ocks.org/mbostock/1705868
			function translateAlong(path) {
				var l = path.getTotalLength();
				return function(d, i, a) {
					return function(t) {
						var p = path.getPointAtLength(t * l);
						return "translate(" + p.x + "," + p.y + ")";
					};
				};
			}
			
			function bounce(h) {
				if (!arguments.length) h = 0.25;
				var b0 = 1 - h,
				b1 = b0 * (1 - b0) + b0,
				b2 = b0 * (1 - b1) + b1,
				x0 = 2 * Math.sqrt(h),
				x1 = x0 * Math.sqrt(h),
				x2 = x1 * Math.sqrt(h),
				t0 = 1 / (1 + x0 + x1 + x2),
				t1 = t0 + t0 * x0,
				t2 = t1 + t0 * x1,
				m0 = t0 + t0 * x0 / 2,
				m1 = t1 + t0 * x1 / 2,
				m2 = t2 + t0 * x2 / 2,
				a = 1 / (t0 * t0);
				return function(t) {
					return t >= 1 ? 1
					: t < t0 ? a * t * t
					: t < t1 ? a * (t -= m0) * t + b0
					: t < t2 ? a * (t -= m1) * t + b1
					: a * (t -= m2) * t + b2;
				};
			}
			
			pn
			.attr("transform","translate("+x1+","+y1+")")
			.attr("r",3)
			.transition()
			.duration(500)
			.attr("opacity",1)
			.transition()
			.delay(ia*150)
			.transition()
			.ease(bounce(0.0125)) 
			.duration(l*8)
			.attrTween("transform", translateAlong(path.node()))
			.on("end",function(){
				pn.classed("falled",true)
				var falledCount=gpn.selectAll("circle.normal.falled").size()
				var shotCount=target.selectAll("circle.shot").size()
				if (falledCount==shotCount) rotateTarget90(gpn)
				if (falledCount==2*shotCount) {
					target.select("g").transition().duration(1000).attr("opacity",0);
					target.selectAll("circle.shot").transition().duration(1000).attr("opacity",0);
					limbo()
				}
			})
			;
		})
	}		
	
	function endlessFade({position,allowClick}) {
		var shape=targetC;
		tm=d3.now()
		if (shape.classed("stop")) return;
		if (position) shape.attr("transform","translate("+position.x+","+position.y+")");
		shape
		.transition()
		.duration(FDELAY+between*delay[ct])
		.transition()
		.ease(d3.easeLinear)
		.on("start",function(){
			if (!allowClick) return
			target.classed("cursorOn",true);
			target.classed("cursorOff",false);
//			target.on("click",clickOnTarget)
			target.on("touchstart",clickOnTarget)
		})
		.duration(FADEIN)
		.attr("opacity",1)
		.transition()
		.ease(d3.easeLinear)
		.duration(ACTIVE)
		.transition()
		.ease(d3.easeLinear)
		.duration(FADEOUT)
		.attr("opacity",(ct<shots-1) ? 0 : 1)
		.attrTween("filter",(ct<shots-1) ? null : function(){return function(t){
			d3.select("filter").select("feComponentTransfer").select("feFuncR").attr("slope",1+t*0.5);
		return "url(#brightness)"}})
		.on("end",function(){
			console.log((ct)+":"+Math.round(d3.now()-tm)+":"+Math.round(between*delay[ct]))
			target.classed("cursorOn",false)
			target.classed("cursorOff",true)
//			target.on("click",null)
			target.on("touchstart",null)
			ct++;
			if (ct==shots) {
				svg.classed("cursorOff",false)
				target.classed("cursorOn",false)
				target.classed("cursorOff",false)
				targetC
				.classed("stop",true)
				.transition()
				.on("start",function(){target.on("click",null)})
				.duration(FADEIN+0*5000)
				.attr("opacity",1)
				.attrTween("filter",function(){return function(t){
					d3.select("filter").select("feComponentTransfer").select("feFuncR").attr("slope",1+(1-t)*0.5);
				return "url(#brightness)"}})
				.transition()
				.attr("filter",null)
				.duration(2000-FADEIN)
				.attr("transform","translate("+Math.round(width/2)+","+Math.round(legendSize*1.5+radius)+")")
				;
				endlessRotate({duration:4000,step:1});
				} else {
				callEndlessFade(true)
			}
		})
		;
	}
	
	function callEndlessFade(allowClick) {
		function randomCenter() {
			var x=Math.round(1+radius+Math.random()*(width-2-radius*2));
			var y=Math.round(legendSize+1+radius+Math.random()*(height-legendSize-2-radius*2));
			return {"x":x,"y":y}
		}
		var pos=false;
		if (allowClick) pos=randomCenter();
		endlessFade({position:pos,allowClick:allowClick})
	}
	
	function waitForGo() {
		dGo.attr("transform","translate(-"+(200+height)+",0)"); //attr("opacity",0);
		endlessRotate({duration:2000,step:0});
		tm=0
		var t=startTimer(time);
		ct=0;
		callEndlessFade(true);
	}
	
	function start() {
		var ok=prepare(); //x,y);
		if (ok) {
			score=0;
		}
		dGo.on("click", (ok) ? waitForGo : function(){dGo.on("click",null);limbo()});
	}
	
	function rotate(x,y,theta) {
		theta=theta/180*Math.PI;
		var x1=x*Math.cos(theta)+y*Math.sin(theta)
		var y1=-x*Math.sin(theta)+y*Math.cos(theta)
		return [x1,y1]
	}
	
	function appendShot({x,y,animation}) {
		animation=(!animation) ? 0 : 1; 
		var be=target.select("g:nth-of-type(2)")
		be.append("circle")
		.classed("shot",true)
		.attr("cx", x)
		.attr("cy", y)
		.attr("r", 2)
		.attr("fill","#80000")
		.attr("opacity",1)
		.transition()
		.duration(animation*40)
		.attr("r", animation*6)
		.attr("fill","#ff0000")
		.transition()
		.duration(animation*300)
		.attr("r", 4)
		.attr("fill","#b00000")
		.attr("opacity",1)
		;
	}
	
	function clickOnTarget() {
		
		function updateScore(nDistance) {
			if (nDistance==-1) return score;
			nDistance=1-nDistance;
			score=score+1000*nDistance*nDistance;
			d3.select("#dScore").text("score: "+Math.round(score/10));
		}
		
		target.classed("cursorOn", false)
		target.classed("cursorOff", true)
//		target.on("click",null);
		target.on("touchstart",null);
		var posC=getTranslation(targetC.attr("transform"));
		var theta=getTranslation(target.attr("transform")).rotate;
		var x=d3.event.pageX-posC.translateX-svg.node().getBoundingClientRect().x-document.documentElement.scrollLeft;
		var y=d3.event.pageY-posC.translateY-svg.node().getBoundingClientRect().y-document.documentElement.scrollTop;
		var [x1,y1]=rotate(x,y,theta)
		var points=Math.pow(x*x+y*y,0.5);
		if (points<radius) {
			updateScore(points/radius);
			appendShot({x:x1,y:y1,animation:true});
		}
	}	
