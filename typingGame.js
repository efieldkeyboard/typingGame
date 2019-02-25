///////////////////////////////////////////////////////////////
//      ABOUT

//MODULAR pattern, wrapping variables in IIFEs
//4 LINES of text make a DECK[] (set size in line_pool.initDeck)
//the DECK marches toward the top of the screen
//keystrokes call a comparison against the first character of
// the first LINE of the DECK
//successful 'hits' remove that character from the LINE and
// collect it into a PEW_POOL (pew pew pew!)
//PEWs are animated to spin off the screen randomly
//When a LINE is completed, a QUIZ is generated
// with 4 ANSWERS. ANSWERS are designated by a symbol
// that must be typed to select it. the correct answer will
// unleash your powerAttack knocking the DECK down.
//When the DECK reaches the top, game over.
//If you can complete 4 levels, you win.

//typing speed; more chances to score before you hit the top
//correct answer; drops the DECK, giving more time
//accuracy; improves score and powerAttack (the amount the
// DECK drops with a correct answer
//accuracy + correct; score/powerAttack multiplier (x2)


///////////////////////////////////////////////////////////////
//		TO DO

//award bonus points for extra space left after winning.
// currently getting more points for failing quizes
//find level_5 gif for victory background. states 'you won'
//fill json with 'about me' info, and why i'm a good candidate.
//more gifs for levels
//remove completed line from pool? keys are attached early and
// would not match if the array was altered, unless there
// were a master and a copy. problem because of Deck
//add clear comments
//fade right edge. so boss is not on top of text.
//add sound?
//there is a length limit for definitions, and LINES (based on
// fighter moving forward). note it for JSON
//animation for superpower when finding new animation
//not sure how likely, but possible to type the last character,
// see it enter Pew and before the quiz comes up, game over.
// can still select quiz answer.
//allow updating the json from an opening screen -if node
//notes in compareHelper
//quiz not working in IE
//on quiz selection, avatar is being animated.

//*******noServer******* tags in place to omit node server


///////////////////////////////////////////////////////////////
//		GLOBALS

var canvas,
    ctx,
    pew_pool = [];


//////////////////////////////////////////////////////////////
//		ONLOAD

window.onload = function(){
 //insure screen size is big enough for canvas.
 //html page confirmed JS before requesting this script.
 if(screenCheck()) return;

 //set up the canvas and color scheme
 canvas = document.getElementById('gameCanvas');
 ctx = canvas.getContext('2d');
 ctx.shadowColor = 'rgb(0, 155, 35)';
 ctx.strokeStyle = 'rgb(0, 255, 43)';
  
 //TODO loading helper until welcome_HELPER is called

 //request data for LINEs from the server, stored in a JSON file
 //start game After response
 // *******noServer********request_HELPER('/line_pool.JSON', initGame);

function initGame(){
 //store response LINEs in an object
  // *******noServer********line_pool.initPool(JSON.parse(xhr.responseText));

 //keypress listener does it all. start game, typing, choice selection
  document.onkeypress = function(e){
   if(gameManager.getState() === 1){
    gameManager.newGame();
   } else if(gameManager.getState() === 2){
    deck.compare(event.key || String.fromCharCode(e.charCode));
   } else if(gameManager.getState() === 3){
    quiz.take(event.key || String.fromCharCode(e.charCode));
   }
  };
 //display opening screen
  welcome_HELPER();
};

initGame(); //noServer
}();




var line_pool = (function(){
 //object to contain lines[] and symbols[]
 //*****noServer******* var pool = {};
 var pool = {"lines": [
{"str": "<element attribute=\"value\">content</element>",
"def": "html syntax"},
{"str": "document.getElementById(\"name\").childNodes[0].nodeValue;",
"def": "== \"inner HTML\""},
{"str": "name.addEventListener(\"click\", function(){...});",
"def": "handler"},
{"str": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>",
"def": "XML prolog"},
{"str": "<root xmlns=\"http://www.unique.com/\">",
"def": "XML root"},
{"str": "function(){if(xhr.readyState == 4 && xhr.status == 200)",
"def": "xhr.onreadystatechange"},
{"str": "name.style.cssText = 'display: block; width: 100%;'",
"def": "== \"name.setAttribute\""},
{"str": "var filteredArr = myArr.filter(myFun));",
"def": "== \"Array.prototype.filter(cb)\""},
{"str": "(x,y) => {x + y}; -OR- x => x + 3;",
"def": "'arrow function' syntax"}
],
"symbols": [
"~", "@", "#", "$", "%", "&", "+", "!", "|", "\\", "/", "?"
]};;

 
 return {
   /* noServer
  initPool: function(resTxt){
 //store response from server into local object
   pool = resTxt;
  },
  */
  initDeck: function(){
 //set size, location, speed of DECK
 //size -1 determines the number of levels in the game
   for(var i = 0; i < 5; i++){
    deck.add(120, 600, i);
   };
  },
  getStr: function(indx){
   return pool.lines[indx].str;
  },
  getPool: function(){
   return pool.lines;
  },
  getSym: function(){
   return pool.symbols;
  },
  getLength: function(){
   return pool.lines.length;
  }
 };
})();


