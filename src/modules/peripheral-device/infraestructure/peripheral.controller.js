const PeripheralModel = require("../../peripheral-device/domain/peripheral.model");
const GatewayModel = require("../../gateway/domain/gateway.model");

/**
 * Get all peripheral devices
 * @param req received request from client
 * @param res response that will be sent to client
 * @return {Promise<void>}
 */
const getAllPeripheral = async (req, res) => {
    try {
        const peripheralAll = await PeripheralModel.find().select('-__v');
        res.status(200).json({data: peripheralAll, total: peripheralAll.length});

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
const savePeripheral = async (req, res) => {
    try {


        const newPeripheralD = new PeripheralModel({
            uid: req.body.uid,
            vendor: req.body.vendor,
            dateCreated: new Date(),
            status: req.body.status
        });

        await newPeripheralD.save();
        res.status(200).json({data: {id: newPeripheralD._id}, success: true});

    } catch (e) {
        res.status(500).json({error: e.message, success: false})
    }
}

/**
 * Get peripheral by id
 * @param req received request from client
 * @param res response that will be sent to client
 * @return {Promise<void>}
 */
const getPeripheralById = async (req, res) => {
    try {
        const peripheralById = req.params.id;
        const peripheral = await PeripheralModel.findOne({_id: peripheralById}).select('-__v');

        if (!peripheral) {
            res.status(400).json({
                data: {
                    message: 'This peripheral does not exist'
                }, success: false
            })
            return;
        }

        res.status(200).json({
            data: {
                peripheral
            }
        });

    } catch (e) {
        res.status(500).json({error: e.message, success: false})
    }
}

/**
 * Delete peripheral by id
 * @param req received request from client
 * @param res response that will be sent to client
 * @return {Promise<void>}
 */
const deletePeripheralById = async (req, res) => {
    try {
        const peripheralById = req.params.id;
        let gateway
        const peripheral = await PeripheralModel.findOne({_id: peripheralById})
        if (!peripheral) {
            return res.status(400).json({
                data: {
                    message: 'This peripheral does not exist'
                }, success: false
            })
        }

        gateway = await GatewayModel.findOne({_id: peripheral.gatewayId});
        if (gateway) {
            const array = gateway.peripheralsDevices.map(value => value.toString());
            const indexToDelete = array.findIndex(value => value === peripheralById);
            array.splice(indexToDelete, 1);
            const peripheralsDevices = [...array];

            console.log('gateway', indexToDelete)


            await GatewayModel.updateOne(gateway, {
                peripheralsDevices
            })

        }

        await PeripheralModel.deleteOne({_id: peripheralById});

        return res.status(200).json({
            data: {
                peripheralById
            }, success: true
        });


    } catch (e) {
        res.status(500).json({error: e.message, success: false})
    }
}

/**
 * Delete peripheral by id
 * @param req received request from client
 * @param res response that will be sent to client
 * @return {Promise<void>}
 */
const deletePeripheralGroup = async (req, res) => {
    try {
        const idsGroup = req.body;
        for (const itemId of idsGroup) {
            const peripheral = await PeripheralModel.findOne({_id: itemId})
            if (!peripheral) {
                res.status(400).json({
                    data: {
                        message: 'This peripheral does not exist'
                    }, success: false
                })
            }

            await PeripheralModel.deleteOne({_id: itemId});
        }

        res.status(200).json({
            data: {
                message: 'All peripheral were be deleted successfully'
            }, success: true
        });


    } catch (e) {
        res.status(500).json({error: e.message, success: false})
    }
}

/**
 * Update gateway by id
 * @param req received request from client
 * @param res response that will be sent to client
 * @return {Promise<void>}
 */
const updatePeripheral = async (req, res) => {

    try {
        const {uid, vendor, status} = req.body;
        const peripheralId = req.params.id;
        const peripheral = await PeripheralModel.findOne({_id: peripheralId})
        if (!peripheral) {
            res.status(400).json({
                data: {
                    message: 'This Peripheral does not exist'
                }, success: false
            })
        }

        await PeripheralModel.updateOne(peripheral, {
            uid, vendor, status
        }).then(() => {
            res.status(200).json({
                data: {
                    peripheralId
                }, success: true
            });
        })

    } catch (e) {
        res.status(500).json({error: e.message, success: false})
    }
}

module.exports = {
    getAllPeripheral, savePeripheral, getPeripheralById, deletePeripheralById, deletePeripheralGroup, updatePeripheral
}
