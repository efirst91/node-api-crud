const mongoose = require('mongoose');

const peripheralSchema = mongoose.Schema(
    {
        uid: {
            type: Number,
            require: true
        },
        vendor: {
            type: String,
            require: true

        },
        dateCreated: {
            type: Date
        },
        status: {
            type: Boolean,
            require: true
        },
        gatewayId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'gateway'
        }
    }
)

module.exports = mongoose.model('peripheral', peripheralSchema)
