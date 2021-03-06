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
	const lato=Math.floor(width/ncols/1.15); // dimensione dei quadretti
	var height = Math.max(600 - margin.top - margin.bottom,nrows*2*lato*1.15);

	const debug=false;
	debug && console.log(lato);
	if (lato<5) {
		d3.select("body").append("h1")
		.style("text-align","center")
		.text("aborted: screen too narrow, sorry");
		throw '';
	} 

	// *******************************************
	// inizializza contenitiore svg
	// da https://bl.ocks.org/RandomEtc/cff3610e7dd47bef2d01
	// *******************************************
	// create an SVG element (appended to body)
	// set size
	// add a "g" element (think "group")
	// annoying d3 gotcha - the 'svg' variable here is a 'g' element
	// the final line sets the transform on <g>, not on <svg>
	var svg = d3.select("#wa")
	.attr("width", width - margin.left - margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.attr("style","float:left;")
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	if (lato<8) {
		svg.append("text")
		.attr("x",1*svg.select(function() { return this.parentNode; }).attr("width")/2)
		.attr("y",lato*(nrows)*1.5)
		.style("text-anchor", "middle")		
		.style("font-size","30px")
		.text("adapted to narrow screen size...")
		.attr("opacity",1)
		.transition()
		.delay(3000)
		.duration(2500)
		.attr("opacity",0)
		.remove()
		;
	}

	// gruppo contenitore della griglia
	var zac1=svg.append("g").attr("id","grid");

	// gruppo contenitore dei quadratini che nascono dai respingenti
	var abarr=svg.append("g").attr("id","rectnorm");

	// gruppo contenitore dei respingenti
	var barr=svg.append("g").attr("id","bumper");

	function updateCNorm(r) {
		// AGGIORNA CURVA IDEALE	
		for (var i=0;i<nrows+1;i++) {
			points[i][0]=Math.round(lato*(ncols+1/3)*Math.exp(-Math.pow(i-r*perc,2)/(2*r*perc*(1-perc)))/Math.sqrt(2*Math.PI*r*perc*(1-perc)));
		}

		var pathData = lineGenerator(points);

		cn.select("path")
		.transition()
		.duration(speed3*2)
		.attr('d', pathData);

		// Also draw points for reference
		cn
		.selectAll('circle')
		.data(points)
		.transition()
		.duration(speed3*2)
		.attr('cx', function(d) {
			return d[0];
		})
		.attr('cy', function(d) {
			return d[1];
		})
		;
	}

	// **********************************************
	// operazioni preliminari che vengono eseguite
	// all'inizio e a ogni pressione del pulsante RESET
	// **********************************************

	function randomSquares() {
		co=[];

		for (var i=0;i<ncols*nrows;i++) {
			co.push([((i<ncols*nrows*perc) ? true : false),Math.random()]);
		}
		co.sort(function(a, b){return a[1] - b[1]});

		zac1.selectAll("rect").each(function(d,i){
			d3.select(this).classed("active",co[i][0])
		});

	}


	function start() {
		d3.select("#cp label.reset").classed("disabled",false);
		d3.select("#cp label.pause").classed("disabled",true);
		perc=pp/20;
		maxcnorm=0;

		abarr.append("g").classed("colabarr",true).classed("c"+abarr.selectAll("g").size(),true);
		abarr.append("g").classed("colabarr",true).classed("c"+abarr.selectAll("g").size(),true);
		//				abarr.append("g").classed("colabarr",true).classed("c"+abarr.selectAll("g").size(),true);

		// ***************************************************
		// compone la griglia di nrows righe e ncols colonne
		// ***************************************************
		for (var i=0;i<ncols;i++) {
			zac1.append("g").classed("column",true).classed("c"+i,true);
			barr.append("g").classed("column",true).classed("waiting",true).classed("c"+i,true);
			//					abarr.append("g").classed("colabarr",true).classed("c"+i,true);
			barr.select("g:nth-child("+(i+1)+")")
			.append("rect")
			.style("fill","#a00020")
			.attr("x",width-margin.left-margin.right-margin.left-lato*(ncols-1-i+1))
			.attr("width",lato-1)
			.attr("y", (nrows+1)*lato)
			.attr("height",2+0*Math.round(lato/2))
			.classed("redblock",true);
			;
			for (var j=0;j<nrows;j++) {
				//					var s=(Math.random()<0.5);
				zac1.select("g:nth-child("+(i+1)+")")
				.append("rect")
				.attr("x",width-margin.left-margin.right-margin.left-lato*(ncols-1-i+1))
				.attr("width",lato-1)
				.attr("y", (nrows-1-j)*lato)
				.attr("height",lato-1)
				//					.classed("active",co[i*nrows+j][0])
				;
			}
		}
		randomSquares();

	}

	// **********************************************
	// dichiarazione variabili
	// **********************************************
	var perc=0.5; // cinque quadretti 0.002; inizializza la probabilità dei quadretti scuri
	var co; // usata per inizializzare casualmente il colore chiaro/scuro dei quadrati della griglia
	const speed1=1000/2;
	var speed2=speed1*1;
	//		var p=0.50;
	var pp=10;
	var maxcnorm;

	var stop=false; // la pressione di PAUSE lo imposta a vero
	//		var flag=false;

	var points = []; // matrice delle coordinate dei punti della curva teorica
	//				var dis=[]; // matrice del numero di quadrati attivi in ogni colonna
	var speed3=speed2; //speed3 decide il tempo di ogni animazione pescando da speed2 che viene impostato dai pulsanti
	var tipo=1; // tipo di grafico (1: per colonna, 0: matrice, 2: per riga)

	var gap=50; // attualmente non usata; avrebbe indicato la distanza tra la griglia e la barriera

	// **********************************************
	// disegno della curva teorica piatta
	// **********************************************
	for (var i=0;i<nrows+1;i++) {
		points.push([0,(nrows+1.5+i)*lato])
	}

	var lineGenerator = d3.line().curve(d3.curveCardinal);
	var pathData = lineGenerator(points);
	var cn=svg.append("g").attr("id","cnorm");

	cn.append('path')
	.attr('d', pathData);

	cn
	.selectAll('circle')
	.data(points)
	.enter()
	.append('circle')
	.attr('cx', function(d) {
		return d[0];
	})
	.attr('cy', function(d) {
		return d[1];
	})
	.attr('r', 2);

	updateCNorm(nrows);


	// ************************************************************
	//    PRONTI? VIA!
	// ************************************************************
	start();

	//	funzione che restituisce i parametri di traslazione
	//	della proprietà transform;
	//  utile per ricalcolare la posizione effettiva di un elemento

	function getTranslation(transform) {
		//			console.log(transform);
		if (transform === "" || transform ===null) {
			return [0, 0]
		};
		var g = document.createElementNS("http://www.w3.org/2000/svg", "g");
		g.setAttributeNS(null, "transform", transform);
		var matrix = g.transform.baseVal.consolidate().matrix;
		return [matrix.e, matrix.f];
	}			

	function updateTime(s) {
		//			console.log(s)
		var ftr;
		d3.select("#cp label.minutes").html(function(){
			if (tipo==1) {
				ftr=14*zac1.selectAll("g:not(.falling)").size()/ncols;
				} else {
				//console.log(zac1.select("g:nth-child(1)").selectAll("rect").size());
				ftr=((tipo==0) ? 2 : 7)*zac1.select("g:nth-child(1)").selectAll("rect").size()/nrows;
				//						console.log(ftr);
			}
			ftr=Math.round(ftr*s/speed1);
			return "approximately " + ((ftr<1) ? "<1" : ftr) + " minute" + ((ftr>1) ? "s" : "")
		});
	}

	updateTime(speed2)

	// *************************************************************************
	// FUNZIONE PRINCIPALE CHE GESTISCE L'ANIMAZIONE DEI QUADRATINI DELLA GRIGLIA
	// *************************************************************************

	//			scorre();
	function scorre() {
		if (stop) return;
		if (svg.selectAll("g.column").size()>0) {
			speed3=speed2;
			} else {
			debug && console.log("fine: no column");
		}

		// ************************************************************
		// SELEZIONA LA PRIMA COLONNA A SX
		// ************************************************************
		//				console.log(tipo);
		if (tipo==1) {
			var fg=zac1.select("g.column:not(.falling)"); //.filter(function (d, i) { return i === 0;});
			//				console.log(fg._groups[0][199]);
			//				if (tipo==1) fg=fg.filter(function (d, i) { return i === 0;});
			//				if (tipo==1) fg=fg.filter(function (d, i) { return i === svg.selectAll("g.column").size()-1;});
			} else {
			var fg=zac1.selectAll("g.column"); //:not(.falling)"); //.filter(function (d, i) { return i === 0;});
			//if (tipo==1) fg=d3.select(fg._groups[0][fg.size()-1]); // <== CSS selector (DOM)
		}
		// fg contiene la prima colonna da processare
		//

		//console.log(fg.selectAll("rect").size());
		if (fg.selectAll("rect").size()==0) {
			debug && console.log("fine!!!")
			//				d3.selectAll("#cp label:not(.text):not(.pick)").classed("disabled",true);
			d3.select("#cp label.pause").classed("disabled",true);
			d3.select("#cp label.reset").classed("disabled",false);
			return;
		}
		if (fg.size()==0) {
			console.log("fine: no fg elements");
			return;
		}

		fg.classed("falling",true);
		//				speed3=speed2;

		//	funzione che viene eseguita al termine di TUTTE le transizioni
		//	sostituita perché non adatta a questa animazione
		function endall(transition, callback) { 
			if (typeof callback !== "function") throw new Error("Wrong callback in endall");
			if (transition.size() === 0) { callback() }
			var n = 0; 
			transition 
			.each(function() { ++n; }) 
			.on("end", function() { if (!--n) callback.apply(this, arguments); }); 
		} 				

		// tipo=1: per colonna; tipo=2: per riga; tipo=0: matrice
		//

		var ds;
		if (tipo==1) {
			ds=fg;
			} else if (tipo==0) {
			ds=cn;
			} else {
			ds=zac1;
		}
		//				console.log(ds);

		var riga=0;

		updateTime(speed2)

		mainLoop()

		function mainLoop() {
			var col=0;
			fg.each(function(d,i){
				fallSquares3(d3.select(this),i,(tipo==1) ? riga++ : 0);
			});
			//riga++;
			if (ds.select("rect").size()>0) {
				var act=(tipo==1) ? fg.select("rect:not(.redblock):not(.falling)").classed("active") : true;
				ds
				.transition()
				.delay((tipo==1 || tipo==2) ? 0 : speed3)
				.duration((act) ? speed3*0.5 : speed3*0.15)
				.ease(d3.easeLinear)
				.attr("transform",function(){
					//console.log( d3.select(this).attr("transform")+" translate(0,"+lato+")");
					var tr=d3.select(this).attr("transform");
					//							console.log(((tr==null) ? "" : tr )+" translate(0,"+lato+")");
					return ((tr==null) ? "" : tr )+" translate(0,"+lato+")";
				})
				.on("end",function(){
					if (tipo==1 || tipo==0) {
						//console.log(riga);
						mainLoop();
					}
				})
				;
				} else {
				if (tipo==1) {
					debug && console.log("fine colonna");
					if (zac1.select("rect").size()>0) {
						var xcond=1*zac1.select("rect").attr("x")+1*getTranslation(zac1.select("rect").select(function() { return this.parentNode; }).select(function() { return this.parentNode; }).attr("transform"))[0];
						//							console.log(xcond+":"+maxcnorm);		
						if ((xcond-maxcnorm)/lato>10) shiftGrid3();		
					}
				}
				if (tipo>0) scorre();
				debug && console.log("no rettangoli");
			}
		}

		function fallSquares3(fh,n,ii) {
			// ************************************************************
			// FA CADERE ED ELIMINA QUADRATINI COLORATI 
			// ************************************************************
			var ctend=0;

			var tt=fh.select("rect");
			var ah,bh;
			if (tipo==1) {
				//						console.log(ii);
				if (ii==0) {
					bh=barr.select("g:not(.falling)");
					bh.classed("falling",true);
					ah=abarr.select("g:not(.falling)");
					ah.classed("falling",true);

					//					console.log(bh.node());
					} else {
					bh=d3.select(barr.selectAll("g.falling").nodes()[barr.selectAll("g.falling").size()-1]); //:last-child");
					ah=d3.select(abarr.selectAll("g.falling").nodes()[abarr.selectAll("g.falling").size()-1]); //:last-child");
					//bh=barr.selectAll("g.falling:last-child");
					//							console.log("colonne falling: "+barr.select("g.falling").size())
					//					console.log(bh.node());
				}
				//						bh.classed("falling",true);
				//console.log(bh.node());
				} else {
				bh=barr.select("g:nth-child("+(1*n+1)+")");
				ah=abarr.select("g:nth-child("+(1*n+1)+")");
				//						console.log(n);
				//						console.log(bh.node());
				//						return;
			}
			var ac;
			if (tt.size()>0) {
				ac=tt.classed("active"); 

				var row=(tipo==0) ? nrows-fh.selectAll("rect").size() : 0; 

				var clone=bh.append("rect").classed("active",ac)
				.attr("width",lato-1).attr("height",lato-1).attr("x",tt.attr("x"))
				//						.attr("y",1*tt.attr("y")+1*getTranslation(tt.attr("transform"))[1])
				.attr("y",(tipo==0) ? tt.attr("y") : (nrows-1)*lato)
				;
				var removed=tt
				.remove()
				;
				//						.transition()
				//						.duration((ac) ? speed3*0.5 : speed3*0.25)
				//						var clone=bh.append(function(){return removed.node()});
				//						tt
				//					console.log(st);
				//						console.log(bh.node());
				//							if (1==1) {

				var agf=bh.selectAll("rect.active").size();
				//							console.log(ii+":"+agf)
				var el=bh.select("rect.redblock");

				clone
				.transition()
				// inizia la discesa immediatamente nei casi 1 e 2
				.delay((tipo==1 || tipo==2) ? 0 : speed3*(0.75*Math.random()+0.25))
				.duration(function() {
					// due velocità diverse nel caso 1
					if (ac || tipo!=1) {
						//console.log((agf)*speed3/10);
						return ((agf+row)*speed3*0.15*((tipo==1) ? 1 : 1.5))
						} else {
						return speed3*0.2
						//									return (1+ii+agf)*speed3/20;
					}
				})
				// a velocità costante in tutti i casi
				//							.ease(d3.easePolyIn.exponent(2)) //easeLinear)
				.ease(d3.easeLinear)
				.attr("y", function(){
					if (ac) {
						var tmp=agf-1; //(bh.selectAll("rect.active").size()); //.falled
						return ((tmp+nrows+0*1)*lato);
						} else {
						return d3.select(this).attr("y");
					}
				})
				.style("opacity", function() {
					if (ac) {return 1} else {return 0}
				})
				.on("end",function(){
					var tmp=agf;
					if (ac) {
						el
						.style("fill","red")
						.transition()
						//								.delay(speed3/10)
						.ease(d3.easePolyOut.exponent(2))
						.duration(speed3*((tipo==0) ? 0.75 : 0.5))
						//									.style("fill","#a00020")
						.style("fill","#a00020")
						.attr("transform", function(){
							return "translate(0,"+(1*tmp*lato)+")";

						})	
					}
				})
				//						.attr("opacity",0.50)
				//						.classed("cp1",true)
				.transition()
				.ease(d3.easePolyIn.exponent(2)) //easeLinear)
				.duration(speed3*((tipo==0) ? 0.6 : 0.4))
				// dopo la caduta "salta" sulla barriera facendola scendere di un quadratino
				.attr("transform", function(d,i){
					//						console.log(d3.select(this).attr("transform"));
					return "translate(0," + (1*lato)+ ")"; 
				})
				.on("end",function(){
					// VARIABILE ESTERNE USATE: ii,fh,
					//							var ra=-1;
					d3.select(this).classed("hidden",true)
					if (tipo==1) {
						if (bh.selectAll("rect.hidden").size()==nrows) {
							fh.classed("falled",true);
							ah=abarr.select("g");
							ah
							.transition()
							.duration(speed3*0.2)
							.on("end",function(){
								leftSquare(null,0,ah,bh)
							});
						}
						} else {
						var hr=barr.selectAll("rect.hidden").size();
						if ((tipo==2 && hr % ncols == 0) || (tipo==0 && hr==ncols*nrows)) {
							//										console.log("rettangoli rimasti: "+zac1.selectAll("rect").size());
							debug && console.log("fine riga");
							normSquares();
						}
						if (tipo==0) {
							if (n==0) {
								speed3=speed2;
								updateTime(speed2);
							}
							fallSquares3(fh,n,0)
						}


					}
				})
				.transition()
				//							.delay(speed3*0.2)
				.duration(speed3*((tipo==2) ? 0.7 : 0.2))
				.ease(d3.easeLinear)
				.style("opacity",0)
				;
			}

		}

		function normSquares() {
			//console.log(abarr.selectAll("g").size());
			abarr.select("g")
			.transition()
			.duration(speed3*5)
			.attr("opacity",0)
			.on("end",function(){
				d3.select(this).remove()
			})
			;
			abarr.select("g:nth-child(2)")
			.transition()
			.duration(speed3*5)
			.attr("transform",function(){
				return "translate(0,"+(lato/2)+")"
			})
			.attr("opacity",0.1)
			;
			var g=abarr.append("g")
			.classed("colabarr",true)
			.classed("c"+abarr.selectAll("g").size(),true)
			.attr("opacity",(tipo==0) ? 1 : 0.3)
			;

			barr.selectAll("g").each(function(d,i){	
				var ah=g;
				var bh=d3.select(this)
				leftSquare(d,i,ah,bh)
			});	

		}

		function leftSquare(d,i,ah,bh) {
			var x=bh.select("rect.redblock").attr("x");
			if (tipo==1 && zac1.attr("transform")) x=1*x+1*getTranslation(zac1.attr("transform"))[0];

			// perché round? perché nella funzione fallSquares3 se si mettono dei log console questa funzione può venire eseguita prima che la barriera rossa scenda alla sua posizione naturale (cioè di un quadratino)
			var y=Math.round(1*bh.select("rect.redblock").attr("y")+1*getTranslation(bh.select("rect.redblock").attr("transform"))[1]);
			y=Math.round(y/lato)*lato;
			var re=ah
			.append("rect")
			.attr("width",lato-1)
			.attr("height",2)
			.attr("x",0)
			.attr("y",0)
			.attr("transform","translate("+x+","+y+")")
			;
			//						console.log(y);
			var xx=ah.selectAll("rect").filter(function(dd,ii){
				return y==Math.round(1*getTranslation(d3.select(this).attr("transform"))[1]);
			}).size()-1;
			maxcnorm=Math.max(maxcnorm,xx*lato);
			re
			.transition()
			.delay(0*i*20)
			.duration(speed3*0.5*((tipo!=1) ? 4 : 1))
			.ease(d3.easeLinear)
			.attr("height",lato-1)
			.attr("transform","translate("+x+","+y+") rotate(0)")
			.on("end",function(){
				//						console.log(zac1.selectAll("rect").size());
				//console.log(bh.selectAll("rect").size());
				if (bh.selectAll("rect").size()==nrows+1) {
					//console.log(barr.select("g:nth-child("+(1*i+1)+")").node());
					//	console.log("!");
					bh.attr("opacity",0)
					//if (i % 2 == 0) 
					//bh.select("rect.redblock").attr("opacity",0)
				}
			})
			.transition()
			//						.delay(i*200)
			.duration(speed3*0.015*(x-(1*xx)*lato))
			.ease(d3.easeLinear)
			.attr("transform","translate("+(xx*lato)+","+y+") rotate(360)")
			.on("end",function(){
				d3.select(this).classed("done",true);
				var t=ah.selectAll("rect.done").size();
				//						console.log(g.selectAll("rect.done").size());
				if (tipo==1) {
					bh.remove();
					//scorre();
				} //else {
				//						console.log(t);
				if (t==ncols) {
					d3.select("#cp label.minutes").html("finished");
				scorre();} //mainLoop();
				//}
			})
			;
		}

		function shiftGrid3() {
			zac1
			.transition()
			.duration(speed3*((tipo==1) ? 1 : 3))
			.attr("transform",function(){
				var ctr=getTranslation(d3.select(this).attr("transform"));
				return "translate("+(ctr[0]-(lato))+",0)";
			})
			.on("end",function(){
			})
			;
			barr
			.transition()
			.duration(speed3*((tipo==1) ? 1 : 3))
			.attr("transform",function(){
				var ctr=getTranslation(d3.select(this).attr("transform"));
				return "translate("+(ctr[0]-(lato))+",0)";
			})
			.on("end",function(){
			})
			;
		}

		// ************************************************************
		// fine funzione scorre

	}

	// *******************************************
	// funzione per aggiornare a schermo p
	// *******************************************
	function modP(pp){d3.selectAll("#containerTCL .percentage").html(Math.floor(pp*5)+"%");
		perc=pp/20;
		randomSquares();
		updateCNorm(nrows);
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
		if (d3.select(this).classed("disabled")) return;
		d3.selectAll("#cp4 label").classed("selected",false);
		d3.select(this).classed("selected",true);
		tipo=(d3.select(this).classed("bycol")) ? 1 : ((d3.select(this).classed("byrow")) ? 2 : 0)
		updateTime(speed2)
	});
	//				d3.selectAll("#cp3 .pause").classed("disabled",true);

	// ********************************
	// pulsanti VELOCITA'
	// ********************************
	d3.selectAll("#cp2 .pick").on("click",function(d,i){
		d3.selectAll("#cp2 .pick").classed("selected",false);
		d3.select(this).classed("selected",true);
		speed2=Math.pow(2,1-i)*speed1;
		updateTime(speed2)
	});

	// ********************************
	// pulsante PLAY
	// ********************************
	d3.selectAll("#cp label.start").on("click",function(){
		debug && console.log("start");
		if (d3.select(this).classed("disabled")) return;
//				if (abarr.selectAll("rect:not(.done)").size()>0) return;
		if (zac1.selectAll("g.falling:not(.falled)").selectAll("rect").size()>0) return;		
		stop=false;
		d3.selectAll("#cp label:not(.text):not(.pick)").classed("disabled",true);
		d3.select("#cp label.pause").classed("disabled",false);
		d3.select("#cp label.reset").classed("disabled",true);
		scorre();
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
	});

	// ********************************
	// pulsante RESET
	// ********************************
	d3.selectAll("#cp3 .reset").on("click",function(){
		debug && console.log("reset");
		d3.selectAll("#cp label").classed("disabled",false);
		d3.select("#cp3 .pause").classed("disabled",true);
		svg.selectAll("g.column").remove();
		zac1.attr("transform","");
		barr.attr("transform","");
		abarr.selectAll("g").remove();
		perc=pp/20;updateCNorm(nrows);
		start();
		updateTime(speed2)
	});
	// FINE INIZIALIZZAZIONE PULSANTI ------------------------------------------------------------------------------------
}
