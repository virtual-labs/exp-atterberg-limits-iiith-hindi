'use strict';

document.addEventListener('DOMContentLoaded', function() {

	const restartButton = document.getElementById('restart');
	const instrMsg = document.getElementById('procedure-message');

	restartButton.addEventListener('click', function() { restart(); });

	function finish(step)
	{
		if(!flag && step === enabled.length - 1)
		{
			flag = true;
			const retTrace = logic(tableData);
			generateTableHead(table, Object.keys(tableData[0]));
			generateTable(table, tableData);
			drawGraph([retTrace], ['No. of Drops(N)', 'Water Content(%)'], 'plot');

			document.getElementById("main").style.display = 'none';
			document.getElementById("graph").style.display = 'inline-block';
			document.getElementById("apparatus").style.display = 'none';
			document.getElementById("observations").style.width = '40%';
			if(small)
			{
				document.getElementById("observations").style.width = '85%';
			}
		}
	};

	function randomNumber(min, max) {
		return Number((Math.random() * (max - min + 1) + min).toFixed(2));
	};

	function randomInt(min, max) {
		return Number(Math.floor(randomNumber(min, max)));
	};

	function logic(tableData)
	{
		const waterContents = [randomNumber(22, 23.5), randomNumber(24, 25.5), randomNumber(27, 28.5), randomNumber(30, 31.5)];
		const drops = [randomInt(29, 33), randomInt(24, 28), randomInt(18, 22), randomInt(12, 16)];

		let xVals = [], yVals = [];
		tableData.forEach(function(row, index) {
			row['Sample No.'] = index;
			row['Water Content(%)'] = waterContents[index];
			row['No. of Drops(N)'] = drops[index];
			xVals.push(drops[index]);
			yVals.push(waterContents[index]);
		});

		const retTrace = trace(xVals, yVals, 'Liquid Limit Chart');
		let liqLim;
		retTrace['x'].forEach(function(xcoord, ix) {
			if(xcoord === 25)
			{
				liqLim = retTrace['y'][ix];
			}
		});

		document.getElementById('output').innerHTML = "Liquid Limit = " + String(liqLim);
		return retTrace;
	};

	function limCheck(obj, translate, lim, step)
	{
		if(obj.pos[0] === lim[0])
		{
			translate[0] = 0;
		}

		if(obj.pos[1] === lim[1])
		{
			translate[1] = 0;
		}

		if(translate[0] === 0 && translate[1] === 0)
		{
			if(step === 3)
			{
				objs['soil'].color = data.colors.wetSoilBrown;
				keys = keys.filter(function(val, index) {
					return val !== "water";
				});
			}

			return step + 1;
		}

		return step;
	};

	function updatePos(obj, translate)
	{
		obj.pos[0] += translate[0];
		obj.pos[1] += translate[1];
	};

	class container {
		constructor(height, width, radius, x, y) {
			this.height = height;
			this.width = width;
			this.radius = radius;
			this.pos = [x, y];
		};

		draw(ctx) {
			ctx.fillStyle = "white";
			ctx.lineWidth = 3;

			if(this.width < 2 * this.radius) 
			{
				this.radius = this.width / 2;
			}

			if(this.height < 2 * this.radius) 
			{
				this.radius = this.height / 2;
			}

			ctx.beginPath();
			ctx.moveTo(this.pos[0] + this.radius, this.pos[1]);
			ctx.arcTo(this.pos[0] + this.width, this.pos[1], this.pos[0] + this.width, this.pos[1] + this.height, this.radius);
			ctx.arcTo(this.pos[0] + this.width, this.pos[1] + this.height, this.pos[0], this.pos[1] + this.height, this.radius);
			ctx.arcTo(this.pos[0], this.pos[1] + this.height, this.pos[0], this.pos[1], this.radius);
			ctx.arcTo(this.pos[0], this.pos[1], this.pos[0] + this.width, this.pos[1], this.radius);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();

			const e1 = [this.pos[0] + this.width, this.pos[1]], e2 = [...this.pos];
			const gradX = (e1[0] - e2[0]) / -4, gradY = 10;

			ctx.beginPath();
			ctx.moveTo(e2[0], e2[1]);
			curvedArea(ctx, e2, -1 * gradX, -1 * gradY);
			curvedArea(ctx, e1, gradX, gradY);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
		};
	};

	class soil {
		constructor(height, width, radius, x, y) {
			this.height = height;
			this.width = width;
			this.radius = radius;
			this.pos = [x, y];
			this.color = data.colors.soilBrown;
		};

		draw(ctx) {
			if(this.width < 2 * this.radius) 
			{
				this.radius = this.width / 2;
			}

			if(this.height < 2 * this.radius) 
			{
				this.radius = this.height / 2;
			}

			ctx.beginPath();
			ctx.fillStyle = this.color;
			ctx.beginPath();
	
			ctx.moveTo(this.pos[0] + this.radius, this.pos[1]);
			ctx.arcTo(this.pos[0] + this.width, this.pos[1], this.pos[0] + this.width, this.pos[1] + this.height, this.radius);
			ctx.arcTo(this.pos[0] + this.width, this.pos[1] + this.height, this.pos[0], this.pos[1] + this.height, this.radius);
			ctx.arcTo(this.pos[0], this.pos[1] + this.height, this.pos[0], this.pos[1], this.radius);
			ctx.arcTo(this.pos[0], this.pos[1], this.pos[0] + this.width, this.pos[1], this.radius);
			ctx.closePath();
			ctx.fill();
		};
	};

	class soilPat {
		constructor(height, width, angle, x, y) {
			this.width = width; 
			this.height = height;
			this.angle = angle;
			this.pos = [x, y];
			this.grooveDims = [0, 0];
		};

		draw(ctx) {
			ctx.fillStyle = data.colors.wetSoilBrown;
			const e1 = [this.pos[0] + this.width, this.pos[1] + this.height], e2 = [...this.pos], gradX = (e1[0] - e2[0]) / 2, gradY = (e1[1] - e2[1]) / 4;
			const inter = [((10 - this.grooveDims[0]) * e1[0] + this.grooveDims[0] * e2[0]) / 10, ((10 - this.grooveDims[0]) * e1[1] + this.grooveDims[0] * e2[1]) / 10];

			ctx.beginPath();
			ctx.moveTo(e2[0], e2[1]);
			ctx.bezierCurveTo(e2[0] - 3 * gradX, e2[1] + gradY, e1[0] - 2.5 * gradX, e1[1] + gradY, e1[0], e1[1]);
			ctx.lineTo(e1[0] - this.grooveDims[1] / 2, e1[1]);
			ctx.lineTo(inter[0] - this.grooveDims[1] / 2, inter[1]);
			ctx.lineTo(inter[0] + this.grooveDims[1] / 2, inter[1]);
			ctx.lineTo(e2[0], e2[1]);

			ctx.moveTo(e1[0], e1[1]);
			ctx.bezierCurveTo(e1[0] + 3.5 * gradX, e1[1] - gradY, e2[0] + 2 * gradX, e2[1] - gradY, e2[0], e2[1]);
			ctx.lineTo(inter[0], inter[1]);
			ctx.lineTo(inter[0] + this.grooveDims[1] / 2, inter[1]);
			ctx.lineTo(e1[0] + this.grooveDims[1] / 2, e1[1]);

			ctx.closePath();
			ctx.fill();
		};

		groove(change) {
			this.grooveDims[0] += change;

			if(this.grooveDims[0] >= 10)
			{
				return 1;
			}

			return 0;
		};
	};

	class water {
		constructor(height, width, x, y) {
			this.height = height;
			this.width = width;
			this.pos = [x, y];
		};

		draw(ctx) {
			ctx.fillStyle = data.colors.blue;

			ctx.beginPath();
			ctx.rect(this.pos[0], this.pos[1], this.width, this.height);
			ctx.closePath();
			ctx.fill();
		};

		mixing(unit) {
			this.height -= unit;
			this.pos[1] += unit;
		};
	};

	class casagrande {
		constructor(height, width, x, y) {
			this.height = height;
			this.width = width;
			this.pos = [x, y];
			this.img = new Image();
			this.img.src = './images/casagrande.png';
			this.img.onload = () => { ctx.drawImage(this.img, this.pos[0], this.pos[1], this.width, this.height); }; 
		};

		draw(ctx) {
			ctx.drawImage(this.img, this.pos[0], this.pos[1], this.width, this.height);
		};
	};

	class casagrandeSide {
		constructor(height, width, angle, x, y) {
			this.height = height;
			this.width = width; 
			this.angle = angle; 
			this.pos = [x, y];
			this.knobAngle = angle;
		};

		draw(ctx) {
			// Lower horizontal part
			const vertDivide = 0.60;
			ctx.fillStyle = data.colors.brown;
			ctx.lineWidth = lineWidth;
			ctx.beginPath();
			ctx.rect(this.pos[0], this.pos[1] + vertDivide * this.height, this.width, (1 - vertDivide) * this.height);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();

			// Right vertical part
			const horizDivide = 0.80;
			ctx.beginPath();
			ctx.rect(this.pos[0] + horizDivide * this.width, this.pos[1], (1 - horizDivide) * this.width, vertDivide * this.height);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();

			// Main cup part
			ctx.fillStyle = data.colors.yellow;
			const gap = 0.2, e1 = [this.pos[0] + horizDivide * this.width, this.pos[1] + gap * this.height], e2 = [this.pos[0], this.pos[1] + gap * this.height], gradX = (e1[0] - e2[0]) / -4, gradY = 60;
			const center = [e1[0] + (1 - horizDivide) * this.width / 2, e1[1]];

			ctx.translate(e1[0], e1[1]);
			ctx.rotate(this.angle);
			e2[0] -= e1[0];
			e2[1] -= e1[1];
			e1[0] = 0;
			e1[1] = 0;

			ctx.beginPath();
			ctx.moveTo(e2[0], e2[1]);
			ctx.lineTo(e1[0], e1[1]);
			ctx.bezierCurveTo(e1[0], e1[1] + 0.7 * gradY, e2[0], e2[1] + gradY, e2[0], e2[1]);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
			ctx.setTransform(1, 0, 0, 1, 0, 0);

			// Knob
			ctx.fillStyle = data.colors.gray;
			let radius = 0, angle = this.knobAngle; 

			ctx.beginPath();
			ctx.moveTo(center[0], center[1]);
			for (let n = 0; n < 75; n++) {
				radius += 0.25;
				angle += Math.PI * 2 / 50;
				const x = center[0] + radius * Math.cos(angle), y = center[1] + radius * Math.sin(angle);
				ctx.lineTo(x, y);
			}
			ctx.lineTo(center[0], center[1]);

			ctx.closePath();
			ctx.fill();
		};

		rotate(rotAng) {
			this.angle += rotAng;
			this.knobAngle += math.abs(rotAng * 16); 

			if(this.angle < -Math.PI / 16 || this.angle >= 0)
			{
				return -1;
			}

			return 1;
		};
	};

	function lineFromPoints(p, q)
	{
		const m = (q[1] - p[1]) / (q[0] - p[0]), c = p[1] - m * p[0];
		const xVals = math.range(p[0], q[0], -1).toArray();
		const yVals = xVals.map(function (x) {
			return Number((m * x + c).toFixed(2));
		});

		return [xVals, yVals];
	};

	function trace(Xaxis, Yaxis, name)
	{
		let xVals = [], yVals = [];

		Xaxis.forEach(function(xcoord, i) {
			let xTemp, yTemp;
			if(i !== Xaxis.length - 1)
			{
				[xTemp, yTemp] = lineFromPoints([Xaxis[i], Yaxis[i]], [Xaxis[i + 1], Yaxis[i + 1]]);
			}

			xVals = xVals.concat(xTemp);
			yVals = yVals.concat(yTemp);
		});

		const retTrace = {
			x: xVals,
			y: yVals,
			name: name,
			type: 'scatter',
			mode: 'lines',
		};

		return retTrace;
	};

	function drawGraph(traces, text, id) {
		try {
			const layout = {
				width: 400,
				height: 400,
				xaxis: {
					title: {
						text: text[0],
						font: {
							family: 'Courier New, monospace',
							size: 18,
							color: '#000000'
						}
					},
					range: [0, 35],
					dtick: 5
				},
				yaxis: {
					title: {
						text: text[1],
						font: {
							family: 'Courier New, monospace',
							size: 18,
							color: '#000000'
						}
					},
					range: [0, 35],
					dtick: 5 
				}
			};

			const config = {responsive: true};
			Plotly.newPlot(id, traces, layout, config);
		}

		catch (err) {
			console.error(err);
			alert(err);
		}
	};

	function init()
	{
		objs = {
			"container": new container(90, 120, 8, 90, 290),
			"casagrande": new casagrande(180, 210, 540, 200),
			"water": new water(30, 120, 90, 320),
			"soil": new soil(40, 120, 8, 90, 340),
		};
		keys = [];

		enabled = [["container"], ["container", "soil"], ["container", "soil", "water"], ["container", "soil"], ["container", "soil", "casagrande"], ["soil", "casagrande"], ["soil", "casagrande"], ["casagrande"], []];
		step = 0;
		translate = [0, 0];
		lim = [-1, -1];
		revolts = 0;
		rots = 0;
		flag = false;
	};

	function restart() 
	{ 
		window.clearTimeout(tmHandle); 

		document.getElementById("main").style.display = 'block';
		document.getElementById("graph").style.display = 'none';
		document.getElementById("apparatus").style.display = 'block';
		document.getElementById("observations").style.width = '';

		table.innerHTML = "";
		init();

		tmHandle = window.setTimeout(draw, 1000 / fps); 
	};

	function generateTableHead(table, data) {
		const thead = table.createTHead();
		const row = thead.insertRow();
		data.forEach(function(key, ind) {
			const th = document.createElement("th");
			const text = document.createTextNode(key);
			th.appendChild(text);
			row.appendChild(th);
		});
	};

	function generateTable(table, data) {
		data.forEach(function(rowVals, ind) {
			const row = table.insertRow();
			Object.keys(rowVals).forEach(function(key, i) {
				const cell = row.insertCell();
				const text = document.createTextNode(rowVals[key]);
				cell.appendChild(text);
			});
		});
	};

	function check(event, translate, step, flag=true)
	{ 
		if(translate[0] !== 0 || translate[1] !== 0)
		{
			return;
		}

		const canvasPos = [(canvas.width / canvas.offsetWidth) * (event.pageX - canvas.offsetLeft), (canvas.height / canvas.offsetHeight) * (event.pageY - canvas.offsetTop)];
		const errMargin = 10;

		let hover = false;
		canvas.style.cursor = "default";
		keys.forEach(function(val, ind) {
			if(canvasPos[0] >= objs[val].pos[0] - errMargin && canvasPos[0] <= objs[val].pos[0] + objs[val].width + errMargin && canvasPos[1] >= objs[val].pos[1] - errMargin && canvasPos[1] <= objs[val].pos[1] + objs[val].height + errMargin)
			{
				if(step === 3 && val === "soil")
				{
					hover = true;
					translate[1] = 1;
					lim[1] = 350;
				}

				else if(step === 5 && val === "soil")
				{
					hover = true;
					if(flag)
					{
						const center = [objs['soil'].pos[0] + objs['soil'].width / 2, objs['soil'].pos[1] + objs['soil'].height / 2];
						objs['soil'] = new soilPat(-55, 40, 60 * Math.PI / 180, center[0], center[1]);
					}

					translate[0] = 5;
					translate[1] = -5;
					lim[0] = 605;
					lim[1] = 305;
				}

				else if(step === 6 && val === "casagrande")
				{
					hover = true;
					translate[0] = 0.5;
					if(flag)
					{
						objs['soil'].grooveDims[1] = 10;
					}
				}

				else if(step === 7 && val === "casagrande")
				{
					hover = true;
					if(flag)
					{
						objs['casagrande'] = new casagrandeSide(150, 200, 0, 550, 230);
						keys = keys.filter(function(val, index) {
							return val !== "soil";
						});
						translate[0] = -Math.PI / (16 * 50);
					}
				}

				else if(step === 8 && val === "container")
				{
					hover = true;
					translate[0] = -5;
					translate[1] = -5;
					lim[0] = 135;
					lim[1] = 110;
				}
			}
		});

		if(!flag && hover)
		{
			canvas.style.cursor = "pointer";
			translate[0] = 0;
			translate[1] = 0;
			lim[0] = 0;
			lim[1] = 0;
		}
	};

	function curvedArea(ctx, e, gradX, gradY)
	{
		ctx.bezierCurveTo(e[0], e[1] += gradY, e[0] += gradX, e[1] += gradY, e[0] += gradX, e[1]);
		ctx.bezierCurveTo(e[0] += gradX, e[1], e[0] += gradX, e[1] -= gradY, e[0], e[1] -= gradY);
	};

	const canvas = document.getElementById("main");
	canvas.width = 840;
	canvas.height = 400;
	canvas.style = "border:3px solid";
	const ctx = canvas.getContext("2d");

	const border = "black", lineWidth = 1.5, fps = 150;
	const msgs = [
		"Click on 'Container' in the apparatus menu to add a container to the workspace.",
		"Click on 'Soil Sample' in the apparatus menu to add a soil sample to the container.",
		"Click on 'Water' in the apparatus menu to add water to the soil filled container.",
		"Click on the soil to mix the soil with the water.",
		"Click on 'Casagrande Apparatus' in the apparatus menu to add a casagrande cup to the workspace.", 
		"Click on the container to move the soil to the casagrande apparatus as a soil pat.",
		"Click on the casagrande apparatus to cut a groove in the soil pat.",
		"Click on the casagrande apparatus to rotate the cup. Finally, determine the water content of the soil sample. Use the following <a href='https://sd-iiith.vlabs.ac.in/exp/water-content/'>link</a> to learn more about water content determination.",
		"Click the restart button to perform the experiment again.",
	];

	let step, translate, lim, objs, keys, enabled, small, revolts, rots, flag;
	init();

	const tableData = [
		{ "Sample No.": "", "Water Content(%)": "", "No. of Drops(N)": "" },
		{ "Sample No.": "", "Water Content(%)": "", "No. of Drops(N)": "" },
		{ "Sample No.": "", "Water Content(%)": "", "No. of Drops(N)": "" },
		{ "Sample No.": "", "Water Content(%)": "", "No. of Drops(N)": "" },
	];

	const objNames = Object.keys(objs);
	objNames.forEach(function(elem, ind) {
		const obj = document.getElementById(elem);
		obj.addEventListener('click', function(event) {
			keys.push(elem);
			step += 1;
		});
	});

	// Input Parameters 
	canvas.addEventListener('mousemove', function(event) {check(event, translate, step, false);});
	canvas.addEventListener('click', function(event) {check(event, translate, step);});

	const table = document.getElementsByClassName("table")[0];

	function responsiveTable(x) {
		if(x.matches)	// If media query matches
		{ 
			small = true;
			if(step === enabled.length - 1)
			{
				document.getElementById("observations").style.width = '85%';
			}
		} 

		else
		{
			small = false;
			if(step === enabled.length - 1)
			{
				document.getElementById("observations").style.width = '40%';
			}
		}
	};

	let x = window.matchMedia("(max-width: 1023px)");
	responsiveTable(x); // Call listener function at run time
	x.addListener(responsiveTable); // Attach listener function on state changes

	function draw()
	{
		ctx.clearRect(0, 0, canvas.width, canvas.height); 
		ctx.lineCap = "round";
		ctx.lineJoin = "round";

		let ctr = 0;
		document.getElementById("main").style.pointerEvents = 'none';

		objNames.forEach(function(name, ind) {
			document.getElementById(name).style.pointerEvents = 'auto';
			if(keys.includes(name) || !(enabled[step].includes(name)))
			{
				document.getElementById(name).style.pointerEvents = 'none';
			}

			if(keys.includes(name)) 
			{
				if(enabled[step].includes(name))
				{
					ctr += 1;
				}
				objs[name].draw(ctx);
			}
		});

		if(ctr === enabled[step].length)
		{
			document.getElementById("main").style.pointerEvents = 'auto';
		}

		if(translate[0] !== 0 || translate[1] !== 0)
		{
			let temp = step;
			const soilMoves = [5], waterMoves = [3];

			if(step === 6)
			{
				temp += objs['soil'].groove(translate[0]);
				if(temp !== step)
				{
					translate[0] = 0;
				}
			}

			else if(step === 7)
			{
				translate[0] *= objs['casagrande'].rotate(translate[0]);
				rots = (rots + 1) % (2 * 50);
				if(rots === 0)
				{
					revolts += 1;
					if(revolts >= 10)
					{
						translate[0] = 0;
						revolts = 0;
						temp += 1;
					}
				}
			}

			else if(soilMoves.includes(step))
			{
				updatePos(objs['soil'], translate);
				temp = limCheck(objs['soil'], translate, lim, step);
			}

			else if(waterMoves.includes(step))
			{
				objs['water'].mixing(translate[1]);
				temp = limCheck(objs['water'], translate, lim, step);
			}

			step = temp;
		}

		document.getElementById("procedure-message").innerHTML = msgs[step];
		finish(step);
		tmHandle = window.setTimeout(draw, 1000 / fps);
	};

	let tmHandle = window.setTimeout(draw, 1000 / fps);
});
