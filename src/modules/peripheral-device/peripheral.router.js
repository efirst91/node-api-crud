const {Router} = require("express");
const PeripheralController = require('./infraestructure/peripheral.controller')
/**
 * All Routes
 * @type Router
 */
const router = Router()

router
    .get('/', PeripheralController.getAllPeripheral)
    .get('/:id', PeripheralController.getPeripheralById)
    .post('/', PeripheralController.savePeripheral)
    .put('/:id', PeripheralController.updatePeripheral)
    .delete('/group', PeripheralController.deletePeripheralGroup)
    .delete('/:id', PeripheralController.deletePeripheralById)

module.exports.PeripheralRouter = router;
