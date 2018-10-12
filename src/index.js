import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Label(props) {
  return (
    <div className="label">
      {props.value}
    </div>
  );
}

function Square(props) {
  if (props.value == "X") {
    var id = "undamaged";
  }
  else if (props.value == "O" || props.value == "-") {
    var id = "damaged";
  }

  if (props.value == "•") {
    var valueToDisplay = "•";
  }
  else if (props.value == "-") {
    var valueToDisplay = "X";
  }
  else {
    var valueToDisplay = "";
  }

	return (
		<button className="square" id={id} onClick={props.onClick}>
			{valueToDisplay}
		</button>
	);
}

class ShipConfig extends React.Component {
  constructor(props) {
    super(props);
    this.state = {type: props.type, position: props.position};

    this.handleTypeChange = this.handleTypeChange.bind(this);
    this.handlePositionChange = this.handlePositionChange.bind(this);
  }

  handleTypeChange(event) {
    this.setState({type: event.target.value});
    this.props.onTypeChange(event.target.value);
  }

  handlePositionChange(event) {
    this.setState({position: event.target.value});
    this.props.onPositionChange(event.target.value);
  }

  render() {
    return (
      <div class="shipConfig">
        <h3>Setup your battlefield</h3>
        <div id="controlBody">
          <form>
            <p classname="childHeading"><b>Select type of ship:</b></p>
            <select value={this.state.type} onChange={this.handleTypeChange}>
              <option value="0">Choose ship size</option>
              <option value="1">Carrier (1 cell)</option>
              <option value="2">Battleship (2 cells)</option>
              <option value="3">Cruiser (3 cells)</option>
              <option value="4">Submarine (4 cells)</option>
            </select>
            <select value={this.state.position} onChange={this.handlePositionChange}>
              <option value="h">Horizontal</option>
              <option value="v">Vertical</option>
            </select>
          </form>
          <p className="childHeading"><b>Number of ships left:</b></p>
          <p>Carriers: {this.props.shipsLeft[0]}</p>
          <p>Battleships: {this.props.shipsLeft[1]}</p>
          <p>Cruisers: {this.props.shipsLeft[2]}</p>
          <p>Submarines: {this.props.shipsLeft[3]}</p>
          <button onClick={this.props.undo}>Undo</button>
          <button onClick={this.props.done}>Done</button>
        </div>
      </div>
    );
  }
}

class Board extends React.Component {
  constructor(props) {
    super(props);
  }

  renderSquare(i, j) {
    return (
      <Square 
        value={this.props.grid[i][j]}
        onClick={() => this.props.onClick(i,j)}
      />
    );
  }

  renderRowOfSquares(i) {
    var row = []

    for (var j = 0; j < 10; j++) {
      row.push(this.renderSquare(i, j));
    }

    return row;
  }

  //renders the numders above the board
  renderNumbers() {
    var nums = []
    nums.push(<Label value=""/>);

    for (var i = 1; i <= 10; i++) {
      nums.push(<Label value={i}/>);
    }

    return nums;
  }

  render() {
    return (
      <div>
        <div className="board-row">
          {this.renderNumbers()}
        </div>
        <div className="board-row">
          <Label value="A"/>
          {this.renderRowOfSquares(0)}
        </div>
        <div className="board-row">
          <Label value="B"/>
          {this.renderRowOfSquares(1)}
        </div>
        <div className="board-row">
          <Label value="C"/>
          {this.renderRowOfSquares(2)}
        </div>
        <div className="board-row">
          <Label value="D"/>
          {this.renderRowOfSquares(3)}
        </div>
        <div className="board-row">
          <Label value="E"/>
          {this.renderRowOfSquares(4)}
        </div>
        <div className="board-row">
          <Label value="F"/>
          {this.renderRowOfSquares(5)}
        </div>
        <div className="board-row">
          <Label value="G"/>
          {this.renderRowOfSquares(6)}
        </div>
        <div className="board-row">
          <Label value="H"/>
          {this.renderRowOfSquares(7)}
        </div>
        <div className="board-row">
          <Label value="I"/>
          {this.renderRowOfSquares(8)}
        </div>
        <div className="board-row">
          <Label value="J"/>
          {this.renderRowOfSquares(9)}
        </div>
      </div>
    );
  }
}

class Cell {
  constructor(row, column, value) {
    this.row = row;
    this.column = column;
    this.value = value
  }
}

class Ship {
  constructor(row, column, size, position) {
    this.parts = [];
    if (position == "h") {
      for (let j = column; j < column + size; j++) {
        this.parts.push(new Cell(row, j, "X"));
      }
    }
    else {
      for (let i = row; i < row + size; i++) {
        this.parts.push(new Cell(i, column, "X"));
      }
    }
    this.size = size;
    this.position = position;
  }
}

