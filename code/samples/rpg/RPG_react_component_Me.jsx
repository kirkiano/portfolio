/*
 * ReactJS component providing the "Me" feature of the
 * RPG's web client, ie, the part that provides the player's
 * own information.
 */
import React from 'react';
import './Me.css';
import {ListGroup} from 'react-bootstrap';


export class Me extends React.PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      name: '(Loading user...)',
      description: '',
      health: null,
      showMenu: false,
      showModal: false,
    };
  }

  componentDidMount = () => {
    this.props.welcome
      .subscribe(msg => {
        this.setState({
          name: msg.name,
          health: msg.health,
          description: msg.description,
        });
      });
    this.props.health.subscribe(health => this.setState({health}));
    this.props.gameOver.subscribe(this.gameOver);
  };

  showMenu = () => this.setState({showMenu: true});
  hideMenu = () => this.setState({showMenu: false});
  showModal = () => this.setState({showModal: true});
  hideModal = () => this.setState({showModal: false});
  gameOver = reason => alert(`Game over: ${reason}`)

  render = () => {
    return (
      <div id='me'>
        <div className='nameAndMenu'
             onMouseLeave={this.hideMenu}>
          <div className='name rounded-border paper-bg'
               onMouseEnter={this.showMenu}>
            {this.state.name}
            <span id='health'>{Math.round(100 * this.state.health)}</span>
          </div>
          {this.state.showMenu && !this.state.showModal &&
          <Menu showDescription={this.showModal}
                logout={this.props.logout}/>}
        </div>
        {this.state.showModal &&
        <DescModal className='description'
                   description={this.state.description}
                   save={this.props.editMe}
                   dismissMe={() => {this.hideModal(); this.hideMenu();}}/>}
      </div>
    );
  }
}


class Menu extends React.Component {

  render = () => (
    <ListGroup className='paper-bg rounded-border'>
      <ListGroup.Item onClick={e => this.props.showDescription(e.target.value)}>
        Edit description
      </ListGroup.Item>
      <ListGroup.Item onClick={() => this.props.logout()}>
        Logout
      </ListGroup.Item>
    </ListGroup>
  );
}


class DescModal extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      value: props.description
    }
  }

  save = evt => {
    evt.preventDefault();
    this.props.save(this.state.value);
    this.props['dismissMe']();
  };

  handleChange = evt => this.setState({value: evt.target.value});

  render = () => (
    <form className='description'>
      <textarea className='paper-bg'
                defaultValue={this.state.value}
                onChange={this.handleChange}
                rows='10'
                cols='55'/>
      <div>
        <button onClick={this.props['dismissMe']}>Cancel</button>
        <button onClick={this.save}>Save</button>
      </div>
    </form>
  );
}
