import React, { Component } from 'react';
import { Well, Panel, Modal, Button, Tabs, Tab } from 'react-bootstrap';
import { timeConverter } from '../common/helpers';


class Orders extends Component {
  constructor(props) {
    super(props)
    this.state = {
      orders: '',
      admin_orders: null,
      show_modal: false,
      meals_on_disp: null,
      daily_summaries: null,
    }
  }

  componentDidMount() {
    this.getOrders()
  }

  getOrders() {
    // gets all orders from api
    const access_token = sessionStorage.getItem('access_token')
    const url = 'https://bookameal-staging.herokuapp.com/api/v2/orders'
    // Do a fetch to get orders
    fetch(url, {
      headers: {
        'content-type': 'application/json',
        Authorization: access_token,
        'Access-Control-Allow-Origin': '*',
      },
      method: 'GET',
      mode: 'cors',
    })
      .then(response => response.json())
      .catch(error => console.error('Error:', error))
      .then((response) => {
        this.setState({ orders: response.orders })
        this.setState({ admin_orders: response.admin_orders })
        this.setState({ daily_summaries: response.daily_summaries })
      })
  }

  mealNode = () => {
    // display meals in order
    const { meals_on_disp } = this.state
    const meals = meals_on_disp
    if (meals) {
      const meal_node = meals.map(meal => (
        <this.Meal meal={meal} />))
      return meal_node
    }
    return null
  }

  Meal = (meal) => {
    // render mealitem in order into panel
    const meal_item = meal.meal
    return (
      <Panel>
        <p>Meal Name: <strong>{ meal_item.name }</strong></p>
        <p>Quantity: <strong>{ meal_item.quantity }</strong></p>
        <p>Unit Price: <strong>{ meal_item.unit_price }</strong></p>
        <p>Sub Total: <strong>{ meal_item.sub_total }</strong></p>
      </Panel>
    )
  }

  Order = (order) => {
    // render an order item in a well component
    const order_item = order.order;

    const id = order_item.order_id;
    const time_ordered = timeConverter(order_item.time_ordered);
    const due_time = timeConverter(order_item.time_ordered);
    const { total, owner } = order_item;
    return (
      <Well>
        <div className="col-md-2">{ id }</div>
        <div className="col-md-2">{ time_ordered }</div>
        <div className="col-md-2">{ due_time }</div>
        <div className="col-md-2">{ owner }</div>
        <div className="col-md-2">{ total }</div>
        <Button onClick={this.showDetail} data-id={id}>Show Meals</Button>
      </Well>)
  }

  showDetail = (e) => {
    // show modal for all meals in the order
    e.preventDefault()
    const order_id = parseInt(e.currentTarget.dataset.id, 10);
    const { orders } = this.state

    for (const i in orders) {
      if (orders.hasOwnProperty(i)) {
        if (order_id === orders[i].order_id) {
          this.setState({ meals_on_disp: orders[i].meals })
        }
      }
    }
    this.showModal()
  }

  showModal = () => {
    // show modal for displaying meals in an order
    this.setState({ show_modal: true })
  }

  handleCloseModal = () => {
    // close modal
    this.setState({ show_modal: false })
  }

  displayOrders = (orders) => {
    // render a list of orders
    const orders_heading = (
      <div className="row">
        <div className="col-md-2"><h4><b>ID</b></h4></div>
        <div className="col-md-2"><h4><b>Time Ordered</b></h4></div>
        <div className="col-md-2"><h4><b>Due Time</b></h4></div>
        <div className="col-md-2"><h4><b>Owner</b></h4></div>
        <div className="col-md-2"><h4><b>Total Cost</b></h4></div>
      </div>
    )
    try {
      const order_list = orders.orders
      const orderNode = order_list.map(order => (
        <this.Order order={order} />))
      return (
        <div>
          { orders_heading }
          { orderNode }
        </div>
      )
    } catch (e) {
      // if no orders
      return (
        <div className="center">
          <h3>No orders to show here.</h3>
        </div>
      )
    }
  }

  displayDailySummaries = () => {
    // display daily summaries showing amoutn made in a day
    const { daily_summaries } = this.state
    if (daily_summaries) {
      const dates = Object.keys(daily_summaries)

      const dateNOde = dates.map(date => (
        <this.Summary date={date} />))
      return dateNOde
    }
    return (
      <div className="center">
        <h3>No summary to show, or not an admin.</h3>
      </div>
    )
  }

  Summary = (date) => {
    // render daily summary for a particular date
    const { daily_summaries } = this.state
    const date_summary = daily_summaries[date.date]
    let total = 0;
    for (const i in date_summary) {
      if (date_summary.hasOwnProperty(i)) {
        total += date_summary[i].total
      }
    }
    return (
      <Well>
        <div> Date: { date.date }</div>
        <div>Total :Kes  { total }.00 </div>
      </Well>
    )
  }

  render = () => {
    const { orders } = this.state
    if (orders.length === 0) {
      return (
        <Well>
          <p>Hey, you do not appear to have any orders yet!</p>
        </Well>
      )
    }
    const { admin_orders, show_modal } = this.state
    return (
      <div>
        <h2>Orders Information</h2>
        <Tabs defaultActiveKey={1}>
          <Tab eventKey={1} title="My Orders">
            <Well>
              <this.displayOrders orders={orders} />
            </Well>
          </Tab>

          <Tab eventKey={2} title="All Orders">
            <this.displayOrders orders={admin_orders} />
          </Tab>
          <Tab eventKey={3} title="Daily Summaries">
            <this.displayDailySummaries />
          </Tab>
        </Tabs>

        <Modal show={show_modal} onHide={this.handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title><span>Meals for Order </span></Modal.Title>
          </Modal.Header>
          <Modal.Body>
            { this.mealNode() }
          </Modal.Body>
        </Modal>
      </div>
    )
  }
}

export default Orders;
