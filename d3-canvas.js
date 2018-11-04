
// 
// THIS CODE IS BADLY WRITTEN
// AND 
// EVEN MORE BADLY COMMENTED
// IN ITALIAN AND MACARONIC ENGLISH
//  
// IT IS LIKE A SEDIMENT:
// THE RESULT OF SEVERAL 
// THOUGHTS AND AFTERTHOUGHT
// THAT ADDED NEW APPEARANCE
// TO PREVIOUS IDEAS
//
// SO, LIKE THE LIFE 
// 
// BUT WRITING IT PLEASED ITS AUTHOR
// FOR HIS MANY HOURS SPENT  
// FOR 50% ON SEVERAL SITES   
// TO TRY TO UNDERSTAND SOME 
// VERY LITTLE KNOWN TOPICS
// FOR 50% ON STACKOVERFLOW   
// TO CORRECT WHAT WRONGLY UNDERSTOOD 
// AND FOR THE REMAINING 50%    
// ON THE FIREBUG CONSOLE
// TO READ ITS MESSAGES
// 
// HOPING EVERYBODY WILL ENJOY  
// TO PLAY IT
// AND NOBODY WILL NEED 
// TO READ IT
// BECAUSE IN THIS CASE 
// THE AUTHOR HAS TO ADVICE 
// STEALING SOME FAMOUS WORDS:
//
// "Lasciate ogni speranza voi ch'entrate"
//

