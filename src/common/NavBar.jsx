import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';


class NavBar extends Component {
  rightNav = () => {
    // change navbar depending on authentication status
    const { isAuthenticated, username } = this.props
    if (isAuthenticated) {
      // if true
      return (
        <ul className="nav navbar-right navbar-nav">
          <li>
            <NavLink to="/">
              <span>You are logged in as:</span>
              { username }
            </NavLink>
          </li>
          <li><NavLink to="/signout"> Sign Out </NavLink></li>
        </ul>
      )
    }
    // if false     
    return (
      <ul className="nav navbar-right navbar-nav">
        <li><NavLink to="/signup"> Sign Up </NavLink></li>
        <li><NavLink to="/signin"> Sign In </NavLink></li>
      </ul>
    )
  }

  adminNav = () => {
    // if isAdmin is set as true,  display link to meals
    const { isAdmin } = this.props
    if (isAdmin) {
      // is admin
      return (
        <li><NavLink to="/meals"> Meals</NavLink></li>
      )
    }
    // not admin     
    return null
  }

  render() {
    return (
      <nav className="navbar navbar-inverse row navbar-fixed-top">
        <div className="container-fluid">
          <div className="navbar-header">
            <NavLink className="navbar-brand" to="/">Hot Corner Delicacies</NavLink>
          </div>
          <ul className="nav navbar-nav">
            <li><NavLink to="/"> Home </NavLink></li>
            <li><NavLink to="/menu"> Menu </NavLink></li>
            <li><NavLink to="/orders"> Orders </NavLink></li>
            <this.adminNav />
          </ul>
          <this.rightNav />
        </div>
      </nav>
    );
  }
}

NavBar.propTypes = {
  isAdmin: PropTypes.bool.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
  username: PropTypes.string.isRequired,
}

export default NavBar;
