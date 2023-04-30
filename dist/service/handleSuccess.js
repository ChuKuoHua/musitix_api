"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function handleSuccess(res, data, httpStatus) {
    const status = httpStatus ? httpStatus : 200;
    res.status(status).send({
        message: "成功",
        data
    });
}
exports.default = handleSuccess;
