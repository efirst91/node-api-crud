const mongoose = require('mongoose');

const gatewaySchema = mongoose.Schema(
    {
        serialNumber: {
            type: String,
            require: true
        },
        humanReadableName: {
            type: String,
            require: true
        },
        ipv4: {
            type: Object,
            require: true

        },
        peripheralsDevices: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'peripheral',
                require: false
            }
        ]
    }
)

module.exports = mongoose.model('gateway', gatewaySchema)
