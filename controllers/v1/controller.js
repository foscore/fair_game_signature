const ecc = require("eosjs-ecc");
// The Keccak hash function is also available
// const { Keccak } = require('sha3');
const uuidv4 = require("uuid/v4");
const CryptoJS = require("crypto-js");
const SHA256 = require("crypto-js/sha256");
const config = require("config");
const Queue = require("bee-queue");
const seedQueue = new Queue(config.get("bequeueName"));

let privateKey = require("../../config/credentials").defaults.privateKey;

/**
 * response:
{
    "expiration_timestamp": 1542795768,
    "msg": "OK",
    "seed": "3dc291760f578a6dfa1ef226bb0441b03f8634737920d3e37f42c826dcba7efd",
    "signature": 
    "SIG_K1_KkCPb89jHbJLciMsmSVT8vkFgXoWdCFfwy3KbR42otYBNtRoMzCBfXYFUd4ghPax73qtFqxS4t2SDyNVoD6tjrwfhBYpvB"
}
 */
exports.bet = function(req, res, next) {
  let referrer = req.body.referrer;
  // TODO: referrer为空的情况如何处理，即默认的referrer是什么？

  let randomSeed = uuidv4();
  let seed = referrer + "-" + randomSeed + "-" + Date.now();
  let seedInSha256 = SHA256(seed).toString(CryptoJS.enc.Hex);
  let seed_hash = SHA256(seedInSha256).toString(CryptoJS.enc.Hex);

  let time = new Date();
  // expire after 1 minute
  time.setSeconds(time.getSeconds() + 60);
  let expiration_timestamp = time.getTime();

  // data由：seed_hash + 过期时间 + referrer组成，所以任何一个都不能被修改
  let data = seed_hash + "-" + expiration_timestamp + "-" + referrer;
  let digest = SHA256(data).toString(CryptoJS.enc.Hex);
  let sig = ecc.signHash(digest, privateKey);

  // push seeHash to queue, waiting for revealing
  setTimeout(() => {
    const job = seedQueue.createJob({
      seed_hash: seed_hash,
      seedInSha256: seedInSha256,
      expiration_timestamp: expiration_timestamp
    });
    job.save().then(job => {
      console.log("queued job:", job.id, job.data);
    });
  }, 1000);

  // for testing
  // var pubkey = ecc.privateToPublic(privateKey);
  // console.log('private to publick, pubKey:', pubkey);
  // console.log('recover from hash , pubKey:', ecc.recoverHash(sig, digest));
  // var r = ecc.verifyHash(sig, digest, pubkey);
  // console.log('verification use pubkey:', r);

  return res.status(200).json({
    signature: sig,
    seed: seed_hash,
    expiration_timestamp: expiration_timestamp
  });
};
