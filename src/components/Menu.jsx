import React, { Component } from 'react';
import { Button, Alert, Well, Modal, Table } from 'react-bootstrap';
import swal from 'sweetalert';
import { timeConverter } from '../common/helpers';


class Menu extends Component {
  constructor(props) {
    super(props)
    this.state = {
      meals: '',
      date: '',
      show_cart: false,
      cart: [],
      alert: null,
      quantity: null,
    }
  }

  componentDidMount() {
    this.getMenu()
  }

  getMenu = () => {
    // fetches menu from api
    const access_token = sessionStorage.getItem('access_token')
    const url = 'https://bookameal-staging.herokuapp.com/api/v2/menu'

    fetch(url, {
      headers: {
        'content-type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Authorization: access_token,
      },
      method: 'GET',
      mode: 'cors',
    })
      .then(response => response.json())
      .catch(error => console.error('Error: ', error))
      .then((response) => {
        this.setState({ meals: response.menu.meals });
        this.setState({ date: response.menu.date });
      })
  }


  handleChange = (event) => {
    // update the state as change occurs in input form
    event.preventDefault()
    this.setState({ [event.target.name]: event.target.value })
  }

  showAlert = () => {
    // shows alert
    const { alert } = this.state
    if (alert) {
      return (
        <Alert onDismiss={this.hideAlert}>{alert}</Alert>
      )
    }
    return null
  }

  hideAlert = () => {
    // hides alert
    this.setState({ alert: null })
  }

  addToCart = (e) => {
    // Add meal to the cart
    e.preventDefault()
    const meal_id = e.currentTarget.dataset.id
    const meal_name = e.currentTarget.dataset.name
    const { quantity, price } = e.currentTarget.dataset
    const order = {
      meal_id: meal_id,
      meal_name: meal_name,
      quantity: quantity,
      price: price,
      sub: price * quantity,
    }
    const { cart } = this.state
    let current_orders = cart
    // check if meal_id already exist, if it exists alter quantity
    let updated = false

    for (const i in current_orders) {
      if (current_orders.hasOwnProperty(i)) {
        const _order = current_orders[i]
        if (_order.meal_id === meal_id) {
          const new_quantity = parseInt(_order.quantity, 10) + parseInt(quantity, 10)
          _order.quantity = new_quantity
          _order.sub = new_quantity * _order.price
          updated = true
        }
      }
    }
    // if meal does not exist then add meal to cart
    if (!updated) {
      current_orders = current_orders.concat(order)
    }

    const alert = `Meal #${meal_id} added to cart!`
    this.setState({ cart: current_orders, alert: alert, quantity: null })
  }

  removeFromCart = (e) => {
    // remove meal from cart
    e.preventDefault()

    const meal_id = e.currentTarget.dataset.id;
    const { cart } = this.state
    const current_orders = cart;

    for (const i in current_orders) {
      if (current_orders.hasOwnProperty(i)) {
        const order = current_orders[i]
        if (order.meal_id === meal_id) {
          current_orders.splice(i, 1)
        }
      }
    }

    this.setState({ cart: current_orders })
  }

  Meal = (meal) => {
    // Render meal item in a well component
    const meal_item = meal.meal
    const { meal_id, name, description, price } = meal_item
    let { quantity } = this.state
    if (quantity < 1) {
      quantity = 1
    }
    return (
      <Well className="row">
        <div className="col-md-1">{ meal_id }</div>
        <div className="col-md-2">{ name }</div>
        <div className="col-md-3">{ description }</div>
        <div className="col-md-2">Kes { price }.00</div>
        <div className="col-md-4">
          <form>
            <label>Quantity: <input type="number" min="1" name="quantity" onChange={this.handleChange} /></label>
            <Button bsStyle="primary" onClick={this.addToCart} data-id={meal_id} data-quantity={quantity} data-name={name} data-price={price}>Add to Cart</Button>
          </form>
        </div>
      </Well>
    )
  }

