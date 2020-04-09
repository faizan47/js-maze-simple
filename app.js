const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;
const border = 20;
const width = window.innerWidth;
const height = window.innerHeight - 20;
const cellsHorizontal = 8;
const cellsVertical = 8;
const unitLengthX = width / cellsHorizontal;
const unitLengthY = height / cellsVertical;

const engine = Engine.create();
// Disable gravity in the y direction
engine.world.gravity.y = 0;
const { world } = engine;
const render = Render.create({
	element: document.body,
	engine: engine,
	options: {
		width,
		height,
		wireframes: false
	}
});

Render.run(render);
Runner.run(Runner.create(), engine);
const walls = [
	Bodies.rectangle(width / 2, 0, width, border, {
		isStatic: true,
		render: { fillStyle: '#264880' }
	}),
	Bodies.rectangle(width / 2, height, width, border, {
		isStatic: true,
		render: { fillStyle: '#264880' }
	}),
	Bodies.rectangle(0, height / 2, border, height, {
		isStatic: true,
		render: { fillStyle: '#264880' }
	}),
	Bodies.rectangle(width, height / 2, border, height, {
		isStatic: true,
		render: { fillStyle: '#264880' }
	})
];
World.add(world, walls);

const shuffle = (arr) => {
	let counter = arr.length - 1;
	while (counter > 0) {
		const index = Math.floor(Math.random() * counter);

		let temp = arr[counter];
		arr[counter] = arr[index];
		arr[index] = temp;
		counter--;
		// console.log(`Index: ${index}`, `Counter: ${counter}`);
	}
	return arr;
};

// World.add(world, MouseConstraint.create(engine, { mouse: Mouse.create(render.canvas) }));

const grid = Array(cellsVertical).fill(null).map(() => Array(cellsHorizontal).fill(false));
// We do not use [false, false, false] here because all arrays would be the same in memory and chanding one would affect all

const verticals = Array(cellsVertical).fill(null).map(() => Array(cellsHorizontal).fill(false));
const horizontals = Array(cellsVertical - 1).fill(null).map(() => Array(cellsHorizontal).fill(false));
const startRow = Math.floor(Math.random() * cellsVertical);
const startCol = Math.floor(Math.random() * cellsHorizontal);

const crossCell = (row, col) => {
	// if the neighbour is visited,retrun
	if (grid[row][col]) {
		return;
	}
	// mark the grid as visited
	grid[row][col] = true;

	const neighbours = shuffle([
		[ row - 1, col, 'up' ],
		[ row, col + 1, 'right' ],
		[ row + 1, col, 'down' ],
		[ row, col - 1, 'left' ]
	]);
	for (neighbour of neighbours) {
		const [ nextRow, nextCol, direction ] = neighbour;
		// check if neighbour is going outside bonds
		// if (nextRow < 0 || nextRow >= cellsVertical || nextCol < 0 || nextCol >= cellsHorizontal) {
		// 	continue;
		// }
		if (nextRow < 0 || nextRow >= cellsVertical || nextCol < 0 || nextCol >= cellsHorizontal) {
			continue;
		}
		if (grid[nextRow][nextCol]) {
			continue;
		}

		//remove a wall from horizontal or verticals
		switch (direction) {
			case 'up':
				horizontals[row - 1][col] = true;
				break;
			case 'right':
				verticals[row][col] = true;
				break;
			case 'down':
				horizontals[row][col] = true;
				break;
			case 'left':
				verticals[row][col - 1] = true;
				break;
		}

		// visit next cell
		// Repeat for the new neighbour

		crossCell(nextRow, nextCol);
	}
	// console.log(horizontals);
	// console.log(verticals);

	//For the remaining neighbours, move to it and remove the wall between in between
};

crossCell(startRow, startCol);

horizontals.forEach((row, rowIndex) => {
	row.forEach((open, colIndex) => {
		if (open) return;
		// console.log(row);
		const wall = Bodies.rectangle(
			colIndex * unitLengthX + unitLengthX / 2, //left to right (x)
			rowIndex * unitLengthY + unitLengthY, // top to bottom (y)
			unitLengthX, //width
			5, //height
			{
				label: 'wall',
				isStatic: true,
				render: { fillStyle: '#264880' }
			}
		);
		World.add(world, wall);
	});
});
verticals.forEach((row, rowIndex) => {
	row.forEach((open, colIndex) => {
		if (open) return;
		const wall = Bodies.rectangle(
			colIndex * unitLengthX + unitLengthX, //left to right (x)
			rowIndex * unitLengthY + unitLengthY / 2, // top to bottom (y)
			5, //width
			unitLengthY, //height
			{
				label: 'wall',
				isStatic: true,
				render: { fillStyle: '#264880' }
			}
		);
		World.add(world, wall);
	});
});

// const goal = Bodies.rectangle(width - unitLengthX / 2, height - unitLengthY / 2, unitLengthX * 0.7, unitLengthY * 0.7, {
// 	label: 'goal',
// 	isStatic: true
// });
const goal = Bodies.rectangle(
	width - unitLengthX / 2,
	height - unitLengthY / 2,
	Math.min(unitLengthX, unitLengthY) * 0.7,
	Math.min(unitLengthX, unitLengthY) * 0.7,
	{
		label: 'goal',
		isStatic: true,
		render: { fillStyle: 'red' }
	}
);
// World.add(world, goal);
World.add(world, goal);
const ballRadius = Math.min(unitLengthX, unitLengthY) / 4;
const ball = Bodies.circle(unitLengthX / 2, unitLengthY / 2, ballRadius, {
	isStatic: false,
	render: {
		fillStyle: '#46a832'
	},
	label: 'ball'
});

World.add(world, ball);

document.addEventListener('keydown', (e) => {
	const { x, y } = ball.velocity;
	if (e.key === 'ArrowUp' || e.key === 'w') {
		// console.log('Move up');
		Body.setVelocity(ball, { x, y: y - 5 });
	} else if (e.key === 'ArrowRight' || e.key === 'd') {
		Body.setVelocity(ball, { x: x + 5, y });
	} else if (e.key === 'ArrowDown' || e.key === 's') {
		Body.setVelocity(ball, { x, y: y + 5 });
	} else if (e.key === 'ArrowLeft' || e.key === 'a') {
		Body.setVelocity(ball, { x: x - 5, y });
	}
});
Events.on(engine, 'collisionStart', (e) => {
	for (ev of e.pairs) {
		const labels = [ 'ball', 'goal' ];
		if (labels.includes(ev.bodyA.label) && labels.includes(ev.bodyA.label)) {
			world.gravity.y = 1;
			document.querySelector('.winner').classList.remove('hidden');
			for (body of world.bodies) {
				if (body.label === 'wall') {
					Body.setStatic(body, false);
				}
			}
		}
	}
});