class Player {
  constructor(id) {
    this.id = id;
    this.ships = [];
    this.hits = [];
  }
}

class Game extends React.Component {
  constructor(props) {
  	super(props);
  	this.state = {
      //Battle Ship vars
      players: [new Player(0), new Player(1)],
      grids: [Array(10).fill(Array(10).fill(null)), Array(10).fill(Array(10).fill(null))],
      playerCounter: 0,
      gameStage: "gridSetup",
      inTransition: false,

      //gridSetup state variables
      shipSizeSelected: "1",
      shipPositionSelected: "h",
      shipsLeft: [4, 3, 2, 1],
      lastAddedShip: {
        row: -1,
        column: -1,
      },

      //ongoingBattle state variables
      playerMadeHisMove: false,
  	}

    this.changeShipSize = this.changeShipSize.bind(this);
    this.changeShipPosition = this.changeShipPosition.bind(this);
  }

  //BATTLE SHIP FUNCTIONS
  changeShipSize(size) {
    this.setState({shipSizeSelected: size});
  }

  changeShipPosition(position) {
    this.setState({shipPositionSelected: position});
  } 

  newHandleClick(row, column) {
    if (this.state.gameStage == "gridSetup") {
      this.addNewShip(row, column);
    } else {
      this.addHit(row, column);
    }
  }

  addHit(row, column) {
    if (!this.state.playerMadeHisMove && !this.hitExists(row, column)) {

      //check if the missile hits any of the ships
      let successfulHit = false;
      let shipDestroyed = false;
      for (let i = 0; i < this.state.players[(this.state.playerCounter+1)%2].ships.length; i++) {
        let ship = this.state.players[(this.state.playerCounter+1)%2].ships[i];

        for (let j = 0; j < ship.parts.length; j++) {
          let part = ship.parts[j];

          //player's missile hit one of the oponent's ships
          if (part.row == row && part.column == column && part.value == "X") {
            part.value = "O";
            successfulHit = true;
            shipDestroyed = this.isShipDestroyed(ship);
          }
        }
      }

      //add hit to player's array
      if (successfulHit) {
        if (shipDestroyed) {
          this.state.players[this.state.playerCounter%2].hits.push(new Cell(row, column, "-"));
        }
        else {
          this.state.players[this.state.playerCounter%2].hits.push(new Cell(row, column, "O"));
        }

        this.setState({
          grids: this.updateSquares(),
        })
      }
      else {
        this.state.players[this.state.playerCounter%2].hits.push(new Cell(row, column, "•"));
        this.setState({
          grids: this.updateSquares(),
          playerMadeHisMove: true,
        })
      }
    }
  }

  hitExists(row, column) {
    for (let i = 0; i < this.state.players[(this.state.playerCounter)%2].hits.length; i++) {
      const hit = this.state.players[(this.state.playerCounter)%2].hits[i];
        
      if (hit.row == row && hit.column == column) {
        return true;
      }
    }

    return false;
  }

  isShipDestroyed(ship) {
    //check if the whole ship is destroyed
    for (let i = 0; i < ship.parts.length; i++) {
      if (ship.parts[i].value != "O") {
        return false;
      }
    }

    //mark each ship part as destroyed
    for (let i = 0; i < ship.parts.length; i++) {
      ship.parts[i].value = "-";

      //update player's hits
      for (let j = 0; j < this.state.players[this.state.playerCounter%2].hits.length; j++) {
        if (this.state.players[this.state.playerCounter%2].hits[j].row == ship.parts[i].row && 
          this.state.players[this.state.playerCounter%2].hits[j].column == ship.parts[i].column) {
            this.state.players[this.state.playerCounter%2].hits[j].value = "-";
        }
      }
    }
    return true;
  }

  addNewShip(row, column) {
    const size = parseInt(this.state.shipSizeSelected);
    const position = this.state.shipPositionSelected;

    //check out of bounds
    //check intersection with other ships
    //check no ships around
    //check the number of ships of this kind
    if (this.state.shipsLeft[size - 1] == 0) {
      alert("Cannot place any more ships of this kind on the grid!");
    }
    else if (this.isShipLocationValid(row, column, size, position)) {
      this.state.players[this.state.playerCounter%2].ships.push(new Ship(row, column, size, position));
      this.state.shipsLeft[size - 1]--;
      this.state.lastAddedShip.row = row;
      this.state.lastAddedShip.column = column;
    }
    else {
      alert("Invalid position. Choose a different cell");
    }

    const newGrids = this.updateSquares();
    this.setState({grids: newGrids});
  }

