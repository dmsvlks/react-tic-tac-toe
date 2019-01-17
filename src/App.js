import React, { Component } from 'react';
import styled, { css } from 'styled-components';
import io from 'socket.io-client';

import Game from './components/Game';

const fontSizeDynamic = css`
  font-size: calc(1rem + 0.15vw);
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 10px;
`;

const Button = styled.button`
  padding: 10px 20px;
  color: hsla(0, 0%, 0%, 0.7);
  font-size: 0.95rem;
  background: hsl(100, 60%, 55%);
  box-shadow: 0 1px 2px hsla(0, 0%, 0%, 0.2);
  cursor: pointer;
  outline: none;
  border-radius: 3px;
  letter-spacing: 1px;
  transition: all 0.1s ease-in-out;

  :hover {
    background: hsl(100, 60%, 50%);
  }

  :active {
    background: hsl(100, 60%, 47%);
    transform: scale(0.98);
  }
`;

const Title = styled.h1`
  font-size: calc(1.6rem + 0.15vw);
  margin-top: 10px;
  text-align: center;
`;

const MessageWrapper = styled.div`
  width: 100%;
  height: 50px;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Message = styled.span`
  ${fontSizeDynamic};
  font-weight: bold;
`;

const Panel = styled.div`
  display: flex;
  width: 100%;

  > div:first-child {
    margin-left: 3px;
  }

  > div:nth-child(3) {
    margin-right: 3px;
  }
`;

const InfoWrapper = styled.div`
  width: 33%;
  ${props => props.center && 'text-align: center'};
  ${props => props.right && 'text-align: right'};
`;

const Info = styled.div`
  margin-bottom: 8px;
  ${fontSizeDynamic};
  font-weight: ${props => props.bold && 'bold'};
`;

class App extends Component {
  constructor() {
    super();
    this.socket = io('http://localhost:3001');
    this.state = {
      playersOnline: null,
      playersInGame: null,
      message: null,
      waiting: false,
      playing: false,
      myTurn: false
    }
  }

  componentDidMount() {
    this.socket.on('playersOnline', playersOnline => this.setState({ playersOnline }));
    this.socket.on('playersInGame', playersInGame => this.setState({ playersInGame }));
    this.socket.on('noPlayers', message => this.setState({ message, waiting: true }));

    this.socket.on('start', shape => {
      this.setState({ message: null, waiting: false, playing: false, myTurn: false });
      this.shape = shape;
      this.setState({ playing: true });
    });

    this.socket.on('myTurn', data => this.setState({ myTurn: data }));
    this.socket.on('result', message => this.setState({ message, playing: false }));
    this.socket.on('oppDisc', message => this.setState({ message, playing: false }));
  }
  
  handlePlay = () => this.socket.emit('play');

  render() {
    const { message, playersOnline, playersInGame, myTurn, playing, waiting } = this.state;
    return (
      <Wrapper>
        <Title>Tic Tac Toe</Title>

        <MessageWrapper>
          {message && <Message>{message}</Message>}
        </MessageWrapper>

        <Panel>
          <InfoWrapper>
            <Info>Online: {playersOnline}</Info>
            <Info>Playing: {playersInGame}</Info>
          </InfoWrapper>

          <InfoWrapper center>
            {!playing && !waiting && <Button onClick={this.handlePlay}>PLAY</Button>}
          </InfoWrapper>
          
          {playing && 
            (
              <InfoWrapper right>
                <Info>Your shape: {this.shape}</Info>
                <Info bold>{myTurn ? 'Your turn' : `Opponent's turn`}</Info>
              </InfoWrapper>
            )
          }
        </Panel>

        <Game socket={this.socket} playing={playing} shape={this.shape} myTurn={myTurn} />
        
      </Wrapper>
    );
  }
}

export default App;