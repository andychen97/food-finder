import React from 'react';
import logo from '../../server/public/images/chef-logo.png';
import AppContext from '../lib/app-context';
import Default from '../../server/public/images/default-profile.png';

export default class LogoHeader extends React.Component {
  constructor(props) {
    super(props);
    this.signOut = this.signOut.bind(this);
  }

  signOut() {
    window.location.hash = '';
    this.props.onSignOut();
  }

  render() {
    const { user } = this.context;
    const signIn = user ? null : <a className='sign-in' href='#sign-in'>Sign In</a>;
    let firstName;
    let image;
    if (user) {
      firstName = user.firstName[0].toUpperCase() + user.firstName.slice(1, user.firstName.length);
      image = user.imageURL === null ? `${Default}` : user.imageURL;
    }
    const profile = user
      ? <a className='profile' href='#profile'>
          <div className='row'>
              <img src={image} className='header-profile-img' />
            <p className='profile-name'>{firstName}</p>
          </div>
        </a>
      : null;
    const signUpOut = user
      ? <button className='sign-out' onClick={this.signOut}>Sign Out</button>
      : <a className='sign-up' href='#sign-up'>Sign Up</a>;
    return (
      <div>
        <div className="row white-bg header">
          <div className="col-3"></div>
          <div className="col-3">
            <div className='row align-center'>
              <a href='#'>
                <img src={logo} alt='chef-logo' className='logo' />
              </a>
            </div>
          </div>
          <div className="col-3">
            <div className="row flex-end">
              {signIn}
              {profile}
              {signUpOut}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

LogoHeader.contextType = AppContext;