  isShipLocationValid(row, column, size, position) {
    //check whether the new ship is not out of bounds
    if ((position == "h" && (column + size - 1) >= 10) || (position == "v" && (row + size - 1) >= 10)) {
      return false;
    }

    //check if the new ship intersects any of the existing ships
    const ships = this.state.players[this.state.playerCounter%2].ships;
    for (let i = 0; i < ships.length; i++) {
      for (let j = 0; j < ships[i].parts.length; j++) {
        const part = ships[i].parts[j];

        if (position == "h") {
          if (position == "h" && part.row >= row - 1 && part.row <= row + 1 && part.column >= column - 1 && part.column <= column + size) {
            return false;
          }
        }
        else {
          if (part.row >= row - 1 && part.row <= row + size && part.column >= column - 1 && part.column <= column + 1) {
            return false;
          }
        }
      }
    }

    return true;
  }

  updateSquares() {
    //PLAYER'S GRID
    let playersSquares = this.getGridCopy(this.state.playerCounter%2);
    //empty the grid
    for (let i = 0; i < 10; i ++) {
      for (let j = 0; j < 10; j++) {
        playersSquares[i][j] = null;
      }
    }
    //Display player's ships
    for (let i = 0; i < this.state.players[this.state.playerCounter%2].ships.length; i++) {
      const ship = this.state.players[this.state.playerCounter%2].ships[i];
      for (let j = 0; j < ship.parts.length; j++) {
        const part = ship.parts[j];
        playersSquares[part.row][part.column] = part.value;
      }
    }
    //Display opponents missed hits
    for (let i = 0; i < this.state.players[(this.state.playerCounter+1)%2].hits.length; i++) {
      const hit = this.state.players[(this.state.playerCounter+1)%2].hits[i];
      playersSquares[hit.row][hit.column] = hit.value;
    }


    //OPPONENT'S GRID
    let oponentsSquares = this.getGridCopy((this.state.playerCounter+1)%2);
    //empty the grid
    for (let i = 0; i < 10; i ++) {
      for (let j = 0; j < 10; j++) {
        oponentsSquares[i][j] = null;
      }
    }
    if (this.state.gameStage == "ongoingBattle") {
      //Display only the damaged parts of the ship
      for (let i = 0; i < this.state.players[(this.state.playerCounter+1)%2].ships.length; i++) {
        const ship = this.state.players[(this.state.playerCounter+1)%2].ships[i];
        for (let j = 0; j < ship.parts.length; j++) {
          const part = ship.parts[j];
          if (part.value == "O") {
            oponentsSquares[part.row][part.column] = part.value;
          }
        }
      }
      //Display player's missed hits
      for (let i = 0; i < this.state.players[this.state.playerCounter%2].hits.length; i++) {
        const hit = this.state.players[this.state.playerCounter%2].hits[i];
        oponentsSquares[hit.row][hit.column] = hit.value;
      }
    }

    let newGrids = []
    newGrids[this.state.playerCounter%2] = playersSquares;
    newGrids[(this.state.playerCounter+1)%2] = oponentsSquares;
    return newGrids;
  }

  getGridCopy(i) {
    let grid = [];
    for (let counter = 0; counter < 10; counter++) {
      grid.push(this.state.grids[i][counter].slice());
    }

    return grid;
  }

  undo() {
    if (this.state.lastAddedShip.row != -1) {
      let newShipsArray = [];
      let deletedShipSize = 0;

      const ships = this.state.players[this.state.playerCounter%2].ships;
      for (let i = 0; i < ships.length; i++) {
        //copy all ships except for the one that was added last
        if (ships[i].parts[0].row != this.state.lastAddedShip.row || ships[i].parts[0].column != this.state.lastAddedShip.column) {
          newShipsArray.push(ships[i]);
        }
        //record the size of the last added ship
        else {
          deletedShipSize = ships[i].parts.length;
        }
      }

      //update players array of ships
      this.state.players[this.state.playerCounter%2].ships = newShipsArray;

      let newShipsLeft = this.state.shipsLeft.slice();
      newShipsLeft[deletedShipSize - 1]++;

      //update game state
      this.setState({
        lastAddedShip: {
          row: -1,
          column: -1,
        },
        shipsLeft: newShipsLeft,
      });

      //update the grid
      const newGrids = this.updateSquares();
      this.setState({grids: newGrids});
    }
  }