  displayMenu = (menu) => {
    // displays all meals
    let menu_meals = []
    for (const i in menu.menu) {
      if (menu.menu.hasOwnProperty(i)) {
        menu_meals = menu_meals.concat(menu.menu[i])
      }
    }
    // go through all meals
    const menuNode = menu_meals.map(meal => (
      <this.Meal meal={meal} key={meal.meal_id} />))

    return (
      <Well>
        <div className="row">
          <div className="col-md-1"><h4>Meal ID</h4></div>
          <div className="col-md-2"><h4>Meal Name</h4></div>
          <div className="col-md-3"><h4>Description</h4></div>
          <div className="col-md-2"><h4>Price(Kes)</h4></div>
          <div className="col-md-4"><h4>Ordering Details</h4></div>
        </div>
        { this.showAlert() }
        { menuNode }
      </Well>
    );
  }

  showCart = () => {
    // show cart modal
    this.setState({ show_cart: true })
  }

  dismissCart = () => {
    // dismiss cart modal
    this.setState({ show_cart: false })
  }

  handlePlaceOrder = () => {
    // give user option to abort here
    const access_token = sessionStorage.getItem('access_token')
    const url = 'https://bookameal-staging.herokuapp.com/api/v2/orders'
    const { cart } = this.state;
    let order_list = [];
    swal({
      title: 'Are you sure you want to place this order?',
      icon: 'warning',
      buttons: true,
      dangerMode: true,
    })
      .then((willDelete) => {
        if (willDelete) {
          // loop through cart and create orders
          for (const i in cart) {
            if (cart.hasOwnProperty(i)) {
              const { meal_id, quantity } = cart[i]
              order_list = order_list.concat({ meal_id: meal_id, quantity: quantity })
            }
          }
          // provide form to select due time
          const today = new Date()
          const dd = today.getDate()
          // january is 0
          const MM = today.getMonth() + 1
          const yyyy = today.getFullYear()
          // add one hour
          const hh = today.getHours() + 1
          const mm = today.getMinutes()
          const due_time = `${dd}-${MM}-${yyyy} ${hh}-${mm}`
          const data = { due_time: due_time, order: order_list }
          console.log(JSON.stringify(data))
          // clear cart state and stop showing modal
          this.setState({ show_cart: false, cart: [] })
          fetch(url, {
            headers: {
              'content-type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              Authorization: access_token,
            },
            body: JSON.stringify(data),
            method: 'POST',
            mode: 'cors',
          })
            .then(response => response.json())
            .catch(error => console.error('Error: ', error))
            .then((response) => {
              this.setState({ alert: response.message });
            })
        } else {
          swal('Operation to place Order aborted')
        }
      })
  }

  render = () => {
    const { meals, cart } = this.state
    // check if meals contains sth
    if (meals.length === 0) {
      return (
        <Well>
          <p>Hey, the menu for this day has not been set yet. Check later!</p>
        </Well>
      )
    }
    const menu = meals
    // if cart has items, display them
    const cartItems = () => {
      if (cart.length !== 0) {
        // render eact order item in cart in a row
        const Row = order => (
          <tr>
            <td>{ order.order.meal_id }</td>
            <td>{ order.order.meal_name }</td>
            <td>{ order.order.quantity }</td>
            <td>{ order.order.price }</td>
            <td>{ order.order.sub }</td>
            <td><Button bsStyle="primary" onClick={this.removeFromCart} data-id={order.order.meal_id}>Remove</Button></td>
          </tr>
        )

        const orderNode = cart.map(order => (
          <Row order={order} />))

        return (
          <Well>
            <Table>
              <thead>
                <tr>
                  <th>Meal ID</th>
                  <th>Meal Name</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Subtotal</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                { orderNode }
              </tbody>
            </Table>
            <Button bsStyle="primary" onClick={this.handlePlaceOrder}>Place Order</Button>
          </Well>
        )
      }
      return (
        <div>
          <p>Sorry, at this moment you have not placed any orders</p>
        </div>
      )
    }
    const { date, show_cart } = this.state
    return (
      <div>
        <div className="w3-cell-row">
          <div className="w3-container w3-cell">
            <h3>Menu for Date: { timeConverter(date) }</h3>
          </div>

          <div className="w3-container w3-cell">
            <Button bsStyle="primary" onClick={this.showCart}><i className="fa fa-shopping-cart cart" /></Button>
          </div>
        </div>

        <this.displayMenu menu={menu} />
        <Modal show={show_cart} onHide={this.dismissCart}>
          <Modal.Header closeButton>
            <Modal.Title><span>CART</span></Modal.Title>
          </Modal.Header>
          <Modal.Body>
            { cartItems() }
          </Modal.Body>
        </Modal>
      </div>
    )
  }
}

export default Menu;
