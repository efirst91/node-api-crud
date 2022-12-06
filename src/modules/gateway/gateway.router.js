const {Router} = require("express");
const GatewayController = require("./infraestructure/gateway.controller");
/**
 * All Routes
 * @type Router
 */
const router = Router()

router
    .get('/', GatewayController.getAllGateway)
    .get('/:id', GatewayController.getGatewayById)
    .post('/', GatewayController.saveGateway)
    .put('/:id', GatewayController.updateGateway)
    .delete('/group', GatewayController.deleteGatewayGroup)
    .delete('/:id', GatewayController.deleteGatewayById)

module.exports.GatewayRouter = router;

