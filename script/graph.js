function Render() {


	const mapBody = document.getElementById("game-map").children[0];
	const handBoard = document.getElementById("hand-board");
	const stacksParent = document.getElementsByClassName("stack-content");
	const DATA_CARDS = cardsJSON;
	const TILES_IMG = ["src/models/green.png", "src/models/stone_tex.png", "src/models/rune.png", "src/models/blue.png"]

	this.renderMap = function(inputMap){
		let height = 6;
		let width = 12;
		for (let i = 0; i < height; i++) {
			mapBody.appendChild(document.createElement("tr"));
			for (let j = 0; j < width; j++) {
				mapBody.lastChild.appendChild(document.createElement("td"));
			}
		}
		for (let i = 0; i < height; i++) {

			for (let j = 0; j < width; j++) {
				let tmp = inputMap.get(j, i).type;
				let img = new Image();
				img.src = TILES_IMG[tmp];
				mapBody.children[i].children[j].appendChild(img);
			}
		}
		for (let i = 0; i < 6; i++) {
			stacksParent[i].stackLevel = 0;
			stacksParent[i].stackType = null;
		}
	};

	const UNIT_IMGS = ["src/models/hero.png", "src/models/monster.png", "src/models/bomb.png"];

	this.moveUnit = function(cellFrom, cellTo) {
		let fromElem = mapBody.children[cellFrom.y].children[cellFrom.x];
		let toElem = mapBody.children[cellTo.y].children[cellTo.x];

		let from_x = fromElem.offsetLeft;
		let from_y = fromElem.parentElement.offsetTop;

		let to_x = toElem.offsetLeft;
		let to_y = toElem.parentElement.offsetTop;

		let el = fromElem.lastChild;
		toElem.appendChild(el);
		el.style.zIndex = '2';
		el.style.transition = "transform .4s";
		el.style.transform = 'translateY('+ (from_y-to_y) +'px)';
		el.style.transform += 'translateX('+ (from_x-to_x) +'px)';

		setTimeout(function(){
			el.style.transform = 'translateY(0px)';
			el.style.transform += 'translateX(0px)';
		}, 0)
	};

	this.initUnit = function(cell) {

		let img = new Image();
		img.src = UNIT_IMGS[cell.unit.type];
		mapBody.children[cell.y].children[cell.x].appendChild(img);
		img.style.transition = "transform .4s";
		img.style.transform = 'scale(0)';
		setTimeout(function(){
			img.style.transform = 'scale(1)';
		}, 0);

	};

	this.killUnit = function(cell) {
		mapBody.children[cell.y].children[cell.x].innerHTML = ''
	};

	this.selectCards = function(cards, count, callback) {
		programmingSession = false;

		let desk = document.getElementById("choose-board");
		desk.innerHTML = '';
		desk.style.display = "inline-block";

		let deskBoard = desk
		deskBoard.style.opacity = '0';
		deskBoard.style.transition = "opacity .4s";
		setTimeout(function(){
			deskBoard.style.opacity = '1';
		}, 0)

		let arrayIdSelectedCards = [];

		desk.appendChild(document.createElement("div"));
		desk.children[0].style.display = "block";
		let board = desk.children[0];
		board.className = "desk-card";
		for (let i = 0; i < cards.length; i++) {
			board.appendChild(document.createElement("div"));
			board.children[i].className = "round-cards";
			let img = getNewCardElem(cards[i])
			img.tempSelectId = i;
			img.onclick = function(e) {
				if (arrayIdSelectedCards.length !== count && e.currentTarget.select !== 'true') {
					e.currentTarget.classList.add("selected-card");
					e.currentTarget.select = 'true'
					arrayIdSelectedCards.push(e.currentTarget.tempSelectId|0);
				} else if (e.currentTarget.select === 'true') {
					arrayIdSelectedCards = arrayIdSelectedCards.filter(c => c !== e.currentTarget.tempSelectId);
					e.currentTarget.classList.remove("selected-card");
					e.currentTarget.select = 'false'
				}
				if (arrayIdSelectedCards.length === count) {
					let btn = document.getElementsByClassName("ok-choose");
					btn[0].classList.remove("noActive")
				} else {
					let btn = document.getElementsByClassName("ok-choose");
					btn[0].classList.add("noActive")
				}
			};
			board.children[i].appendChild(img);
		}
		desk.appendChild(document.createElement("div"));
		desk.children[1].style.display = "block";
		desk = desk.children[1];
		desk.className = "desk";
		desk.appendChild(document.createElement("button"));
		desk.children[0].classList.add("ok-choose");
		desk.children[0].classList.add("noActive")
		desk.children[0].textContent = "OK";
		desk.children[0].onclick = function (e) {
			if (callback !== undefined && !e.currentTarget.classList.contains("noActive")) {
				callback(arrayIdSelectedCards);
			}
		}
	};

	this.stopSelect = function(){
		document.getElementById("choose-board").style.display = "none";
	};


	this.timerId = null;
	this.startTimer = function(intSecond){
		let realSecond = intSecond;
		let timer = document.getElementById("timer");

		function updateTimer(){
			let seconds = realSecond % 60;
			let minutes = (realSecond / 60) | 0;
			if (realSecond < 0 ){
				clearInterval(timerId);
				timerId = null;
				return;
			}
			timer.innerHTML = realSecond < 10 ? minutes+":0"+seconds :  minutes+":"+seconds;
			realSecond--;
		}

		updateTimer();
		timerId = setInterval(updateTimer, 1000);
	};

	this.stopTimer = function(){
		if (timerId !== null){
			let timer = document.getElementById("timer");
			timer.innerHTML = "0:00";
			clearInterval(timerId);
			timerId = null;
		}
	};

	let cardsCounter = document.getElementById("hand-counter");

	this.setHand = function(cards) {
		cardsCounter.innerHTML = cards.length;
		handBoard.innerHTML = "";
		for (let i = 0; i < cards.length; i++){
			handBoard.appendChild(getNewCardElem(cards[i]));
		}
	};

	// cards - Массив 6x3 карт в стеках [ [down, center, top], ... ] int id типы карт
	this.setStacks = function(stacks){
		let i = 0;
		for (let cardIds of stacks) {
			stacksParent[i].innerHTML = '';
			for(cardId of cardIds){
				//if (stacksParent[i].stackType === DATA_CARDS[cardId]) {
					stacksParent[i].stackType = DATA_CARDS[cardId];
					stacksParent[i].append(getNewCardElem(cardId));
					stacksParent[i].stackLevel = stacksParent[i].childElementCount;
					stacksParent[i].stackAction = stacksParent[i].lastElementChild.jsonOptions;
					//console.log("ACTION -> ", stacksParent[i].stackAction.levels[stacksParent[i].stackLevel - 1]);
					console.log("LEVEL -> ", stacksParent[i].stackLevel);
				/*} else if (stacksParent[i].stackLevel === 0){
					stacksParent[i].append(getNewCardElem(cardId));
					stacksParent[i].stackType = DATA_CARDS[cardId];
					stacksParent[i].stackLevel++;
					stacksParent[i].stackAction = stacksParent[i].lastElementChild.jsonOptions;
					console.log("ACTION -> ", stacksParent[i].stackAction.levels[stacksParent[i].stackLevel - 1]);
				} else if (stacksParent[i].stackLevel === 3 && stacksParent[i].stackType === DATA_CARDS[cardId]) {
					stacksParent[i].children[2] = getNewCardElem(cardId);
					stacksParent[i].stackAction = stacksParent[i].lastElementChild.jsonOptions;
					console.log("ACTION -> ", stacksParent[i].stackAction.levels[stacksParent[i].stackLevel - 1]);
				} else {
					stacksParent[i].innerHTML = '';
					stacksParent[i].append(getNewCardElem(cardId));
					stacksParent[i].stackLevel++;
					stacksParent[i].stackType = DATA_CARDS[cardId];
					stacksParent[i].stackAction = stacksParent[i].lastElementChild.jsonOptions;
					console.log("ACTION -> ", stacksParent[i].stackAction.levels[stacksParent[i].stackLevel - 1]);
				}*/
			}
			i++
		}
	};

	function getNewCardElem(i){
		let img = new Image();
		img.src = "src/cards/card"+((i|0)+1)+".jpg";
		img.cardId = i|0;
		img.jsonOptions = DATA_CARDS[i|0];
		console.log(img.jsonOptions);
		return img
	}

	{
		let i = 0;
		for (let stack of stacksParent) {
			stack.stackId = i++;
			stack.onclick = function(e){
				if(selectedHandCard !== null)
					programmingCallback(selectedHandCard.idInList, e.currentTarget.stackId);
			}
		}
	}
	let selectedHandCard = null;
	let programmingCallback = null;
	// callback принимает номер карты в руке и номер стека
	this.programming = function(callback) {
		selectedHandCard = null;
		programmingCallback = callback;
		let i = 0;
		for (let card of handBoard.children) {
			card.idInList = i++;
			card.onclick = function(e){
				if(selectedHandCard !== null) selectedHandCard.style.outline = '';
				selectedHandCard = e.currentTarget;
				selectedHandCard.style.outline = '2px solid yellow';
			}
		}
	};

	const higlightType = {Rotate: 0, Move: 1, Hook:3};

	let selectAttackCells = function (cellsArray, countKills, callback) {
		console.log(cellsArray);
		console.log(countKills);
	};

	let selectMoveCells = function (cellsArray, callback) {
		console.log(cellsArray);
	};

	let selectRotateCells = function (cellsArray, callback) {
		console.log(cellsArray);
	};

	// cellsArray[i] = {x:X, y:Y, higlight:/0, 1, 2/}
	// callback Возвращает id ячеек в массиве cellsArray, на которые кликнули
	this.actionStack = function (i) {
		let stacks = document.getElementsByClassName("stack");
		let stack = stacks[i];
		let actions = stack.jsonOptions;
		let level = stack.level;
		let functions = actions.levels[level];

		let targetCount = functions.targetCount;
		let move = functions.move;
		let attack = functions.attack;
		let rotate = functions.rotate;

		if (move.length !== 0) selectMoveCells(move);
		if (attack.length !== 0) selectAttackCells(move);
		if (rotate.length !== 0) selectRotateCells(move);

	};

	// cellsArray[i] = {x:X, y:Y, higlight:/0, 1, 2/}
	// callback Возвращает id ячеек в массиве cellsArray, на которые кликнули
	this.selectCells = function(cellsArray, callback){
		let players = document.getElementsByClassName()
		for (let i = 0; i < cellsArray.length; i++) {

		}
	}

	//Окно, отображающее поражение для текущей сессии
	this.defeat = function(){
		let defeatBlock = document.getElementById("win-or-defeat");
		defeatBlock.style.display = 'block'
		defeatBlock.src = "src/lose.mp4";
		defeatBlock.muted = "";
		//defeatBlock.play();
	};

	// Высветить сообщение поверх всего
	this.showMessage = function(text, color) { // make enum
		let messageBlock = document.getElementById("message");
		messageBlock.style.display = "inline-block";
		//messageBlock.style.background = "red"; //rgba(2,3,4,0.5);
		messageBlock.innerHTML = text;
	};

	// Скрыть сообщение
	this.hideMessge = function(){
		let messageBlock = document.getElementById("message");
		messageBlock.style.display = "none";
	};

	//Test
	/// players -- массив игроков, состоящее из Никнейма и его ID
	// let players = [{"Host", 0}, {"Bot", 1}];
	//
	// this.showPlayers = function(players){
	//
	// }(players)

	this.updateBombCounter = function(newVal){
		document.getElementById('hp-bomb').innerHTML = newVal
	}
	this.updateKillsCounter = function(newVal){
		document.getElementById('kills').innerHTML = newVal
	}


}
