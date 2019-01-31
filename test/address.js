"use strict";

/* jshint maxstatements: 30 */

var chai = require("chai");
var should = chai.should();
var expect = chai.expect;

var bitcore = require("..");
var PublicKey = bitcore.PublicKey;
var Address = bitcore.Address;
var Script = bitcore.Script;
var Networks = bitcore.Networks;

var validbase58 = require("./data/bitcoind/base58_keys_valid.json");
var invalidbase58 = require("./data/bitcoind/base58_keys_invalid.json");

describe("Address", function() {
  var pubkeyhash = new Buffer(
    "f3e49c3059604c33ac0c00179a26a3c3164b09e6",
    "hex"
  );
  var buf = Buffer.concat([new Buffer([0x0d]), pubkeyhash]);
  var str = "PWpmDhP2FERf7EEPeexkKUbLEEAnsEfKxo";

  it("can't build without data", function() {
    (function() {
      return new Address();
    }.should.throw("First argument is required, please include address data."));
  });

  it("should throw an error because of bad network param", function() {
    (function() {
      return new Address(PKHLivenet[0], "main", "pubkeyhash");
    }.should.throw('Second argument must be "livenet" or "testnet".'));
  });

  it("should throw an error because of bad type param", function() {
    (function() {
      return new Address(PKHLivenet[0], "livenet", "pubkey");
    }.should.throw('Third argument must be "pubkeyhash" or "scripthash"'));
  });

  describe("bitcoind compliance", function() {
    validbase58.map(function(d) {
      if (!d[2].isPrivkey) {
        it("should describe address " + d[0] + " as valid", function() {
          var type;
          if (d[2].addrType === "script") {
            type = "scripthash";
          } else if (d[2].addrType === "pubkey") {
            type = "pubkeyhash";
          }
          var network = "livenet";
          if (d[2].isTestnet) {
            network = "testnet";
          }
          return new Address(d[0], network, type);
        });
      }
    });
    invalidbase58.map(function(d) {
      it(
        "should describe input " + d[0].slice(0, 10) + "... as invalid",
        function() {
          expect(function() {
            return new Address(d[0]);
          }).to.throw(Error);
        }
      );
    });
  });

  // livenet valid
  var PKHLivenet = [
    "PE75khDQLTj9vFpd6QbhNMwPH4kUMJySvC",
    "PSgwUxp6XpaWui7acppkt9tuqVudeSTZQ9",
    "P8qQ1f3EFjCTr7MGHEVhD9NRmWbrzARkid",
    "PHm4iCqFXZgv4dbmBN2GHnZVkToRZPCygN",
    "    PCoCeNrYdTA3WHYR8q1XmwCQykPi149BT3   \t\n"
  ];

  // livenet p2sh
  var P2SHLivenet = [
    "6bhQiMW2zdPf9kfjjtDp1zwkPsjQyWSaKP",
    "6M5A7aYGLx5VJbFdzPCkiEaPQQeoBHdGLK",
    "6N92ZU7heNyzUPMPYBmDyjykiuXRFBhVXU",
    "6JLFDVFaoo2YdiwJjUXXSxDk5b3fUyyEpS",
    "\t 6Fhj16DcwuLb7wq3EMEsmqdYRsn2SXqwpt \r"
  ];

  // testnet p2sh
  var P2SHTestnet = [
    "8tx8CJ6gZr2rzKghKg27fz49z8kAVnLUaR",
    "8qR1vtJEcL4awzZZLBVcbQMrbQat6RL45p",
    "8us3U8Djzd91WWUWRvruvGMQhrJTeq3uXg",
    "8hSYahE4m1LhHZw49SnnFEjWoW2x2nTBww"
  ];

  //livenet bad checksums
  var badChecksums = [
    "XfcbSaK1dtEe6GmNRE5pMS3WYpoJ2D1BCn",
    "XjnkiGYQkC3bbAzvDjP7jkNouHCHNRr3vG",
    "XmWSeuzXVq1mb6GtyTXkYT3UgLo5uVR7yg",
    "XtfsoT5X39fbxyH4h8VJoQ8CVyLjojjUst"
  ];

  //livenet non-base58
  var nonBase58 = [
    "XfcbSaK1dtE#6GmNRE5pMS3WYpoJ2D1BCn",
    "XjnkiGYOkC3bbAzvDjP7jkNouHCHNRr3vG",
    "XmWSeuzXVq0mb6GtyTXkYT3UgLo5uVR7yg",
    "XtfsoT5X39fbxyH4h8VJOQ8CVyLjojjUst"
  ];

  //testnet valid
  var PKHTestnet = [
    "y7nbVxiu9gi9w4VySyuFPEt88taVm49vmg",
    "y1gDYx2585GTPJtZSsDRfjGebjGqdzD5by",
    "yAWfWCoEt6xCcPkviA5sqMdFUaFLGEmKBT",
    "xz12CE74fhCQGY1TVq2SxJvuopCKBJLw7f"
  ];

  describe("validation", function() {
    it("getValidationError detects network mismatchs", function() {
      var error = Address.getValidationError(
        "PDBQoKbQ7NBKyVbWcnPkYtteunYuMXfmye",
        "testnet"
      );
      should.exist(error);
    });

    it("isValid returns true on a valid address", function() {
      var valid = Address.isValid(
        "PDBQoKbQ7NBKyVbWcnPkYtteunYuMXfmye",
        "livenet"
      );
      valid.should.equal(true);
    });

    it("isValid returns false on network mismatch", function() {
      var valid = Address.isValid(
        "PDBQoKbQ7NBKyVbWcnPkYtteunYuMXfmye",
        "testnet"
      );
      valid.should.equal(false);
    });

    it("validates correctly the P2PKH test vector", function() {
      for (var i = 0; i < PKHLivenet.length; i++) {
        var error = Address.getValidationError(PKHLivenet[i]);
        should.not.exist(error);
      }
    });

    it("validates correctly the P2SH test vector", function() {
      for (var i = 0; i < P2SHLivenet.length; i++) {
        var error = Address.getValidationError(P2SHLivenet[i]);
        should.not.exist(error);
      }
    });

    it("validates correctly the P2SH testnet test vector", function() {
      for (var i = 0; i < P2SHTestnet.length; i++) {
        var error = Address.getValidationError(P2SHTestnet[i], "testnet");
        should.not.exist(error);
      }
    });

    it('rejects correctly the P2PKH livenet test vector with "testnet" parameter', function() {
      for (var i = 0; i < PKHLivenet.length; i++) {
        var error = Address.getValidationError(PKHLivenet[i], "testnet");
        should.exist(error);
      }
    });

    it('validates correctly the P2PKH livenet test vector with "livenet" parameter', function() {
      for (var i = 0; i < PKHLivenet.length; i++) {
        var error = Address.getValidationError(PKHLivenet[i], "livenet");
        should.not.exist(error);
      }
    });

    it("should not validate if checksum is invalid", function() {
      for (var i = 0; i < badChecksums.length; i++) {
        var error = Address.getValidationError(
          badChecksums[i],
          "livenet",
          "pubkeyhash"
        );
        should.exist(error);
        error.message.should.equal("Checksum mismatch");
      }
    });

    it("should not validate on a network mismatch", function() {
      var error, i;
      for (i = 0; i < PKHLivenet.length; i++) {
        error = Address.getValidationError(
          PKHLivenet[i],
          "testnet",
          "pubkeyhash"
        );
        should.exist(error);
        error.message.should.equal("Address has mismatched network type.");
      }
      for (i = 0; i < PKHTestnet.length; i++) {
        error = Address.getValidationError(
          PKHTestnet[i],
          "livenet",
          "pubkeyhash"
        );
        should.exist(error);
        error.message.should.equal("Address has mismatched network type.");
      }
    });

    it("should not validate on a type mismatch", function() {
      for (var i = 0; i < PKHLivenet.length; i++) {
        var error = Address.getValidationError(
          PKHLivenet[i],
          "livenet",
          "scripthash"
        );
        should.exist(error);
        error.message.should.equal("Address has mismatched type.");
      }
    });

    it("should not validate on non-base58 characters", function() {
      for (var i = 0; i < nonBase58.length; i++) {
        var error = Address.getValidationError(
          nonBase58[i],
          "livenet",
          "pubkeyhash"
        );
        should.exist(error);
        error.message.should.equal("Non-base58 character");
      }
    });

    it("testnet addresses are validated correctly", function() {
      for (var i = 0; i < PKHTestnet.length; i++) {
        var error = Address.getValidationError(PKHTestnet[i], "testnet");
        should.not.exist(error);
      }
    });

    it("addresses with whitespace are validated correctly", function() {
      var ws =
        "  \r \t    \n PDBQoKbQ7NBKyVbWcnPkYtteunYuMXfmye \t \n            \r";
      var error = Address.getValidationError(ws);
      should.not.exist(error);
      Address.fromString(ws)
        .toString()
        .should.equal("PDBQoKbQ7NBKyVbWcnPkYtteunYuMXfmye");
    });
  });

  describe("instantiation", function() {
    it("can be instantiated from another address", function() {
      var address = Address.fromBuffer(buf);
      var address2 = new Address({
        hashBuffer: address.hashBuffer,
        network: address.network,
        type: address.type
      });
      address.toString().should.equal(address2.toString());
    });
  });

  describe("encodings", function() {
    it("should make an address from a buffer", function() {
      //Address.fromBuffer(buf).toString().should.equal(str);
      var address = Address.fromBuffer(buf);
      console.log(address);
      new Address(buf).toString().should.equal(str);
      new Address(buf).toString().should.equal(str);
    });

    it("should make an address from a string", function() {
      Address.fromString(str)
        .toString()
        .should.equal(str);
      new Address(str).toString().should.equal(str);
    });

    it("should make an address using a non-string network", function() {
      Address.fromString(str, Networks.livenet)
        .toString()
        .should.equal(str);
    });

    it("should error because of unrecognized data format", function() {
      (function() {
        return new Address(new Error());
      }.should.throw(bitcore.errors.InvalidArgument));
    });

    it("should error because of incorrect format for pubkey hash", function() {
      (function() {
        return new Address.fromPublicKeyHash("notahash");
      }.should.throw("Address supplied is not a buffer."));
    });

    it("should error because of incorrect format for script hash", function() {
      (function() {
        return new Address.fromScriptHash("notascript");
      }.should.throw("Address supplied is not a buffer."));
    });

    it("should error because of incorrect type for transform buffer", function() {
      (function() {
        return Address._transformBuffer("notabuffer");
      }.should.throw("Address supplied is not a buffer."));
    });

    it("should error because of incorrect length buffer for transform buffer", function() {
      (function() {
        return Address._transformBuffer(new Buffer(20));
      }.should.throw("Address buffers must be exactly 21 bytes."));
    });

    it("should error because of incorrect type for pubkey transform", function() {
      (function() {
        return Address._transformPublicKey(new Buffer(20));
      }.should.throw("Address must be an instance of PublicKey."));
    });

    it("should error because of incorrect type for script transform", function() {
      (function() {
        return Address._transformScript(new Buffer(20));
      }.should.throw("Invalid Argument: script must be a Script instance"));
    });

    it("should error because of incorrect type for string transform", function() {
      (function() {
        return Address._transformString(new Buffer(20));
      }.should.throw("data parameter supplied is not a string."));
    });

    it("should make an address from a pubkey hash buffer", function() {
      var hash = pubkeyhash; //use the same hash
      var a = Address.fromPublicKeyHash(hash, "livenet");
      a.network.should.equal(Networks.livenet);
      a.toString().should.equal(str);
      var b = Address.fromPublicKeyHash(hash, "testnet");
      b.network.should.equal(Networks.testnet);
      b.type.should.equal("pubkeyhash");
      new Address(hash, "livenet").toString().should.equal(str);
    });

    it("should make an address using the default network", function() {
      var hash = pubkeyhash; //use the same hash
      var network = Networks.defaultNetwork;
      Networks.defaultNetwork = Networks.livenet;
      var a = Address.fromPublicKeyHash(hash);
      a.network.should.equal(Networks.livenet);
      // change the default
      Networks.defaultNetwork = Networks.testnet;
      var b = Address.fromPublicKeyHash(hash);
      b.network.should.equal(Networks.testnet);
      // restore the default
      Networks.defaultNetwork = network;
    });

    it("should throw an error for invalid length hashBuffer", function() {
      (function() {
        return Address.fromPublicKeyHash(buf);
      }.should.throw("Address hashbuffers must be exactly 20 bytes."));
    });

    it("should make this address from a compressed pubkey", function() {
      var pubkey = new PublicKey(
        "03e586a20c91f882b435e1009ead7c074c3634ba226f8076105645f98d05cf7936"
      );
      var address = Address.fromPublicKey(pubkey, "livenet");
      address.toString().should.equal("PWpmDhP2FERf7EEPeexkKUbLEEAnsEfKxo");
    });

    it("should use the default network for pubkey", function() {
      var pubkey = new PublicKey(
        "03e586a20c91f882b435e1009ead7c074c3634ba226f8076105645f98d05cf7936"
      );
      var address = Address.fromPublicKey(pubkey);
      address.network.should.equal(Networks.defaultNetwork);
    });

    it("should make this address from an uncompressed pubkey", function() {
      var pubkey = new PublicKey(
        "04e586a20c91f882b435e1009ead7c074c3634ba226f8076105645f98d05cf79369e126f791bac18dc2c8f9a8963ee5a2d028a6523b583db353fa4a3404247ec09"
      );
      var a = Address.fromPublicKey(pubkey, "livenet");
      a.toString().should.equal("PWpmDhP2FERf7EEPeexkKUbLEEAnsEfKxo");
      var b = new Address(pubkey, "livenet", "pubkeyhash");
      b.toString().should.equal("PWpmDhP2FERf7EEPeexkKUbLEEAnsEfKxo");
    });

    it("should classify from a custom network", function() {
      var custom = {
        name: "customnetwork",
        pubkeyhash: 0x1c,
        privatekey: 0x1e,
        scripthash: 0x28,
        xpubkey: 0x02e8de8f,
        xprivkey: 0x02e8da54,
        networkMagic: 0x0c110907,
        port: 7333
      };
      var addressString = "CX4WePxBwq1Y6u7VyMJfmmitE7GiTgC9aE";
      Networks.add(custom);
      var network = Networks.get("customnetwork");
      var address = Address.fromString(addressString);
      address.type.should.equal(Address.PayToPublicKeyHash);
      address.network.should.equal(network);
      Networks.remove(network);
    });

    describe("from a script", function() {
      it("should fail to build address from a non p2sh,p2pkh script", function() {
        var s = new Script("OP_CHECKMULTISIG");
        (function() {
          return new Address(s);
        }.should.throw(
          "needs to be p2pkh in, p2pkh out, p2sh in, or p2sh out"
        ));
      });
      it("should make this address from a p2pkh output script", function() {
        var s = new Script(
          "OP_DUP OP_HASH160 20 " +
            "0xf3e49c3059604c33ac0c00179a26a3c3164b09e6 OP_EQUALVERIFY OP_CHECKSIG"
        );
        var buf = s.toBuffer();
        var a = Address.fromScript(s, "livenet");
        a.toString().should.equal("PWpmDhP2FERf7EEPeexkKUbLEEAnsEfKxo");
        var b = new Address(s, "livenet");
        b.toString().should.equal("PWpmDhP2FERf7EEPeexkKUbLEEAnsEfKxo");
      });

      it("should make this address from a p2sh input script", function() {
        var s = Script.fromString(
          "OP_HASH160 20 0xf3e49c3059604c33ac0c00179a26a3c3164b09e6 OP_EQUAL"
        );
        var a = Address.fromScript(s, "livenet");
        a.toString().should.equal("PWpmDhP2FERf7EEPeexkKUbLEEAnsEfKxo");
        var b = new Address(s, "livenet");
        b.toString().should.equal("PWpmDhP2FERf7EEPeexkKUbLEEAnsEfKxo");
      });

      it("returns the same address if the script is a pay to public key hash out", function() {
        var address = "PWpmDhP2FERf7EEPeexkKUbLEEAnsEfKxo";
        var script = Script.buildPublicKeyHashOut(new Address(address));
        Address(script, Networks.livenet)
          .toString()
          .should.equal(address);
      });
      it("returns the same address if the script is a pay to script hash out", function() {
        var address = "6Sju6My7ffvHsR53NrmDifqxT9A3c55pCc";
        var script = Script.buildScriptHashOut(new Address(address));
        Address(script, Networks.livenet)
          .toString()
          .should.equal(address);
      });
    });

    it("should derive from this known address string livenet", function() {
      var address = new Address(str);
      var buffer = address.toBuffer();
      var slice = buffer.slice(1);
      var sliceString = slice.toString("hex");
      sliceString.should.equal(pubkeyhash.toString("hex"));
    });

    it("should derive from this known address string testnet", function() {
      var a = new Address(PKHTestnet[0], "testnet");
      var b = new Address(a.toString());
      b.toString().should.equal(PKHTestnet[0]);
      b.network.should.equal(Networks.testnet);
    });

    it("should derive from this known address string livenet scripthash", function() {
      var a = new Address(P2SHLivenet[0], "livenet", "scripthash");
      var b = new Address(a.toString());
      b.toString().should.equal(P2SHLivenet[0]);
    });

    it("should derive from this known address string testnet scripthash", function() {
      var address = new Address(P2SHTestnet[0], "testnet", "scripthash");
      address = new Address(address.toString());
      address.toString().should.equal(P2SHTestnet[0]);
    });
  });

  describe("#toBuffer", function() {
    it("f3e49c3059604c33ac0c00179a26a3c3164b09e6 corresponds to hash PWpmDhP2FERf7EEPeexkKUbLEEAnsEfKxo", function() {
      var address = new Address(str);
      address
        .toBuffer()
        .slice(1)
        .toString("hex")
        .should.equal(pubkeyhash.toString("hex"));
    });
  });

  describe("#object", function() {
    it("roundtrip to-from-to", function() {
      var obj = new Address(str).toObject();
      var address = Address.fromObject(obj);
      address.toString().should.equal(str);
    });

    it("will fail with invalid state", function() {
      expect(function() {
        return Address.fromObject("¹");
      }).to.throw(bitcore.errors.InvalidState);
    });
  });

  describe("#toString", function() {
    it("livenet pubkeyhash address", function() {
      var address = new Address(str);
      address.toString().should.equal(str);
    });

    it("scripthash address", function() {
      var address = new Address(P2SHLivenet[0]);
      address.toString().should.equal(P2SHLivenet[0]);
    });

    it("testnet scripthash address", function() {
      var address = new Address(P2SHTestnet[0]);
      address.toString().should.equal(P2SHTestnet[0]);
    });

    it("testnet pubkeyhash address", function() {
      var address = new Address(PKHTestnet[0]);
      address.toString().should.equal(PKHTestnet[0]);
    });
  });

  describe("#inspect", function() {
    it("should output formatted output correctly", function() {
      var address = new Address(str);
      var output =
        "<Address: PWpmDhP2FERf7EEPeexkKUbLEEAnsEfKxo, type: pubkeyhash, network: livenet>";
      address.inspect().should.equal(output);
    });
  });

  describe("questions about the address", function() {
    it("should detect a P2SH address", function() {
      new Address(P2SHLivenet[0]).isPayToScriptHash().should.equal(true);
      new Address(P2SHLivenet[0]).isPayToPublicKeyHash().should.equal(false);
      new Address(P2SHTestnet[0]).isPayToScriptHash().should.equal(true);
      new Address(P2SHTestnet[0]).isPayToPublicKeyHash().should.equal(false);
    });
    it("should detect a Pay To PubkeyHash address", function() {
      new Address(PKHLivenet[0]).isPayToPublicKeyHash().should.equal(true);
      new Address(PKHLivenet[0]).isPayToScriptHash().should.equal(false);
      new Address(PKHTestnet[0]).isPayToPublicKeyHash().should.equal(true);
      new Address(PKHTestnet[0]).isPayToScriptHash().should.equal(false);
    });
  });

  it("throws an error if it couldn't instantiate", function() {
    expect(function() {
      return new Address(1);
    }).to.throw(TypeError);
  });
  it("can roundtrip from/to a object", function() {
    var address = new Address(P2SHLivenet[0]);
    expect(new Address(address.toObject()).toString()).to.equal(P2SHLivenet[0]);
  });

  it("will use the default network for an object", function() {
    var obj = {
      hash: "19a7d869032368fd1f1e26e5e73a4ad0e474960e",
      type: "scripthash"
    };
    var address = new Address(obj);
    address.network.should.equal(Networks.defaultNetwork);
  });

  describe("creating a P2SH address from public keys", function() {
    var public1 =
      "039d2184e6263c51d18704dae96daf850c9b3517c1f6c94a211e13bd6538cb5092";
    var public2 =
      "029a4d664328519732400c02b5918e7b95689ae5467785c38b97818712a7659481";
    var public3 =
      "03329b1de8a49e002153c0cdc95d8ed2c7320646f5bd37e6422eb9913b5ec6d21f";
    var publics = [public1, public2, public3];

    it("can create an address from a set of public keys", function() {
      var address = Address.createMultisig(publics, 2, Networks.livenet);
      address.toString().should.equal("6Thue81Q8rjs2m1UqKtbxcM7ZMhgVk8uBX");
      address = new Address(publics, 2, Networks.livenet);
      address.toString().should.equal("6Thue81Q8rjs2m1UqKtbxcM7ZMhgVk8uBX");
    });

    it("works on testnet also", function() {
      var address = Address.createMultisig(publics, 2, Networks.testnet);
      address.toString().should.equal("8sjXYmo8PwX7wMqzyqtWsMyqLPFLkAzTxY");
    });

    it("can also be created by Address.createMultisig", function() {
      var address = Address.createMultisig(publics, 2);
      var address2 = Address.createMultisig(publics, 2);
      address.toString().should.equal(address2.toString());
    });

    it("fails if invalid array is provided", function() {
      expect(function() {
        return Address.createMultisig([], 3, "testnet");
      }).to.throw(
        "Number of required signatures must be less than or equal to the number of public keys"
      );
    });
  });
});
