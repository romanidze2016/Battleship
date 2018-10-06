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
	return (
		<button className="square" onClick={props.onClick}>
			{props.value}
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
      <div>
        <h3>Setup your battlefield</h3>
        <div id="controlBody">
          <form>
            <p><b>Select type of ship:</b></p>
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
          <p><b>Number of ships left:</b></p>
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

class ShipPart {
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
        this.parts.push(new ShipPart(row, j, "X"));
      }
    }
    else {
      for (let i = row; i < row + size; i++) {
        this.parts.push(new ShipPart(i, column, "X"));
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
  		history: [{
  			squares: Array(9).fill(null),
  		}],
  		stepNumber: 0,
  		xIsNext: true,

      //Battle Ship vars
      players: [new Player(0), new Player(1)],
      grids: [Array(10).fill(Array(10).fill(null)), Array(10).fill(Array(10).fill(null))],
      playerCounter: 0,
      gameStage: "gridSetup",
      inTransition: false,

      lastAddedShip: {
        row: -1,
        column: -1,
      },

      //gridSetup state variables
      shipSizeSelected: "1",
      shipPositionSelected: "h",
      shipsLeft: [4, 3, 2, 1],
  	}

    this.changeShipSize = this.changeShipSize.bind(this);
    this.changeShipPosition = this.changeShipPosition.bind(this);
  }

  handleClick(i) {
  	const history = this.state.history.slice(0, this.state.stepNumber + 1);
  	const current = history[history.length - 1];
  	const squares = current.squares.slice();
  	if (calculateWinner(squares) || squares[i]) {
  		return;
  	}
  	squares[i] = this.state.xIsNext ? 'X' : 'O';
  	this.setState({
  		history: history.concat([{
  			squares: squares,
  		}]),
  		stepNumber: history.length,
  		xIsNext: !this.state.xIsNext,
  	});
  }

  newGame() {
  	this.jumpTo(0);
  }

  jumpTo(step) {
  	this.setState({
  		stepNumber: step,
  		xIsNext: (step % 2) === 0,
  	});
  }

  //BATTLE SHIP FUNCTIONS
  newHandleClick(row, column) {
    if (this.state.gameStage == "gridSetup") {
      this.addNewShip(row, column);
    } else {

    }
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

  getGridCopy(i) {
    let grid = [];
    for (let counter = 0; counter < 10; counter++) {
      grid.push(this.state.grids[i][counter].slice());
    }

    return grid;
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
    //TODO


    //OPPONENT'S GRID
    let opponentsSquares = this.getGridCopy((this.state.playerCounter+1)%2);

    if (this.state.gameStage == "ongoingBattle") {
      //Display only the damaged parts of the ship
      for (let i = 0; i < this.state.players[(this.state.playerCounter+1)%2].ships.length; i++) {
        const ship = this.state.players[(this.state.playerCounter+1)%2].ships[i];
        for (let j = 0; j < ship.parts.length; j++) {
          const part = ship.parts[j];
          if (part.value == "O") {
            opponentsSquares[part.row][part.column] = part.value;
          }
        }
      }

      //Display player's missed hits
      //TODO
    }

    let newGrids = []
    newGrids[this.state.playerCounter%2] = playersSquares;
    newGrids[(this.state.playerCounter+1)%2] = opponentsSquares;
    return newGrids;
  }

  undo() {
    if (this.state.lastAddedShip.row != -1) {
      let newShipsArray = [];
      let deletedShipSize = 0;

      const ships = this.state.players[this.state.playerCounter%2].ships;
      for (let i = 0; i < ships.length; i++) {
        if (ships[i].parts[0].row != this.state.lastAddedShip.row || ships[i].parts[0].column != this.state.lastAddedShip.column) {
          newShipsArray.push(ships[i]);
        }
        else {
          deletedShipSize = ships[i].parts.length;
        }
      }
      this.state.players[this.state.playerCounter%2].ships = newShipsArray;

      let newShipsLeft = this.state.shipsLeft.slice();
      newShipsLeft[deletedShipSize - 1]++;

      this.setState({
        lastAddedShip: {
          row: -1,
          column: -1,
        },
        shipsLeft: newShipsLeft,
      });

      const newGrids = this.updateSquares();
      this.setState({grids: newGrids});
    }
  }

  done() {
    if (this.state.gameStage == "gridSetup") {
      if (this.state.players[this.state.playerCounter%2].ships.length == 10) {
        if (this.state.playerCounter == 0) {
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
  }

  changeShipSize(size) {
    this.setState({shipSizeSelected: size});
  }

  changeShipPosition(position) {
    this.setState({shipPositionSelected: position});
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
          return (
            <div>
              <h4>Make a move</h4>
              <button onClick={() => this.done()}>Done</button>
            </div>
          );
        }
        else {
          return (
            <p>Waiting for my turn...</p>
          );
        }
      }
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
      //Interactive board
      if (this.state.playerCounter%2 == playerId) {
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

  render() {
  	const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);

    const moves = history.map((step, move) => {
      const desc = move ?
        'Go to move #' + move :
        'Go to game start';
      return (
        <li key={move}>
          <button onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>
      );
    });

    let status;
    if (winner) {
      status = 'Winner: ' + winner;
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }

    //BATTLESHIP CODE

    return (
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
        <div className="game-info">
          <div>{status}</div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

function dummy(i, j) {

}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

