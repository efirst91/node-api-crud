const express = require("express");
const api = express.Router();
const {GatewayRouter} = require('../modules/gateway/gateway.router')
const {PeripheralRouter} = require('../modules/peripheral-device/peripheral.router')
// Gateway
api.use('/gateway', GatewayRouter)

// Peripheral devices
api.use('/peripheral', PeripheralRouter)
module.exports = api