//////////////////////////////////////////////////////////////
//      GAME MANAGER

var gameManager = (function(){
 //number to track game state. checked with every keypress
 //states;
 // 0-paused, no input, no frame refresh (only PEWs)
 // 1-opening/'game over' screen. input -> gameManager.newGame
 // 2-deck rolling. standard gameplay. input -> deck.compare
 // 3-quiz display. input -> quiz.take
 // 4-powerAttack display. no input.
 var state = 1;
 var intervalId = null;
 
 return {
  getState: function(){
   return state;
  },
  setState: function(s){
  //check for type number?
   state = s;
  },
  newGame: function(){
 //reset all variables/level/score/DECK[]/pew/background
   scoreKeeper.clear();
   scoreKeeper.newLevel();
   deck.reset();
   pew_pool = [];
 //make a new DECK and start gameLoop
   line_pool.initDeck();
   state = 2;
   intervalId = setInterval(gameLoop, 1000/30);
  },
  endGame: function(){
 //add points and bonuses. display result. end gameLoop
   scoreKeeper.endLevel();
   ctx.textAlign = 'center';
   ctx.fillText("Game Over", 400, 150);
   ctx.fillText("End Score: " + scoreKeeper.getScore(), 400, 200);
   ctx.fillText("(press any key to start again)", 400, 580);
   clearInterval(intervalId);
   state = 0;
 //wrapped to prevent fast typing from resetting a new game
   setTimeout(function(){state = 1;}, 2000); //TODO will we get an error if typing during this timout?
  }
 };
})();


//////////////////////////////////////////////////////////////
//		GAME LOOP

function gameLoop(){
 var state = gameManager.getState();
 //clear canvas. default styles
 cleanSlate();
  
 //if DECK reaches the top of the screen Or reached level 5
 // end the game loop and display 'game over'/final score
 //**changing number of levels, also change scoreKeeper.endLevel
 if(deck.getY() < 85 || scoreKeeper.getLevel() > 4){
  gameManager.endGame();
  return;
 }

 //state: deck rolling/standard gameplay
 if(state === 2){
 //progress the DECK towards the top of the screen and display
 // LINEs, score, and avatars
  scoreKeeper.draw();
  deck.march();
  deck.draw();
  fighter.draw(deck.getX() - 100, deck.getY() - 100, 100);
  boss.draw(700, deck.getY() - 180, 120);
  
 //state: quiz display -paused for 1 second after making the quiz
 } else if(state === 3 || state === 0){
  quiz.draw();
  
 //state: powerAttack display
 } else if(state === 4){ //*****************************set to 4 in quiz.take/success
 
 
 
 //lower the DECK based on score Or nearness to top. Clear quiz.success when power is gone. need a minimum power amount for 1 iteration of animation
  powerAttack.callPower();
  deck.draw();
 //display power animation
  fighter.draw(300, 200, 200 - powerAttack.getPower());
 }

 //move and display PEWs -based on typing speed
 speedometer.setSpeed();

 ctx.shadowBlur = 0;
 for(var i = pew_pool.length - 1; i >= 0; i--){
  pew_pool[i].wee();
  pewGone(i);
 }
}


//////////////////////////////////////////////////////////////
//		HELPERS

function screenCheck(){
 //if screen size is under 800px, display error message
 // it's a typing game - nix mobile
 if(window.innerWidth < 800 || document.documentElement.clientWidth < 800 || document.body.clientWidth < 800 || document.width < 800 || screen.width < 800 || window.width < 800){
  var cover = document.createElement('div');
  cover.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100vh; background: white;';
  cover.innerHTML = 'oops -Please revisit with a keyboard and/or a larger screen.';
  document.body.appendChild(cover);
  return true;
 }
 return false;
}


