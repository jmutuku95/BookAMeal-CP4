import React, { Component } from 'react';
import {
   BrowserRouter as Router,
   Switch,
   Route,
   Redirect } from "react-router-dom";
import decode from "jwt-decode";

import NavBar from "./common/NavBar";
import SignUp from "./components/SignUp";
import SignIn from "./components/SignIn";
import SignOut from "./components/SignOut";
import Menu from "./components/Menu"
import Meals from "./components/Meals";
import Meal from "./components/Meal";
import Orders from "./components/Orders";


let isAdmin = '';
let userName = ''
const checkIsAuthenticated = () => {
  const access_token = sessionStorage.getItem('access_token');
  try {
    var { exp, admin, username } = decode(access_token);
    isAdmin = admin
    userName = username

    if (exp > new Date().getTime()) {
      return false
    } else {
      return true
    }
  } catch (e) {
    return false
  }
}

const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route {...rest} render={(props) => (
    checkIsAuthenticated()? <Component {...props} />
  : <Redirect to={{ pathname: '/signin', state: { from: props.location, redirectToReferrer: true } }} />
  )} />

)

class App extends Component {

  render() {

    let authentication = checkIsAuthenticated()

    return (
      <Router>
        <div className="container">
          <header>
            <NavBar isAuthenticated={ authentication } isAdmin={ isAdmin } username={ userName }/>
          </header>
          <Switch>
            <Route path="/signup" component={ SignUp }/>
            <Route path="/signin" component={ SignIn }/>
            <Route path="/signout" component={ SignOut }/>
            <PrivateRoute path="/menu" component={ Menu }/>
            <PrivateRoute exact path="/meals" component={ Meals }/>
            <PrivateRoute path="/meals/:meal_id" component={ Meal }/>
            <PrivateRoute path="/orders" component={ Orders } />
          </Switch>
          <footer>
            <p>Footers Here</p>
          </footer>
        </div>
      </Router>
    );
  }
}

export default App;
