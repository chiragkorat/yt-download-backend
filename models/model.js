const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema({
    _id: {
        required: true,
        type: String
    },
    ID: {
        required: true,
        type: Number
    },
})

const ServiceDomainSchema = new mongoose.Schema({}, { strict: false });
module.exports = mongoose.model('servicedomains', ServiceDomainSchema, 'ServiceDomain');
// module.exports = mongoose.model('ServiceDomain', dataSchema)
