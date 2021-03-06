module.exports = function(app) {
  const mongoose = require('mongoose')
  const Inventory = mongoose.model('Inventory')
  const Computer = mongoose.model('Computer')
  const User = mongoose.model('User')
  const Program = mongoose.model('Program')
  const jwt = require('jsonwebtoken')
	const inventory = require('../controllers/inventory')
	const tickets = require('../controllers/tickets')
  const users = require('../controllers/users')
	const program = require('../controllers/program')
	const email = require('../config/email')
  const passport = require('passport')
  const cors = require('cors')

  app.route('/')
		.get(function(req, res) {
    	return res.status(200).send({status: "running"})
    })

  app.route('/recover/request')
		.post(email.send_email)

  app.route('/recover/change')
		.post(users.reset_password)

  app.route('/inv')
    .get(inventory.list_inventory)
    .post(inventory.new_inventory)

  app.route('/inv/batch')
    .post(inventory.new_batch)
    .put(inventory.edit_batch)

  app.route('/inv/:id')
    .get(inventory.get_inventory)
    .put(inventory.update_inventory)
    .delete(inventory.delete_inventory)

  app.route('/programs')
    .get(program.list_program)
    .post(program.new_program)

  app.route('/user')
    .get(users.list_users)
    .post(users.create_user)

  app.route('/user/:id')
    .get(users.view_user)
    .put(users.update_user)
    .delete(users.delete_user)

  app.route('/me/inv')
    .get(inventory.list_user_inventory)

  app.route('/me/tickets')
    .get(tickets.list_user_tickets)

  app.route('/login')
    .post(users.login_user)

//  app.route('/recover')
//    .post(email.send_password)

  app.route('/tickets')
    .get(tickets.list_tickets)
    .post(tickets.new_request)

  app.route('/tickets/purchases')
    .post(tickets.batch_purchase)

  app.route('/tickets/:id')
    .get(tickets.get_ticket)
    .put(tickets.edit_ticket)
    .delete(tickets.delete_tickets)

/* Error Handler */
  app.use(function (err, req, res, next) {
    console.log(err)

    switch (err.name) {
      case 'MongoError':
        if (err.code === 11000) {
          return res.status(409).send({
            success: false,
            error: err,
            msg: 'This ID is already in use. Please confirm that the item you are adding does not already exist, or choose a different ID.'
          })
        } else {
          return res.status(500).send({
            success: false,
            error: err,
            msg: "MongoDB encountered an error. " + err
          })
        }
        break;
      case 'UpdateError':
        return res.status(409).send({
          success: false,
          error: err,
          msg: "An error occurred while attempting to update this resource. Please check than all fields have been filled and that the ObjectID is correct."
        })
        break;
      case 'ResetNotValid':
        return res.status(409).send({
          success: false,
          error: err,
          msg: "Your password could not be updated. Please consult your administrator for more information on this error."
        })
        break;
      case 'Mail':
        return res.status(500).send({
          success: false,
          error: err,
          msg: "The server was unable to send an email to your address. Please consult your administrator for more information on this error."
        })
        break;
      case 'SubNew':
        return res.status(500).send({
          success: false,
          error: err,
          msg: "The nested information for this item could not be created."
        })
        break;
      case 'New':
        return res.status(500).send({
          success: false,
          error: err,
          msg: "This item could not be created."
        })
        break;
      case 'FindError':
        return res.status(404).send({
          success: false,
          error: err,
          msg: "This ID does not match any registered. Please double check the Json Web Token payload."
        })
        break;
      case 'NoUser':
        return res.status(404).send({
          success: false,
          error: err,
          msg: "This username does not match any registered user. Please double check your input."
        })
        break;
      case 'WrongPass':
        return res.status(403).send({
          success: false,
          error: err,
          msg: "The password entered for this user is incorrect. Please check your spelling and try again."
        })
        break;
      case 'AuthError':
        return res.status(403).send({
          success: false,
          error: err,
          msg: "The credentials for this user were not accepted. Please check your spelling and try again."
        })
        break;
      case 'PassHash':
        return res.status(500).send({
          success: false,
          error: err,
          msg: "There was an error hashing the provided password."
        })
        break;
      case 'Kind':
        return res.status(500).send({
          success: false,
          error: err,
          msg: "Kind was not a valid type"
        })
        break;
      case 'CastError':
        return res.status(406).send({
          success: false,
          error: err,
          msg: "This ID does not match any registered user. Please double check the Json Web Token payload."
        })
        break;
      case 'Missing':
        return res.status(400).send({
          success: false,
          error: err,
          msg: "This request was missing a parameter"
        })
        break;
      default:
        return res.status(500).send({
          success: false,
          error: err,
          msg: "Sorry, something's gone wrong. " + err
        })
    }
  })
}
