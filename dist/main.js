(()=>{"use strict";class t{constructor(t,e){this.name=e,this.length=t,this.isSunk=!1,this.HP=t}hit=()=>{this.HP-=1,0===this.HP&&(this.isSunk=!0)}}class e{constructor(e){this.board=Array.from({length:10},(()=>Array(10).fill("water"))),this.carrier=new t(5,"Carrier"),this.battleship=new t(4,"Battleship"),this.destroyer=new t(3,"Destroyer"),this.submarine=new t(3,"Submarine"),this.patroller=new t(2,"Patrol Boat"),this.player=e}placeShips=(t,e,a)=>{const s=t,r=e.length,i=e.name;if("horizontal"===a){const t=s[0],e=s[1];this.board[t].fill(i,e,e+r)}else if("vertical"===a){const t=s[0],e=s[1],a=this.board.map((e=>e[t])).fill(i,e,e+r);let o=0;this.board.forEach((e=>{e[t]=a[o],o++}))}};recieveAttack=t=>{if("miss"!==this.board[t[0]][t[1]]&&"hit"!==this.board[t[0]][t[1]])if("water"===this.board[t[0]][t[1]])this.board[t[0]][t[1]]="miss";else{const e=this.board[t[0]][t[1]];this.board[t[0]][t[1]]="hit",this[Object.keys(this).find((t=>this[t].name===e))].hit(),this.checkIsGame()}};checkIsGame=()=>{!0===this.carrier.isSunk&&!0===this.battleship.isSunk&&!0===this.destroyer.isSunk&&!0===this.submarine.isSunk&&!0===this.patroller.isSunk&&this.endGame()};getAvailableMoves=()=>{const t=()=>{const e=[Math.floor(10*Math.random()),Math.floor(10*Math.random())];return"hit"===this.board[e[0]][e[1]]||"miss"===this.board[e[0]][e[1]]?t():e};return t()};placeShipsForAI=()=>{const t=()=>this.getAvailableMoves(),e=()=>1===Math.floor(2*Math.random())?"horizontal":"vertical";this.placeShips(t(),this.carrier,e()),this.placeShips(t(),this.battleship,e()),this.placeShips(t(),this.destroyer,e()),this.placeShips(t(),this.submarine,e()),this.placeShips(t(),this.patroller,e());const a=this.board.flat(1);if(17!==(()=>{let t=0;return a.forEach((e=>{"Carrier"!==e&&"Battleship"!==e&&"Destroyer"!==e&&"Submarine"!==e&&"Patrol Boat"!==e||t++})),t})())return this.board=Array.from({length:10},(()=>Array(10).fill("water"))),this.placeShipsForAI()};endGame=()=>{console.log(`${this.player}'s all ships are under water. GG`)}}class a{static computerAttacks=t=>{const e=t.board.getAvailableMoves();t.board.recieveAttack(e)};static playerAttacks=(t,e)=>{t.board.recieveAttack(e)};constructor(t){this.name=t,this.board=new e(t)}}(class{static coordinatesWithIDs={};static initGame=t=>{this.createGameboards();const e=this.createPlayers(t),a=e.human,s=e.AI;s.board.placeShipsForAI(),this.renderGameboardForPlayer(a),this.renderGameboardForAI(s),this.initEventListenerForSquares(a,s)};static initEventListenerForSquares=(t,e)=>{document.querySelectorAll(".AI-square").forEach((a=>a.addEventListener("click",(()=>{if(""!==a.textContent)return;const s=a.dataset.id,r=this.findCoordinates(s);this.playOneRoundForEach(t,e,r)}))))};static createGameboards=()=>{const t=document.querySelector(".player-board"),e=document.querySelector(".AI-board");for(let a=9;a>=0;a--)for(let s=0;s<=9;s++){const r=document.createElement("div"),i=document.createElement("div");r.classList.add("player-square"),i.classList.add("AI-square"),r.classList.add("square"),i.classList.add("square"),r.dataset.id=`player-[${a}, ${s}]`,i.dataset.id=`AI-[${a}, ${s}]`,this.coordinatesWithIDs[`player-[${a}, ${s}]`]=[a,s],this.coordinatesWithIDs[`AI-[${a}, ${s}]`]=[a,s],t.appendChild(r),e.appendChild(i)}};static createPlayers=t=>({human:new a(t),AI:new a("AI")});static renderGameboardForPlayer=t=>{const e=t.board.board;document.querySelectorAll(".player-square").forEach((t=>{const a=t.dataset.id,s=this.findCoordinates(a);switch(e[s[0]][s[1]]){case"water":break;case"Carrier":case"Battleship":case"Destroyer":case"Submarine":case"Patrol Boat":case"hit":case"miss":t.textContent=e[s[0]][s[1]];break;default:console.log("error")}}))};static renderGameboardForAI=t=>{const e=t.board.board;document.querySelectorAll(".AI-square").forEach((t=>{const a=t.dataset.id,s=this.findCoordinates(a);switch(e[s[0]][s[1]]){case"water":case"Carrier":case"Battleship":case"Destroyer":case"Submarine":case"Patrol Boat":break;case"hit":case"miss":t.textContent=e[s[0]][s[1]];break;default:console.log("error")}}))};static findCoordinates=t=>this.coordinatesWithIDs[t];static findID=t=>Object.keys(this.coordinatesWithIDs).find((e=>this.coordinatesWithIDs[e]===t));static playOneRoundForEach=(t,e,s)=>{a.playerAttacks(e,s),this.renderGameboardForAI(e),a.computerAttacks(t),this.renderGameboardForPlayer(t)}}).initGame("name")})();