// Imports
const db = require('./db');

exports.check = (socket, data, done) => {
    const sql = `SELECT id FROM banned_ips WHERE ip = ?`;
    const values = [data.ip];
    db.query(sql, values, (error, results, fields) => {
        if (error) {
            done(error, socket, data);
            return;
        }

        if (results.length === 0) {
            data.banned = false;
        } else {
            data.banned = true;
        }

        done(null, socket, data);
    });
};