  done() {
    //GRID SETUP
    if (this.state.gameStage == "gridSetup") {
      //10 ships added => change state
      if (this.state.players[this.state.playerCounter%2].ships.length == 10) {
        if (this.state.playerCounter%2 == 0) {
          this.setState({
            playerCounter: 1,
            grids: [Array(10).fill(Array(10).fill(null)), Array(10).fill(Array(10).fill(null))],
            inTransition: true,
            lastAddedShip: {
              row: -1,
              column: -1,
            },
            shipsLeft: [4, 3, 2, 1],
          });
        } 
        else {
          this.setState({
            playerCounter: 0,
            grids: [Array(10).fill(Array(10).fill(null)), Array(10).fill(Array(10).fill(null))],
            inTransition: true,
            gameStage: "ongoingBattle",
          });
        }
      }
      else {
        alert("Finish setting up your battlefield first!");
      }
    }
    //ONGOING BATTLE
    else {
      //Player made his move => switch state
      if (this.state.playerMadeHisMove) {
        this.setState({
          playerCounter: this.state.playerCounter+1,
          playerMadeHisMove: false,
          inTransition: true,
        });
      }
      //Player still needs to make a move
      else {
        alert("It's your move!");
      }
    }
  }

  ready() {
    //SETTING UP GRID
    if (this.state.gameStage == "gridSetup") {
      this.setState({inTransition: false});
    }
    //ONGIONG BATTLE
    else {
      const newGrids = this.updateSquares();
      this.setState({
        inTransition: false,
        grids: newGrids,
      });
    }
  }

  renderBoard(playerId) {
    //The player is not ready yet => hide everything
    if (this.state.inTransition) {
      return (
        <Board 
          grid={Array(10).fill(Array(10).fill(null))}
          onClick={(i,j) => dummy(i,j)}
          newGame={() => this.newGame()}
        />
      );
    }
    //Show the player's game boards
    else {
      //Player can only interact with oponent's board
      if (this.state.gameStage == "ongoingBattle") {
        var interactiveBoardId = (playerId+1)%2;
      }
      //Player can only interact with his own board
      else {
        var interactiveBoardId = playerId;
      }

      //Interactive board
      if (this.state.playerCounter%2 == interactiveBoardId) {
        return (
          <Board 
            grid={this.state.grids[playerId]}
            onClick={(i,j) => this.newHandleClick(i,j)}
            newGame={() => this.newGame()}
          />
        );
      }
      //Non interactive board
      else {
        return (
          <Board 
            grid={this.state.grids[playerId]}
            onClick={(i,j) => dummy(i,j)}
            newGame={() => this.newGame()}
          />
        );
      }
    }
  }

  renderPlayerControls(playerId) {
    //GRID SETUP
    if (this.state.gameStage == "gridSetup") {

      if (this.state.playerCounter%2 == playerId) {
        if (!this.state.inTransition) {
          return (
            <ShipConfig 
              shipsLeft={this.state.shipsLeft}
              type={this.state.shipSizeSelected}
              position={this.state.shipPositionSelected}
              onTypeChange={this.changeShipSize}
              onPositionChange={this.changeShipPosition}
              undo={() => this.undo()}
              done={() => this.done()}
            />
          );
        }
        else {
          return (
            <button onClick={() => this.ready()}>Ready</button>
          );
        } 
      }
      else {
        return (
          <p>Waiting for my turn...</p>
        );
      }

    }
    //ONGOING BATTLE
    else {
      //PLAYERS SWITCHING
      if (this.state.inTransition) {
        if (this.state.playerCounter%2 == playerId) {
          return (
            <button onClick={() => this.ready()}>Ready</button>
          );
        }
        else {
          return (
            <p>Waiting for my turn...</p>
          );
        }
      }
      //PLAYER READY
      else {
        if (this.state.playerCounter%2 == playerId) {
          if (this.state.playerMadeHisMove) {
            return (
              <div>
                <button onClick={() => this.done()}>Done</button>
              </div>
            );
          }
          else {
            return (
              <div>
                <h4>Make a move</h4>
              </div>
            );
          }
        }
        else {
          return (
            <p>Waiting for my turn...</p>
          );
        }
      }
    }

  }

  render() {

    //BATTLESHIP CODE

    return (
      <div classname="main">
        <h1>Battleship</h1>
        <div className="game">
          <div className="game-board">
            <h2>Player 1</h2>
            {this.renderBoard(0)}
            <div className="playerControls">
              {this.renderPlayerControls(0)}
            </div>
          </div>
          <div className="game-board">
            <h2>Player 2</h2>
            {this.renderBoard(1)}
            <div className="playerControls">
              {this.renderPlayerControls(1)}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function dummy(i, j) {

}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

