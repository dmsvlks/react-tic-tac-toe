import React from 'react';
import styled from 'styled-components';

export const Wrapper = styled.div`
  width: calc(33% - 2px);
  padding-top: calc(33% - 2px);
  margin-bottom: 2px;
  background: hsl(187, 90%, 32%);
  background-image: ${props => props.shape && `url('public/${props.shape}.svg')`};
  background-size: 100% 100%;
  border: 1px solid black;
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.1s ease-in-out;

  :hover {
    background: hsl(187, 90%, 29%);
    background-image: ${props => props.shape && `url('public/${props.shape}.svg')`};
    background-size: 100% 100%;
  }

  :active {
    background: hsl(187, 90%, 27%);
    transform: scale(0.98);
  }
`;

const Tile = ({ onClick, shape, id }) => <Wrapper shape={shape} onClick={() => onClick(id)} />;

export default Tile;
