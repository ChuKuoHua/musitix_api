"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function handleSuccess(res, data, httpStatus) {
    const status = httpStatus ? httpStatus : 200;
    res.status(status).send({
        status: "success",
        message: data
    });
}
exports.default = handleSuccess;
