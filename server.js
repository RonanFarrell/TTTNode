var port = 4444;

var app = require('http').createServer(handler),
	fs = require('fs'),
	path = require('path'),
	io = require('socket.io').listen(app);


app.listen(port);
io.set('log level', 1);

var players = [];
var playerScores = [];
var round = 1;
var maxRounds = 3;

//--Game Related variables--//
var winningCombos = [[0,1,2],[3,4,5],[6,7,8],
					[0,3,6],[1,4,7],[2,5,8],
					[0,4,8],[2,4,6]];
var cellContent = [];
var cellsFilled = 0;

function setupGame () {
	for (var i = 0; i < 9; i++)
	{
		cellContent[i] = '';
	}
	cellsFilled = 0;
}

function checkWinner(symbol)
{
	for (var i = 0; i < winningCombos.length; i++) {
		if (cellContent[winningCombos[i][0]]==symbol &&
			cellContent[winningCombos[i][1]]==symbol &&
			cellContent[winningCombos[i][2]]==symbol)
		{
			return true;
		}
	}
}


function handler (request, response)
{
	var filePath = '.' + request.url;

	if (filePath == './')
		filePath = './index.html';

	var extname = path.extname(filePath);
	var contentType = 'text/html';

	switch (extname)
	{
		case '.js':
			contentType = 'text/javascript';
			break;
		case '.css':
			contentType = 'text/css';
			break;
		case '.ttf':
			contentType = 'font/truetype';
			break;
		case '.png':
			contentType = 'Image';
			break;
		case '.jpg':
			contentType = 'Image';
			break;
	}

	path.exists(filePath, function (exists)
	{
		if (exists)
		{
			fs.readFile(filePath, function (error, content)
			{
				if (error)
				{
					response.writeHead(500);
					response.end();
				}
				else
				{
					response.writeHead(200, {'Content-Type':contentType});
					response.end(content, 'utf-8');
				}
			});
		}
		else
		{
			response.writeHead(404);
			response.end();
		}
	});

}

io.sockets.on('connection', function (socket)
{
	addListeners(socket);
});

function addListeners(socket)
{
	socket.on('multiplayer', function ()
	{
		socket.emit('multiplayer');
		socket.broadcast.emit('multiplayerWanted');

		socket.set('playerIndex', 0);

		socket.get('name', function (err, name)
		{
			players.push(name);
			playerScores.push(0);
		});
		console.log(players);
		setupGame();
	});

	socket.on('move', function (id, symbol)
	{
		handleMove(socket, id, symbol);
	});

	socket.on('moveOver', function ()
	{
		socket.broadcast.emit('yourMove');
	});

	socket.on('login', function (name)
	{
		socket.set('name', name);
	});

	socket.on('joinGame', function ()
	{
		socket.set('playerIndex', 1);
		socket.get('name', function (err, name)
		{
			players.push(name);
			playerScores.push(0);
		});

		socket.emit('players', players, playerScores);
		socket.broadcast.emit('players', players, playerScores);
		console.log(players);
	});
}

function handleMove (socket, id, symbol)
{
	cellContent[id] = symbol;
	cellsFilled++;
	socket.broadcast.emit('fillCell', id, symbol);
	if (checkWinner(symbol))
	{
		socket.get('playerIndex', function (err, playerIndex)
		{
			playerScores[playerIndex]++;
		});

		socket.emit('players', players, playerScores);
		socket.broadcast.emit('players', players, playerScores);

		manageRounds(socket);
	}
	if (cellsFilled == 9)
	{
		manageRounds(socket);
	}
}

function manageRounds (socket)
{
	round++;

	if (round <= maxRounds)
		{
			socket.emit('newRound');
			socket.broadcast.emit('newRound');
			setupGame();
		}
		else
		{
			//game over, find out who won
			socket.emit('gameOver', gameWinner());
			socket.broadcast.emit('gameOver', gameWinner());
			gameOver();
		}
}

function gameOver()
{
	setupGame();
	round = 1;
	players = [];
	playerScores = [];
}

function gameWinner ()
{
	if (playerScores[0] > playerScores[1])
		return players[0];
	else if (playerScores[1] > playerScores[0])
		return players[1];
	else
		return -1;
}