function request_HELPER(fname, cb){
 var xhr = new XMLHttpRequest;
 
 xhr.onreadystatechange = function(){
  if(xhr.readyState == 4 && xhr.status == 200){
   cb(xhr);
  }
 };
 xhr.open('GET', fname, true);
 xhr.send();
}


function welcome_HELPER(){
 cleanSlate();
 ctx.textAlign = 'center';
 ctx.fillText("Welcome Future Employer", 400, 200);
 ctx.fillText("(press any key to begin)", 400, 580);
}


function cleanSlate(){
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = '30px Arial';
  ctx.fillStyle = 'rgb(0, 255, 43)';
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 10;
}


function randomInt_HELPER(min, max){
//inclusive
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


///////////////////////////////////////////////////////////////
//      SCOREKEEPER

var scoreKeeper = (function(){
  var round = 0;
  var score = 0;
  var level = 0;
 //bool to track typing an entire LINE without a mistake
  var flawless = true;

  return{
    increment: function(){ //would be better to check for accuracy inside this. currently calling deck.compare>compare_HELPER
      round += 100 + (level * 10);
    },
    decrement: function(){
      if(round > 200) round -= 200;
    },
    draw: function(){
    // font size set in cleanSlate
      ctx.textAlign = 'end';
      ctx.fillText('Score: ' + score, 780, 30); // TODO 1st after reset ctx.globals
      if(flawless){
       ctx.textAlign = 'center';
       ctx.fillText('x2 Bonus', 400, 30);
      }
      ctx.textAlign = 'start'; // this sets alignment back to default for the LINE display
      ctx.fillText('Level ' + level + ': ' + round, 20, 30); // TODO display as glowing ball
      ctx.beginPath();
      ctx.moveTo(0, 40);
      ctx.lineTo(800, 40);
      ctx.stroke();
    },
    endLevel: function(){
      if(flawless) score += round;
      if(level > 4) score += score; //beating the game (level 4)
      score += round;
      round = 0;
      flawless = true;
    },
    miss: function(){
      flawless = false;
    },
    isFlawless: function(){
      return flawless;
    },
    getRound: function(){
      return round;
    },
    getScore: function(){
      return score;
    },
    getLevel: function(){
      return level; //called by deck.march and checked for opening screen
    },
    newLevel: function(){
      level++;
      //removed 'assets'
      document.getElementById('outerEdge').style.backgroundImage = 'url("level_' + level + '.gif")';
    },
    clear: function(){
      round = 0;
      score = 0;
      level = 0;
      flawless = true;
    }
  }
})();


//////////////////////////////////////////////////////////////
//		FIGHTER

var fighter = (function(){
 //x,y coords for sprite map. Map has 5 images for each of 7
 // animations. All sprites width/height set at 100px/100px
 var x = 0;
 var y = 600;
 var frameCounter = 0;
 var imgFighter = new Image();
 //removed 'assets' from path
 imgFighter.src = "greenFighter.png";

 return{
  draw: function(dx, dy, size){
 //draw each sprite 3 times before moving to the next
  if(frameCounter > 1){
   if(x > 300){
    x = 0;
 //powerAttack animation (y==600) is adjusted indepentently
    if(y !== 600){
     y = 0;
    }
   } else {
    x += 100;
   }
   frameCounter = 0;
  } else {
   frameCounter++;
  }
   ctx.globalAlpha = 1;
   ctx.drawImage(imgFighter, x, y, 100, 100, dx, dy, size, size);
  },
  adjustY: function(){
   y = randomInt_HELPER(1, 4) * 100;
   x = 0;
   frameCounter = 0;
  },
  miss: function(){
   y = 500;
   frameCounter = 0;
  },
  setAnimation: function(){
   y = 600;
   frameCounter = 0;
  }
 }
})();


var powerAttack = (function(){
  var power = 0;

  return{
    setPower: function(){
      power = ((scoreKeeper.getRound()) / 20000) * 200 >
              canvas.height - deck.getY() - 20 ?
              canvas.height - deck.getY() - 20 :
              ((scoreKeeper.getRound()) / 20000) * 200
    },
    callPower: function(){
      if(power > 5){
        deck.drop(power/4);
        power -= power/4;
      } else {
      gameManager.setState(2);
      }
    },
    getPower: function(){
      return power;
    }
  }
})();


//////////////////////////////////////////////////////////////
//		BOSS

var boss = (function(){
  var x = 0;
  var y = 201;
  var z = 0;
  var imgBoss = new Image();
  //removed 'assets' from path
  imgBoss.src = "greenBoss.png";

  return{
    draw: function(dx, dy, size){
    if(z > 1){
      if(x > 300){
        x = 0;
        if(y !== 600){
         y = 0;
        }
      } else {
        x += 100;
      }
      z = 0;
    } else {
      z++;
    }
      ctx.globalAlpha = 1;
      ctx.drawImage(imgBoss, x, y, 100, 100, dx, dy, size, size);
    },
    adjustY: function(){
      y = randomInt_HELPER(1, 4) * 100;  //was 1, 4 or 1, 2
      z = 0;
    },
    miss: function(){
      y = 500;
      z = 0;
    },
    setAnimation: function(){
      y = 600;
      z = 0;
    }
  }
})();


//////////////////////////////////////////////////////////////
//		QUIZ

function Answer(){
  this.definition = "";
  this.symbol = "";
  this.order = 0;
}


Answer.prototype.init = function(k, a, aDef, aSym, i){
// set the variables
  var rand = randomInt_HELPER(0, aSym.length - 1);
  this.order = randomInt_HELPER(10, 99);
  this.definition = aDef[k].def; // if JSON file is too short, this will report undefined and recursively the whole quiz collapses
  this.symbol = aSym[rand];

// do a little parsing
// copy the referenced array for answers and definitions
// remove the used item from each array
  var tempDefArr = aDef.slice();
  tempDefArr.splice(k, 1);
  var tempSymArr = aSym.slice();
  tempSymArr.splice(rand, 1);

// recursive iteration through quiz Answers
// allows passing of altered arrays (to prevent multiple same answers)
  if(i + 1 < a.length){
    a[i + 1].init(randomInt_HELPER(0, tempDefArr.length - 2), a, tempDefArr, tempSymArr, i + 1);
  }
}


var quiz = (function(){
  var quizArr = [];
  var correctAnswer = '';
  var finishedLine = '';

// length of quiz is 4 answers
  for(var j = 0; j < 4; j++){
    quizArr[j] = new Answer();
  }

  return{
    make: function(){
      gameManager.setState(0);
      quizArr[0].init(deck.getKey(), quizArr, line_pool.getPool(), line_pool.getSym(), 0);
      correctAnswer = quizArr[0].symbol;
      quizArr.sort((a,b) => a.order - b.order); // pulled the correct answer first, have to shuffle it.
      finishedLine = line_pool.getStr(deck.getKey());
      // another 'useless' safety measure for uber fast typers
      setTimeout(function(){
       gameManager.setState(3);
      }, 1000);
    },
    draw: function(){
     ctx.font = '80px Arial';
     ctx.textAlign = 'center';
     ctx.fillText('QUIZ', 400, 80);
  
     ctx.font = '16px Arial';
     ctx.fillText(finishedLine, 400, 575);
     ctx.fillText('Type the symbol to select the matching definition for:', 400, 550);

     ctx.font = '42px Arial';
     ctx.textAlign = 'end';
     for(var i = 0; i < quizArr.length; i++){
       ctx.fillText(quizArr[i].symbol + '   ', 120, 180 + (i * 65));
     }

     ctx.font = '32px Arial';
     ctx.textAlign = 'start';
     for(var i = 0; i < quizArr.length; i++){
       ctx.fillText(quizArr[i].definition, 120, 180 + (i * 65));
     }
    },
    take: function(e){
     powerAttack.setPower();
 //delete the completed LINE
     deck.complete()
     if(e === correctAnswer){
 //set powerAttack animation
 //set state to pause during animation
 //**state will return to standard when power is spent
      fighter.setAnimation(); //TODO set animation to repeat the last few frames of powerattack
      scoreKeeper.newLevel();
      gameManager.setState(4);
     } else {
 //if quiz was failed
 //add a new LINE to deck
 //return state to deck marching/standard gameplay
      deck.add(deck.getX(deck.getSize() - 1), deck.getY(deck.getSize() - 1) - 12, 1);
      gameManager.setState(2);
      //TODO animate enemy laughing
     }
     scoreKeeper.endLevel();
    }
  }
})();


/////////////////////////////////////////////////////////////
//		LINE & DECK

function Line(x, y){
  this.key = randomInt_HELPER(0, line_pool.getLength() - 1);//json file object length
  this.x = x;
  this.y = y;
  this.string = line_pool.getStr(this.key);
}


var deck = (function(){
  var lineArr = [];
  var spacer = 60;

  return{
    reset: function(){
     lineArr = [];
    },
    compare: function(c){
    // helper for neatness
    // referenced LINE object can be modified. is safe.
      compare_HELPER(lineArr[0], c);
    },
    add: function(x, y, i){
      lineArr.push(new Line(x + (spacer * i), y + (spacer * i) - (i * i * 3)));
    // (i * i * 3) creates a decreasing vertical distance between lines
    //size and alpha also adjusting in deck.draw
    },
    complete: function(){
    // move LINES into their parents positions then delete
      for(var i = 0; i < lineArr.length; i++){
       lineArr[i].x -= spacer;
      }
      for(var i = lineArr.length - 1; i > 0; i--){
       lineArr[i].y = lineArr[i - 1].y;
      }
      lineArr.splice(0, 1);
    },
    march: function(){
      var orders = 0.1 + (0.1 * scoreKeeper.getLevel());
      for(var i = 0; i < lineArr.length; i++){
        lineArr[i].y -= orders;
      }
    },
    draw: function(){
    //reduce size and alpha of descending LINEs
      for(var i = 0; i < lineArr.length; i++){
        ctx.globalAlpha = 1 - (i/(lineArr.length -1)); // 4 of the 5 will be visible
        //set font size and style, was 30 and *5
        //IMPORTANT need to match any changes in pew settings
        ctx.font = 60 - (i * 5) + 'px Arial';
        ctx.fillText(lineArr[i].string, lineArr[i].x, lineArr[i].y);
      }
    },
    drop: function(pow){
      for(var i = 0; i < lineArr.length; i++){
        lineArr[i].y += pow;
      }
    },
    getX: function(idx){
      return lineArr[idx || 0].x;
    },
    getY: function(idx){
      return lineArr[idx || 0].y;
    },
    getKey: function(idx){
      return lineArr[idx || 0].key;
    },
    getSize: function(){
      return lineArr.length;
    }
  };
})();


function compare_HELPER(li, c){
//TODO if at waiting screen(but they're still typing), just return
// 'useless' safety measure
  if(li.string[0] === undefined) {console.log('throw compare_HELPER'); return;}

//why is this checked in this order? is (c === li.string[0]) not ok?
  if(c !== li.string[0]){
    scoreKeeper.decrement();
    scoreKeeper.miss(); //deny bonus for flawless typing
    fighter.miss(); //move sprite map to miss animation
    if(li.x > 100) li.x -= 50; //avatar is pushed backwards
  } else {
    annihilate(li.string[0], li.x, li.y, "red"); //copy first char into global pew_pool
    li.string = li.string.slice(1); //remove the first char from the LINE
    scoreKeeper.increment();
    fighter.adjustY(); //move sprite map to random animation
    li.x += 10; //typewriter-esque centering, avatar is pushed forward
  }

  if(li.string.length < 1) quiz.make();
}


//////////////////////////////////////////////////////////////
//		PEW CLASS

function pew(c, x, y, tx, ty, tz, color){
  this.char = c;
  this.x = x;
  this.y = y;
  this.tx = tx;
  this.ty = ty;
  this.tz = tz;
  this.counter = 0;
  this.color = color;
}


pew.prototype.wee = function(){
  this.x += (this.tx + this.counter) * ((speedometer.speed())
    * 2);
  this.y += this.ty * (speedometer.speed());
  ctx.font = this.tz > 0 ?
    (60 + (Math.pow(1 + (this.counter * 10), 2))) + 'px Arial' : //was 30 +...
    (60 - (Math.pow(1 + (this.counter * 3 ), 2))) + 'px Arial';
  ctx.fillStyle =
    'hsl(hue, 80%, 50%)'.replace('hue', (50 * this.counter));
  ctx.globalAlpha = this.tz > 0 ?
    1 - (this.counter/1.5) : 1 - ((this.counter/2)/1.5);
//  ctx.fillStyle = this.color;
  ctx.fillText(this.char, this.x, this.y);
  this.counter += 0.02; //was 0.02
}


function annihilate(c, x, y, color){
  var rand = randomInt_HELPER(0, 180);
  var tz = rand % 2 > 0 ? -1 : 1;
  pew_pool.push(new pew(c, x, y, (Math.cos(rand)), (Math.sin(rand)), tz, color));
}


function pewGone(i){
  if(pew_pool[i].counter > 3){ //adjust if font size is adjusted, was 1.5, or just adjust the counter increment
    pew_pool.splice(i, 1);
  }
}


var speedometer = (function(){
  var x = 1;

  return{
    setSpeed: function(){
      x = ((pew_pool.length / 30) * 4) + 1;
    },
    speed: function(){
      return x;
    }
  };
})();


/////////////////////////////////////////////////////////////

// noServer









