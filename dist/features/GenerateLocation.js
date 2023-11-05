"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function GenerateLocation(req) {
    const protocol = req.protocol;
    const host = req.header("host");
    const location = protocol + "://" + host;
    return location;
}
exports.default = GenerateLocation;
