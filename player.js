var type = ['x', 'o'];

var playerName;
var player = -1;
var yourMove = false;
var score = 0;

var players = [];
var playerScores = [];

var otherPlayer;


var socket;
var port = 4444;
var url = "192.168.0.102";

function setup()
{
	socket = io.connect(url + ":" + port);
	addListeners();
}

function addListeners()
{
	socket.on('connected', function ()
	{
		console.log('connected');
	});

	socket.on('multiplayer', function ()
	{
		yourMove = true;
		player = 1;
		showGameScreen();
		updateHUD();
	});

	socket.on('multiplayerWanted', function ()
	{
		socket.emit('joinGame');
		showGameScreen();
		player = 2;
		updateHUD();
	});

	socket.on('fillCell', function (id, symbol)
	{
		fillCell(id, symbol);
	});

	socket.on('yourMove', function ()
	{
		yourMove = true;
		updateHUD();
	});

	socket.on('winner', function (symbol)
	{
		alert(symbol + 'won!');
	});

	socket.on('increaseScore', function()
	{
		score++;
		updateHUD();
	});

	socket.on('players', function(p_players, p_playerScores)
	{
		players = p_players;
		playerScores = p_playerScores;
		if (player == 1)
			otherPlayer = players[1];
		else
			otherPlayer = players[0];
		updateHUD();
	});

	socket.on('newRound', function ()
	{
		resetBoard();
		switch (player)
		{
			case 1:
				yourMove = true;
				break;
			case 2:
				yourMove = false;
				break;
		}
		updateHUD();
	});

	socket.on('gameOver', function (winner)
	{
		if (winner == -1)
			alert('Draw');
		else
			alert(winner + ' won!');
		handleStorage(winner);
		resetBoard();
		showMenu();
	});
}

function updateHUD()
{
	$('.hud').removeClass('currentPlayer');

	for (var i = 0; i < players.length; i++) {
		$('#p'+(i+1)).text(type[i] + ' : ' + players[i] + ' : ' + playerScores[i]);
	}

	if (yourMove)
	{
		$('#p'+player).addClass('currentPlayer');
	}
	else
	{
		switch (player)
		{
			case 1:
				$('#p2').addClass('currentPlayer');
				break;
			case 2:
				$('#p1').addClass('currentPlayer');
				break;
		}
	}
}

function fillCell(id, symbol)
{
	$('#'+id).addClass(symbol);
}

function resetBoard()
{
	$('.cell').removeClass('x');
	$('.cell').removeClass('o');
}

function moveOver()
{
	yourMove = false;
	updateHUD();
	socket.emit('moveOver');
}

function handleStorage(winner)
{
	var d = new Date();
	var month = (d.getMonth()+1);
	var cd = d.getDate() + "/" + month + "/" + d.getFullYear();

	var playerData = localStorage.getItem(playerName);

	if (playerData === null)
		playerData = "";

	if (playerName == winner)
		playerData+= "You played "+otherPlayer+" and won. " + cd +"~";
	else
		playerData+= "You played "+otherPlayer+" and lost. " + cd +"~";

	localStorage.setItem(playerName, playerData);
}