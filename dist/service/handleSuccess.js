"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function handleSuccess(res, data) {
    res.status(200).send({
        "status": "success",
        data
    });
}
module.exports = handleSuccess;
