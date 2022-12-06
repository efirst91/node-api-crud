const GatewayModel = require('../domain/gateway.model')
const PeripheralModel = require('../../peripheral-device/domain/peripheral.model')

/**
 * Get all gateway
 * @param req received request from client
 * @param res response that will be sent to client
 * @return {Promise<void>}
 */
const getAllGateway = async (req, res) => {
    try {
        const gatewaysAll = await GatewayModel.find().select('-__v');
        res.status(200).json({data: gatewaysAll, total: gatewaysAll.length});

    } catch (e) {
        res.status(500).json({error: e.message})
    }
}

/**
 * Save a gateway
 * @param req received request from client
 * @param res response that will be sent to client
 * @return {Promise<void>}
 */
const saveGateway = async (req, res) => {
    try {

        const peripheralsDevices = [];
        let newGateway = null;
        if (req.body.peripheralsDevices.length > 10) {
            res.status(400).json({
                data: {
                    message: 'Each gateway can not have more than 10 peripheral devices'
                }, success: false
            });
        }

        const validIpv4 = validateIpv4(req.body.ipv4);
        if (!validIpv4) {
            res.status(400).json({
                data: {
                    message: 'Ipv4 not valid, please try to new one'
                }, success: false
            });
            return;
        }

        newGateway = new GatewayModel({
            serialNumber: req.body.serialNumber,
            ipv4: req.body.ipv4,
            humanReadableName: req.body.humanReadableName,
            peripheralsDevices: []
        })


        await newGateway.save();

        if (req.body.peripheralsDevices.length > 0) {
            const peripheralList = req.body.peripheralsDevices;
            for (const item of peripheralList) {
                const existPeripheralD = await PeripheralModel.findOne({uid: item.uid, vendor: item.vendor});
                if (existPeripheralD) {
                    res.status(400).json({
                        data: {message: `The peripheral with vendor ${existPeripheralD._id} already exist, please check peripheral list`},
                        success: false
                    });
                }

                try {
                    const newPeripheral = new PeripheralModel({
                        uid: item.uid,
                        vendor: item.vendor,
                        dateCreated: new Date(),
                        status: item.status,
                        gatewayId: newGateway._id
                    });

                    await newPeripheral.save();

                    peripheralsDevices.push(newPeripheral._id);

                } catch (e) {
                    res.status(500).json({
                        data: {
                            message: 'An error has occurred when tying to create an associated peripheral'
                        }, error: e, success: false,

                    })
                }
            }
        }

        await GatewayModel.updateOne(newGateway, {
            peripheralsDevices
        }).then(() => {
            res.status(200).json({data: {id: newGateway._id}, success: true});
        })


    } catch (e) {
        res.status(500).json({error: e.message, success: false})
    }
}

/**
 * Get gateway by id
 * @param req received request from client
 * @param res response that will be sent to client
 * @return {Promise<void>}
 */
const getGatewayById = async (req, res) => {
    try {
        const gatewayId = req.params.id;
        const gateway = await GatewayModel.findOne({_id: gatewayId}).select('-__v');

        if (!gateway) {
            res.status(400).json({
                data: {
                    message: 'This gateway does not exist'
                }, success: false
            })
        }

        res.status(200).json({
            data: {
                gateway
            }
        });

    } catch (e) {
        res.status(500).json({error: e.message, success: false})
    }
}

/**
 * Delete gateway by id
 * @param req received request from client
 * @param res response that will be sent to client
 * @return {Promise<void>}
 */
const deleteGatewayById = async (req, res) => {
    try {
        const gatewayId = req.params.id;
        const gateway = await GatewayModel.findOne({_id: gatewayId})
        if (!gateway) {
            res.status(400).json({
                data: {
                    message: 'This gateway does not exist'
                }, success: false
            })
        }


        if (gateway.peripheralsDevices.length > 0) {
            const pipheralChilds = await PeripheralModel.find({gatewayId: gatewayId})
            for (const item of pipheralChilds) {
                const gatewayId = null;
                await PeripheralModel.updateOne(item, {
                    gatewayId
                })
            }
        }
        
        await GatewayModel.deleteOne({_id: gatewayId});

        res.status(200).json({
            data: {
                gatewayId
            }, success: true
        });


    } catch (e) {
        res.status(500).json({error: e.message, success: false})
    }
}

