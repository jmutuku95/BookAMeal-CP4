import React, { Component } from 'react';
import { Redirect, BrowserRouter as Route } from 'react-router-dom';


class SignUp extends Component {
  constructor(props) {
    super(props)
    this.state = {
      username: '',
      email: '',
      password: '',
      password1: '',
      alert: null,
      redirect: null,
    }
  }

  handleChange = (event) => {
    event.preventDefault();
    this.setState({ [event.target.name]: event.target.value })
  }

  handleSubmit = (event) => {
    event.preventDefault();
    const { password, password1, username, email } = this.state
    if (password === password1 && password.length >= 8) {
      this.setState({submitted: true })
      const url = '/api/v2/signup'
      const data = { username: username, email: email, password: password }
      fetch(url, {
        body: JSON.stringify(data),
        headers: {
          'content-type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        method: 'POST',
        mode: 'cors',
      })
        .then(response => response.json())
        .catch(error => console.error('Error: ', error))
        .then((response) => {
          if (response.access_token) {
            sessionStorage.setItem('access_token', `Bearer ${response.access_token}`);
            const msg = response.message
            console.log('Success: ', msg);
            console.log('Token: ', response.access_token);
            this.setState({ redirect: '/' })
          }
          const msg = response.message
          this.setState({ alert: msg })
        })
    } else {
      const msg = 'Ensure passwords match and use more than 8 characters'
      this.setState({ alert: msg })
    }
  }

  render() {
    let displayAlert = '';
    const { alert, redirect } = this.state

    if (alert) {
      displayAlert = (
        <div className="error">
          <p>{ alert }</p>
        </div>
      )
    }

    if (redirect) {
      return (
        <Route>
          <Redirect to="/" />
        </Route>
        
    )
    }

    return (
      <div>

        <form className="form-Group w3-display-middle center" onSubmit={this.handleSubmit}>

          <h3> Registration Form</h3>
          { displayAlert }
          <label htmlFor="username">
            <span>Username:</span>
            <input type="text" className="form-control" id="username" placeholder="username" name="username" pattern=".{4,}" onChange={this.handleChange} required title="Required minimum length of 4 characters" />
          </label>
          <br />
          <label htmlFor="email">
            <span>Email:</span>
            <input type="email" className="form-control" placeholder="example@mail.com" name="email" onChange={this.handleChange} required />
          </label>
          <br />
          <label htmlFor="password">
            <span>Password:</span>
            <input type="password" className="form-control" onChange={this.handleChange} name="password" pattern=".{8,}" required title="Atleast 8 characters." />
          </label>
          <br />
          <label htmlFor="password1">
            <span>Confirm Password:</span>
            <input type="password" className="form-control" onChange={this.handleChange} name="password1" pattern=".{8,}" required title="Atleast 8 characters." />
          </label>
          <br />
          <input className="btn btn-primary" type="submit" value="Sign Up" />
          <br />
          <li>
            {'Already have an account?' }
            <a href="/signin" className="links">Sign In</a>
          </li>
        </form>
      </div>
    );
  }
}

export default SignUp;
