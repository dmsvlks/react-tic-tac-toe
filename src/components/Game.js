import React, { Component } from 'react';
import styled from 'styled-components';

import Tile from './Tile';

const Wrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  width: 100%;
`;

const tiles = [0, 1, 2, 3, 4, 5, 6, 7, 8];

class Game extends Component {
  state = {
    0: null,
    1: null,
    2: null,
    3: null,
    4: null,
    5: null,
    6: null,
    7: null,
    8: null
  }

  componentDidMount() {
    const { socket } = this.props;
    socket.on('start', () => this.setState({ 0: null, 1: null, 2: null, 3: null, 4: null, 5: null, 6: null, 7: null, 8: null }));
    socket.on('oppMove', (id, shape) => this.setState({ [id]: shape }));
  }

  handleClick = id => {
    const { socket, playing, myTurn, shape } = this.props;
    
    if (playing && myTurn && this.state[id] === null) {
      this.setState({ [id]: shape });
      socket.emit('myMove', id);
    }
  }

  render() {
    return (
      <Wrapper>
        {tiles.map(id => <Tile key={id} id={id} shape={this.state[id]} onClick={this.handleClick} />)}
      </Wrapper>
    )
  }
}

export default Game;