/**
 * Delete gateways by group
 * @param req received request from client
 * @param res response that will be sent to client
 * @return {Promise<void>}
 */
const deleteGatewayGroup = async (req, res) => {
    try {
        const idsGroup = req.body;
        for (const itemId of idsGroup) {
            const gateway = await GatewayModel.findOne({_id: itemId})
            if (!gateway) {
                res.status(400).json({
                    data: {
                        message: 'This gateway does not exist'
                    }, success: false
                })
            }

            await GatewayModel.deleteOne({_id: itemId});
        }

        res.status(200).json({
            data: {
                message: 'All gateways were be deleted successfully'
            }, success: true
        });


    } catch (e) {
        res.status(500).json({error: e.message, success: false})
    }
}

/**
 * Update gateway by id.
 * @description If in the peripheral list exist a new one,then their will be created, otherwise then will bue updated
 * @param req received request from client
 * @param res response that will be sent to client
 * @return {Promise<void>}
 */
const updateGateway = async (req, res) => {

    try {
        let {serialNumber, ipv4, humanReadableName, peripheralsDevices} = req.body;
        const gatewayId = req.params.id;
        const gateway = await GatewayModel.findOne({_id: gatewayId})
        const periPheralListId = [];
        if (!gateway) {
            res.status(400).json({
                data: {
                    message: 'This gateway does not exist'
                }, success: false
            })
        }

        const validIpv4 = validateIpv4(req.body.ipv4);
        if (!validIpv4) {
            res.status(400).json({
                data: {
                    message: 'Ipv4 not valid, please try to new one'
                }, success: false
            });
            return;
        }

        const allPeripheralDevices = gateway?.peripheralsDevices.length + peripheralsDevices.length
        if (allPeripheralDevices > 10) {
            res.status(400).json({
                data: {
                    message: 'Each gateway can not have more than 10 peripheral devices',
                }, success: false
            });
        }

        for (const peripheralDev of peripheralsDevices) {
            try {
                if (peripheralDev._id === 0) {
                    const newPeripheral = new PeripheralModel({
                        uid: peripheralDev.uid,
                        vendor: peripheralDev.vendor,
                        dateCreated: new Date(),
                        status: peripheralDev.status
                    });

                    await newPeripheral.save();
                    periPheralListId.push(newPeripheral._id)
                } else {
                    const uid = peripheralDev.uid;
                    const vendor = peripheralDev.vendor;
                    const status = peripheralDev.status
                    const peripheral = await PeripheralModel.findOne({_id: peripheralDev})
                    await PeripheralModel.updateOne(peripheral, {
                        uid, vendor, status
                    })
                }

            } catch (e) {
                return res.status(500).json({
                    data: {message: 'Error trying to create peripherals'}, error: e.message, success: false
                })
            }
        }

        for (const val of peripheralsDevices) {
            if (val._id !== 0) {
                periPheralListId.push(val._id)
            }
        }


        peripheralsDevices = [...periPheralListId]

        await GatewayModel.updateOne(gateway, {
            serialNumber, ipv4, humanReadableName, peripheralsDevices
        }).then(() => {
            return res.status(200).json({
                data: {
                    gatewayId
                }, success: true
            });
        })

    } catch (e) {
        res.status(500).json({error: e.message, success: false})
    }
}

/**
 * Validate ipv4 address
 * @param ipv4toCheck value to test
 * @return {boolean}
 */
function validateIpv4(ipv4toCheck) {
    let test = false;
    try {
        const regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
        test = regex.test(ipv4toCheck);

    } catch (e) {
        console.log('Error has occurred ', e.error)
    }

    return test;
}

module.exports = {
    getAllGateway, saveGateway, getGatewayById, deleteGatewayById, deleteGatewayGroup, updateGateway
}
