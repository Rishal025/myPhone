var express = require('express');
const productHelper = require('../helpers/product-helper');
const userHelpers = require('../helpers/user-helpers');
const orderHelper = require('../helpers/orderHelper')
const categoryHelper = require('../helpers/category-helper');
const addressHelper = require('../helpers/address-Helper')
var paypal = require('paypal-rest-sdk');
const adminHelper = require('../helpers/admin-helper');
const { ObjectId } = require('mongodb');
var router = express.Router();

let products = async (req, res, next) => {

  const page = parseInt(req.query.page)
  // const limit = parseInt(req.query.limit)
  const limit = 3
  const startIndex = (page - 1) * limit
  const endIndex = page * limit

  console.log('start' + startIndex)

  const results = {}
  let productsCount = await productHelper.getProductsCount()
  console.log(productsCount)
  if (endIndex < productsCount) {
    console.log('nextttttt')
    results.next = {
      page: page + 1,
      limit: limit
    }
  }

  if (startIndex > 0) {
    results.previous = {
      page: page - 1,
      limit: limit
    }
  }
  try {
    results.products = await productHelper.getPaginatedResult(limit, startIndex)
    results.pageCount = Math.ceil(parseInt(productsCount) / parseInt(limit)).toString()
    results.pages = Array.from({ length: results.pageCount }, (_, i) => i + 1)
    results.currentPage = page.toString()

    res.paginatedResults = results

    console.log('results:')
    console.log(results)
    next()
  } catch (e) {
    res.status(500).json({ message: e.message })
  }

}

let userAuthLogin = (req, res, next) => {
  if (req.session.loggedIn) {
    next()
  } else {
    res.redirect('/login')
  }
}

let userAuthGuest = (req, res, next) => {
  if (req.session.loggedIn) {
    next()
  } else {
    res.redirect('/guestHome')
  }
}



module.exports = {
  products,
  userAuthLogin,
  userAuthGuest
}