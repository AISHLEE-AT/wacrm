const crypto = require('crypto');

function hashPinSha(pin) {
  return crypto.createHash('sha256').update(`FAGO_PIN_${pin}`).digest('hex');
}

module.exports = {
  hashPinSha,
};
