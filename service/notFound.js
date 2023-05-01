"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const notFound = (req, res, next) => {
    res.status(404).send({
        "status": "false",
        "massage": '無此路由'
    });
};
exports.default = notFound;
