jQuery(function($)
{
	showLogin();
	setup();

	addBtnListeners();

	$('.cell').click(function()
	{
		console.log(yourMove);
		if (yourMove)
		{
			if(!$(this).hasClass('x') && !$(this).hasClass('o'))
			{
				$(this).addClass(type[player - 1]);

				fillCell(this.id, type[player - 1]);
				moveOver();
				socket.emit('move', this.id, type[player -1]);
			}
		}
	});
});

function hideAll()
{
	$('#game').hide();
	$('#menu').hide();
	$('#login').hide();
	$('#historyScreen').hide();
	$('#optionsScreen').hide();
}

function showMenu()
{
	hideAll();
	$('#menu').show();
}

function showGameScreen()
{
	hideAll();
	$('#game').show();
}

function showLogin()
{
	hideAll();
	$('#login').show();
}

function showHistory()
{
	hideAll();
	$('#historyScreen').show();
}

function showOptions()
{
	hideAll();
	$('#optionsScreen').show();
}

function addBtnListeners()
{
	$('#singlePlayer').click(function()
	{
		showGameScreen();
	});

	$('#multiplayer').click(function()
	{
		socket.emit('multiplayer');
	});

	$('#loginBtn').click(function()
	{
		if ($('#loginInput').val() !== "")
		{
			showMenu();
			playerName = $('#loginInput').val();
			socket.emit('login', playerName);
		}
		else
			alert('You forgot your name!');
	});

	$('#history').click( function()
	{
		fillHistory();
		showHistory();
	});

	$('#options').click( function()
	{
		showOptions();
	});

	$('#mainMenuOptions').click( function()
	{
		showMenu();
	});

	$('#clearHistory').click( function()
	{
		localStorage.setItem(playerName, "");
		$('.historyEntry').remove();
		alert("History Cleared");
	});

	$('#rtnMainMenu').click(function()
	{
		showMenu();
	});
}

function fillHistory()
{
	var x = localStorage.getItem(playerName);
	if (x !== null && x !== "")
	{
		var y = x.split("~");
		var hist = '<p id="hist"></p>';
		for (var i = y.length - 1; i >= 0 ; i--)
		{
			console.log(hist);
			hist += '<p class="historyEntry">'+y[i]+'</p>\n';
		}
		$('#hist').replaceWith(hist);
	}
	else
	{
		var message = '<p id="hist">Nothing seems to be here</p>';
		$('#hist').replaceWith(message);
	}
}