main();
function main() {

// *******************************************
// inizializza variabili
// *******************************************
const ncols=200; // numero di colonne
const nrows=25; // numero di righe
// Mike Bostock "margin conventions" MODIFIED
var margin = {top: 20, right: 5, bottom: 20, left: 5},
width = parseFloat(d3.select("body").style("width"));
const lato=Math.min(Math.floor(width/ncols/1.15),Math.floor(600/nrows/2.30)); // dimensione dei quadretti
var height = Math.max(600 - margin.top - margin.bottom,nrows*2*lato*1.15);
const bumper="#c00000", squareOn="#607020",squareOff="#c0c080",nblock="rgba(192,0,0,0.3)"
const alpha1=0.45,alpha2=0.1;

var debug=true; // modalità debug
debug && console.log(lato);
if (lato<4) { // avvisa che l'area di lavoro è troppo piccola per procedere standard
	d3.select("body").append("h1")
	.style("text-align","center")
	.text("aborted: screen too narrow, sorry");
	throw '';
} 

// *******************************************
// inizializza contenitiore 
// *******************************************

var canvas = d3.select("#wa")
.attr("width", width) //-margin.left-margin.right)
.attr("height", height + margin.top + margin.bottom)
.attr("style","float:left") 
;

if (lato<8) { // avvisa che l'area di lavoro è piccola e le dimensioni della griglia sono ridotte rispetto a quelle standard
	d3.select("body").append("text")
	.style("left",Math.floor(width/2)+"px")
	.style("top",Math.floor(height/2)+"px")
	.style("position","absolute")
	.style("text-anchor", "middle")		
	.style("font-size","30px")
	.text("adapted to narrow screen size...")
	.style("opacity",1)
	.transition()
	.duration(5000)
	.style("opacity",0)
	.remove()
	;
}

//******************************
// states:
//******************************
const 
sleeping=0,
waiting=1,
fallingVsBaseline=2,
fallingVsBumper=3,
bouncing=4,
vanishing=5,
transforming=6,
blistering=7,
fallingVsNormal=8,
done=9,
fading1=10,
fading2=11;
// altre variabili globali	
var pp=10,perc=0.5; // variabili relative alla percentuale di quadrati On
var squares,nLines; // quadrati e linee della normali sono variabili globali
var tipo=1; // tipo di grafico: 1- per colonna, 2- per riga, 0- matrice
var speed1=200,speed2=speed1; // variabili relative alla velocità di animazione
var totalElapsedTime, startTime; // variabili per mettere in pausa e riprendere l'animazione
var timer,timer2; // i due timer delle animazioni
var endAnim=false; // flag fine animazione
var shift=false; // flag per scorrimento laterale/verticale
var start,end; // valori per scorrimento

function updateTime() { // restituisce il tempo stimato per terminare l'animazione da stampare a video
	var ftr=((tipo==0) ? 2 : (tipo==1) ? 25/2 : 5/2)*squares.filter(function(s,i){return s.state<fallingVsBaseline}).length/ncols/nrows;
	ftr=Math.round(ftr*speed2/speed1);
	return "approximately " + ((ftr<1) ? "<1" : ftr) + " minute" + ((ftr>1) ? "s" : "")
}

function gridCreate() {
	rValues=d3.range((nrows)*ncols).map(index=> ([index,Math.random()]));
	rValues.sort(function(a,b){return a[1]-b[1]});
	squares=d3.range((nrows+1)*ncols).map(index=> ({
		id: index,
		row: Math.floor(index / ncols),
		col: index % ncols,
		role: (Math.floor(index / ncols)<1) ? bumper : (rValues[index-ncols][0]<=perc*nrows*ncols) ? squareOn : squareOff,
		state: sleeping
	}));
}
// composizione della matrice squares
// primi   200: bumper
// secondi 200: riga 1 (la più vicina ai bumpers
// terzi   200: riga 2
// ...
// ultimi  200: riga 25

gridCreate()

function gridLayout() {
	squares.forEach((square,i) => {
		square.x=margin.left+(width-margin.right-margin.left)-lato*(ncols-square.col);
		square.y=margin.top+lato*(nrows+1-square.row-(square.row==0 ? 0 : 1));
	});
	//return squares;
}

function nProbPoints(p) {
	return d3.range(nrows+1).map(i=>	([
	Math.round(margin.left*0+4+lato*(ncols+1/3)*Math.exp(-Math.pow(i-nrows*p,2)/(2*nrows*p*(1-p)))/Math.sqrt(2*Math.PI*nrows*p*(1-p))),
	margin.top+(i+nrows+1.5)*lato
	])
	);
}

nLines=nProbPoints(perc);

function draw(endAnim) {
	const ctx=canvas.node().getContext("2d");
	ctx.save();
	ctx.clearRect(0,0,width,height);
	squares.forEach(function(square,i) {
		ctx.globalAlpha = (square.opacity==undefined) ? 1 : square.opacity;
		ctx.fillStyle=(square.opacity==alpha1 || square.opacity==alpha2) ? bumper : square.role;
		ctx.fillRect(square.x,square.y,lato-1,(square.height>0) ? square.height : (square.role==bumper) ? 2 : lato-1);
	});
	ctx.globalAlpha = 1;
	ctx.fillStyle = "black";
	ctx.font = "small-caps 12px Calibri";
	//textAlign supports: start, end, left, right, center
	ctx.textAlign = "right";
	//textBaseline supports: top, hanging, middle, alphabetic, ideographic bottom
	ctx.textBaseline = "top";
	ctx.fillText("remaining time: "+((endAnim) ? "finished" : updateTime()),width-margin.left,0);
	
	ctx.strokeStyle = "rgba(128,128,128,0.5)";
	var lineGenerator = d3.line()
	.curve(d3.curveCardinal);
	lineGenerator.context(ctx);
	ctx.beginPath();
	lineGenerator(nLines);
	ctx.stroke();
	
	nLines.forEach(function(el,i) {
		ctx.beginPath();
		//context.arc(x-center, y-center, radius, startAngle, endAngle, counterclockwise)
		ctx.arc(el[0], el[1], 2, 0,  2 * Math.PI);
		ctx.stroke();
		ctx.closePath();
	});	
	ctx.restore();
}

gridLayout();
draw();

function updating() {
	var ti= d3.now() - startTime;
	
	// composizione della matrice squares
	// primi   200: bumper
	// secondi 200: riga 1 (la più vicina ai bumpers
	// terzi   200: riga 2
	// ...
	// ultimi  200: riga 25
	
	var z1
	
	switch (tipo) {
		
		case 1: //----------------------------------------------------------------------
		// controlla se c'è un respingente in attesa o al lavoro
		for (var j=0;j<ncols+1;j++) {
			z1=squares[j];
			if (z1.role==bumper && z1.state<blistering && z1.state>sleeping) break;
		}
		
		//				var z=squares.filter(function(square,i){return square.role==bumper && square.state<blistering && square.state>sleeping});
		//				if (z.length==0 ) {
		
		if (j==ncols+1) {
			// se non c'è nessun respingente in attesa o al lavoro
			//					var fb=squares.find(function(square){return square.role==bumper && square.state==sleeping});
			//					if (fb) {
			
			// trova il primo respingente dormiente
			// for loop per ottimizzazione
			for (var j=0;j<ncols+1;j++) {
				z1=squares[j];
				if (z1.role==bumper && z1.state==sleeping) break;
			}
			if (j<ncols+1) {
				// non tutti i quadrati della colonna sono stati svegliati
				//							fb=squares[j];
				
				// lo pone in attesa
				squares[j].state=waiting
				
				//						fs=squares.filter(function(square,i){return square.col==fb.col && (square.role==squareOn || square.role==squareOff)}).forEach(function(square,i){
				
				
				// e sveglia tutti i quadrati della stessa colonna
				for (k=1;k<nrows+1;k++) {
					square=squares[(k)*ncols+j];
					
					square.state=fallingVsBaseline;
					//								console.log("fvb");
					square.ty=margin.top+lato*(nrows-1);
					square.sy=square.y;
					square.start=ti;
					square.end=ti+speed2*0.5*(square.row-1);
				}
			}
		}
		if (shift) { 
			var z=0;
			for (j=0;j<ncols+1;j++) {
				var square=squares[j];
				// square.role==bumper && 
				if (square.state>=fallingVsNormal) {
					z=Math.max(z,square.tx);
				}
				else {
					break	
				}
			}
			if (squares[j].x>z+lato*8) {
				//						console.log(squares[j].x+":"+(z+50));		
				squares.filter(function(s){return s.state<=blistering}).forEach(function(s,i){
					s.tx=s.x-lato;
					s.sx=s.x;
				});
				start=ti;
				end=ti+speed2*0.25;
			}
			shift=false;
		}
		var t = Math.min(1, d3.easeLinear((ti-start) /(end-start)));
				squares.filter(function(s){return s.state<=blistering && s.sx && s.tx}).forEach(function(s,i){
					s.x=s.tx*t+s.sx*(1-t);
				});
		
		case 2: //-----------------------------------------------------------------------
		for (var k=1;k<nrows+1;k++) {
			var ct=0;
			for (var j=0;j<ncols;j++) {
				z1=squares[(k)*ncols+j];
				z0=squares[(k-1)*ncols+j];
				if ((z0.role==bumper || z0.state>=done) && z1.state<fallingVsBaseline) {
					ct++
				}
				else {
					break
					}
				}
				if (ct==ncols) break;
			}
			if (k<nrows+1) {
				// la riga precedente è stata esaurita, fa cominciare a cadere la riga k
				for (var j=0;j<ncols;j++) {
					square=squares[(k)*ncols+j]
					if (square.y==margin.top+lato*(nrows-1)) {
						//								square.end=ti
						square.state=fallingVsBumper;
						square.start=ti;
						var z=squares.filter(function(s){
							return s.col==square.col && s.role==squareOn && s.row<square.row 
						}).length;
						square.end=ti+speed2*0.05*lato*(z+1);
						square.sy=margin.top+lato*(nrows-1);
						square.ty=margin.top+lato*(nrows+z);
					} 
					else {
						square.state=fallingVsBaseline;
						square.ty=margin.top+lato*(nrows-1);
						square.sy=square.y;
						square.start=ti;
						square.end=ti+speed2*0.5*(square.row-1);
					}
				}
				// shift versa il basso **************************************************
				for (var m=k+1;m<nrows+1;m++) {
					for (var j=0;j<ncols;j++) {
						square=squares[(m)*ncols+j]
						//							if (m==k+1) square.state=fallingVsBaseline;
						square.ty=square.y+lato;
						square.sy=square.y;
						square.start=ti+speed2*0*0.5;
						square.end=ti+speed2*1.5;
					}
				}
			}
			// --------------------------------------------------------------------------
			for (var k=2;k<nrows+1;k++) {
				var ct=0;
				for (var j=0;j<ncols;j++) {
					z1=squares[(k)*ncols+j];
					z0=squares[(k-1)*ncols+j];
					if ((z0.state==done) && z1.state>=bouncing) {
						ct++
					}
					else {
						break
					}
				}
				if (ct==ncols) break;
			}
			
			//										console.log(k);
			if (k<nrows+1) { //&& squares.filter(function(s){return s.state==fading1}).length<ncols) {
				// tutti i quadrati della riga precedente si preparano a cadere a sx
				for (var j=0;j<ncols;j++) {
					//
					square=squares[(k-1)*ncols+j]
					square.state=fading1;
					square.start=ti;
					square.end=ti+speed2*2;
					square.sy=square.y
					square.ty=square.y+Math.floor(lato/2);
					if (k>2) {
						square=squares[(k-2)*ncols+j]
						square.state=fading2;
						square.start=ti;
						square.end=ti+speed2*2;
					}
					//
				}
			}
	}
	
	function transition(square) {
		var t;
		switch (square.state) {
			//******************************
			// sleeping
			//******************************
			case sleeping:
			if (square.end && tipo==2) {
				t = Math.min(1, d3.easeLinear((ti-square.start) /(square.end-square.start)));
				square.y=square.ty*t+square.sy*(1-t);
			}
			return;
			//******************************
			// waiting
			//******************************
			case waiting:
			if (square.role!=bumper) return;
			var s
			for (k=1;k<nrows+1;k++) {
				s=squares[(k)*ncols+square.col];
				if (s.state<vanishing || s.role==squareOn) break
			}
			if (k==nrows+1) {
				square.state=blistering;
				square.start=ti;
				square.end=ti+speed2*0.5;
			}	
			return;	
			//******************************
			// fallingVsBaseline
			//******************************
			case fallingVsBaseline:
			t = Math.min(1, d3.easeLinear((ti-square.start) /(square.end-square.start)));
			square.y=square.ty*t+square.sy*(1-t);
			if (ti>=square.end) {
				square.state=fallingVsBumper;
				square.start=ti;
				var z=squares.filter(function(s){
					return s.col==square.col && s.role==squareOn && s.row<square.row 
				}).length;
				//								if (square.role==squareOff) z=-25;	
				square.end=ti+speed2*0.05*lato*(z+1);
				square.sy=margin.top+lato*(nrows-1);
				square.ty=margin.top+lato*(nrows+z);
				//							if (square.role==squareOn) console.log(square.sy+":"+square.ty);
			}
			return;
			//******************************
			// fallingVsBumper
			//******************************
			case fallingVsBumper:
			t = Math.min(1, d3.easeLinear((ti-square.start) /(square.end-square.start)));
			square.y=square.ty*t+square.sy*(1-t);
			if (square.role==squareOff) square.opacity=1-t
			//							if (square.role==squareOff) square.y=0;
			if (ti>=square.end) {
				square.start=ti;
				var z=squares.filter(function(s){
					return s.col==square.col && s.role==squareOn && s.row<square.row 
				}).length;
				if (square.row==nrows && tipo==1) {shift=true;//console.log("shift")
				}; 
				if (square.role==squareOff) {
					square.state=vanishing;
					square.end=ti+speed2*0.06*lato+speed2*0.25; // 0.125*lato;
					square.sy=0 //margin.top+lato*(nrows+z);	
					square.ty=square.sy;
				} 
				else {
					square.state=bouncing;
					square.end=ti+speed2*0.06*lato;
					square.sy=margin.top+lato*(nrows+z);	
					square.ty=square.sy+lato;
					var bu=squares[square.col]; //*******
					bu.state=bouncing
					bu.start=ti;
					bu.end=ti+speed2*0.05*lato;
					bu.sy=square.sy+lato;
					bu.ty=square.ty+lato;
				}
			}	
			return
			//******************************
			// bouncing
			//******************************
			case bouncing:
			t = Math.min(1, d3.easeLinear((ti-square.start) /(square.end-square.start)));
			square.y=square.ty*t+square.sy*(1-t);
			if (ti>=square.end) {
				if (square.role!=bumper) {
					square.start=ti;
					square.end=ti+speed2*0.25;
					square.state=vanishing;
				}
				else {
					if (tipo!=2 && squares.filter(function(s){return s.col==square.col && (s.role==squareOn || s.role==squareOff) && s.state>=vanishing}).length==nrows) {
						//									console.log("fine riga/colonna")
						square.state=blistering
						square.start=ti;
						square.end=ti+speed2*0.5;
					}
				}
			}	
			return
			//******************************
			// vanishing
			//******************************
			case vanishing:
			t = Math.min(1, d3.easeLinear((ti-square.start) /(square.end-square.start)));
			if (square.role==squareOn) {
				// squareOFF hanno già opacity=0
				//						square.opacity=(square.opacity>=0) ? 1-t : 1		
				square.opacity=1-t		
			}
			if (ti>=square.end && tipo==2) {
				square.start=ti;
				square.end=ti+speed2*0.5;
				square.state=transforming;
				square.y=square.y+lato;	
			}	
			return
			//******************************
			// transforming
			//******************************
			case transforming:
			//						console.log("transforming");
			//						square.role=nblock;
			square.state=blistering;
			square.opacity=alpha1;
			return
			//******************************
			// blistering
			//******************************
			case blistering:
			t = Math.min(1, d3.easeLinear((ti-square.start) /(square.end-square.start)));
			square.height=2*(1-t)+(lato-1)*t;		
			if (ti>=square.end) {
				square.state=fallingVsNormal;
				square.start=ti;
				var z=squares.filter(function(s){return s.role==bumper && s.col<square.col && s.y==square.y}).length
				square.end=ti+speed2*0.015*(square.x-z*lato);
				//							console.log(z);
				square.sx=square.x;
				square.tx=z*lato;
				if (square.row==nrows) {
					squares[square.col].opacity=0;
				}
			}	
			return	
			//******************************
			// fallingVsNormal
			//******************************
			case fallingVsNormal:
			t = Math.min(1, d3.easeLinear((ti-square.start) /(square.end-square.start)));
			square.x=square.tx*t+square.sx*(1-t);
			if (ti>=square.end) {
				square.state=done;
				if (squares.filter(function(s,i){return s.state==done}).length==ncols) {
					if (tipo==1 || (tipo==2 && square.row==nrows)) {
						debug && console.log("fine");
						d3.select("#cp label.pause").classed("disabled",true);
						d3.select("#cp label.reset").classed("disabled",false);
						timer.stop();
						endAnim=true;
					}
				}
			}	
			return
			//******************************
			// fading1
			//******************************
			case fading1:
			t = Math.min(1, d3.easeLinear((ti-square.start) /(square.end-square.start)));
			square.opacity=alpha1*(1-t)+alpha2*t;
			square.y=square.ty*t+square.sy*(1-t);
			return
			//******************************
			// fading2
			//******************************
			case fading2:
			t = Math.min(1, d3.easeLinear((ti-square.start) /(square.end-square.start)));
			square.opacity=alpha2*(1-t)+0*t;		
			return
		}
	}
	
	squares.forEach(function(square,i) {
		transition(square)
	});
	draw(endAnim);
	if (ti>10000000) {console.log("end-by-timeout");timer.stop();}
}

// *******************************************
// funzione per aggiornare a schermo p
// *******************************************
function modP(pp){d3.selectAll("#containerTCL .percentage").html(parseInt(pp*5)+"%");
	if (perc==pp/20) return;
	perc=pp/20;
	squares.forEach(function(s,i){
		if (s.state!=bumper) s.state=(Math.random()<perc) ? squareOn : squareOff
	});
	
	gridCreate();
	gridLayout();
	
	if (timer2) timer2.stop();
	
	var nLines1=nLines;
	var nLines2=nProbPoints(perc);	
	
	timer2 = d3.timer((elapsed) => {
		var t = Math.min(1, d3.easeCubic(elapsed / (speed2*3)));
		nLines.forEach(function(el,i){
			el[0]=nLines1[i][0]*(1-t)+nLines2[i][0]*t;
		});
		draw();
		if (t === 1) {timer2.stop();
			console.log("timer2 end");
		}
	});		
}

// INIZIO INIZIALIZZAZIONE PULSANTI ------------------------------------------------------------------------------------

// *******************************************
// pulsanti PROBABILITA'
// *******************************************
d3.selectAll("#cp1 label:not(.text)").on("click",function(){
	var right=d3.select(this).classed("right");
	debug && console.log("prob" + ((right) ? "+" : "-"));
	if (d3.select(this).classed("disabled")) return;
	if (right) {
		modP((pp<19) ? ++pp:pp);
		} else {
		modP((pp>1) ? --pp:pp);
	}
	//			d3.select("#cp3 .reset").on("click")();
});

// ********************************
// pulsanti TIPO ANIMAZIONE
// ********************************
d3.selectAll("#cp4 label").on("click",function(d,i){
	if (d3.select(this).classed("matrix")) return;
	if (d3.select(this).classed("disabled")) return;
	d3.selectAll("#cp4 label").classed("selected",false);
	d3.select(this).classed("selected",true);
	tipo=(d3.select(this).classed("bycol")) ? 1 : ((d3.select(this).classed("byrow")) ? 2 : 0)
	draw()
});

// ********************************
// pulsanti VELOCITA'
// ********************************
d3.selectAll("#cp2 .pick").on("click",function(d,i){
	d3.selectAll("#cp2 .pick").classed("selected",false);
	d3.select(this).classed("selected",true);
	speed2=Math.pow(2,1-i)*speed1;
	draw()
});

// ********************************
// pulsante PLAY
// ********************************
d3.selectAll("#cp label.start").on("click",function(){
	debug && console.log("start");
	if (d3.select(this).classed("disabled")) return;
	stop=false;
	d3.selectAll("#cp label:not(.text):not(.pick)").classed("disabled",true);
	d3.select("#cp label.pause").classed("disabled",false);
	d3.select("#cp label.reset").classed("disabled",true);
	
	if (timer==undefined) {
		totalElapsedTime = 0;
		startTime = d3.now() - totalElapsedTime;
		//						console.log(squares.length);
		timer= d3.timer(updating);
	}
	else {
		startTime = d3.now() - totalElapsedTime;
		timer.restart(updating);					
	}
});

// ********************************
// pulsante PAUSE
// ********************************
d3.selectAll("#cp label.pause").on("click",function(){
	debug && console.log("pause");
	if (d3.select(this).classed("disabled")) return;
	stop=true;
	d3.selectAll("#cp label.start").classed("disabled",false);
	d3.selectAll("#cp label.pause").classed("disabled",true);
	d3.select("#cp label.reset").classed("disabled",false);
	totalElapsedTime = d3.now() - startTime; 
	timer.stop();
});

// ********************************
// pulsante RESET
// ********************************
d3.selectAll("#cp3 .reset").on("click",function(){
	debug && console.log("reset");
	d3.selectAll("#cp label").classed("disabled",false);
	d3.select("#cp3 .pause").classed("disabled",true);
	perc=pp/20;
	gridCreate();
	gridLayout();				
	draw();
	endAnim=false;
	timer=undefined;
});
// FINE INIZIALIZZAZIONE PULSANTI ------------------------------------------------------------------------------------
}
