/* eslint-disable */
// TODO: Remove previous line and work through linting issues at next edit

/* jshint unused: false */
/* jshint latedef: false */
var should = require('chai').should();
var expect = require('chai').expect;
var _ = require('lodash');
var sinon = require('sinon');

var bitcore = require('../..');
var GovObject = bitcore.GovObject;
var Proposal = bitcore.GovObject.Proposal;
var errors = bitcore.errors;


var BufferReader = require('../../lib/encoding/bufferreader');

var expectedHex = "7b22656e645f626c6f636b223a323539332c226e616d65223a225465737450726f706f73616c222c227061796d656e745f61646472657373223a227938596e4571364a666b31334672396b62414c5666754263466b36693842374e6766222c227061796d656e745f616d6f756e74223a3130302c2273746172745f626c6f636b223a313732382c2275726c223a2268747470733a2f2f70686f72652e696f227d";

/* FromObject */
describe('GovObject', function(){


  describe('GovObject - FromObject', function(){
    it('should cast a JSON Proposal into a Proposal Object', function(){
      var govObject = new GovObject;
      var jsonProposal = {
        network:"testnet",
        name:"TestProposal",
        start_block:1728,
        end_block:2593,
        payment_address:'y8YnEq6Jfk13Fr9kbALVfuBcFk6i8B7Ngf',
        payment_amount:100,
        url:"https://phore.io"
      };

      govObject = govObject.fromObject(jsonProposal);
      var govObjRes = function(){
        return govObject.fromObject(jsonProposal);
      };
      expect(govObject instanceof Proposal);
      expect(govObjRes).to.not.throw(Error);
      expect(govObjRes).to.not.throw('Unhandled GovObject type');
      govObject.serialize().should.equal(expectedHex);
    })
    it('should validate address', function(){
      var govObject = new GovObject;
      govObject._verifyAddress('yBwNjsW4UQZyniGqb2H3xZL97g23G5485v','testnet').should.equal(true);
      govObject._verifyAddress('PAtriqJauNxMz8m4TAP9aZxo1DSBLRHpue','livenet').should.equal(true);
      govObject._verifyAddress('XuYDEzZzKxn&&knPDiVKe91sJasfajkshfjD1nQnnn5B6','livenet').should.equal(false);
      govObject._verifyAddress('knPDiVKe91sJasfajkshfjD1nQnnn5B6','testnet').should.equal(false);
      govObject._verifyAddress('XuYDEzZzKxn&&knPDiVKe91sJa/sfajkshfjD1nQnnn5B6','livenet').should.equal(false);
      govObject._verifyAddress('XuYDEzZzKxnknPDiVKe91sJaD1nQnnn5B','livenet').should.equal(false);
      govObject._verifyAddress(' XuYDEzZzKxnknPDiVKe91sJaD1nQnnn5B','livenet').should.equal(false);
      govObject._verifyAddress('XuYDEzZzKxnknPDiVKe91sJaD1nQnnn5B ','livenet').should.equal(false);
      govObject._verifyAddress('$XuYDEzZzKxnknPDiVKe91sJaD1nQnnn5B','livenet').should.equal(false);
      govObject._verifyAddress('yXGeNPQXYFXhLAN1ZKrAjxzzBnZ2JZNKnh','livenet').should.equal(false);
      govObject._verifyAddress('XuYDEzZzKxnknPDiVKe91sJaD1nQnnn5B6','testnet').should.equal(false);
    })
    // TODO: Fix this 
    it('should cast a stringified JSON Proposal into a Proposal Object', function(){
      var govObject = new GovObject;
      var jsonProposal = {
        network:"testnet",
        name:"TestProposal",
        start_block:1728,
        end_block:2593,
        payment_address:'y8YnEq6Jfk13Fr9kbALVfuBcFk6i8B7Ngf',
        payment_amount:10,
        url:"https://phore.io"
      };

      var govObject = govObject.fromObject(JSON.stringify(jsonProposal));

      expect(govObject instanceof Proposal);
      console.log(govObject);
      govObject.serialize().should.equal(expectedHex);
    })
    it('should shallowCopy a govObject if passed as arg', function(){
      var govObject = new GovObject;
      var jsonProposal = {
        network:"testnet",
        name:"TestProposal",
        start_block:2554,
        end_block:11111,
        payment_address:'y8YnEq6Jfk13Fr9kbALVfuBcFk6i8B7Ngf',
        payment_amount:10,
        url:"https://phore.io"
      };
      var govObject = govObject.fromObject(jsonProposal);
      var newGovObject = new GovObject(govObject);
      var shallowCopy = GovObject.shallowCopy(govObject);

      //Have the same values
      expect(shallowCopy).to.deep.equal(govObject);
      //but are distinct object (not reference - === verif)
      expect(shallowCopy).to.not.equal(govObject);

      expect(newGovObject).to.deep.equal(govObject);
      expect(newGovObject).to.not.equal(govObject);

      expect(newGovObject).to.deep.equal(shallowCopy);
      expect(newGovObject).to.not.equal(shallowCopy);

    })
    it('should create a govObject from a buffer', function(){
      var govObject = new GovObject;
      var jsonProposal = {
        network:"testnet",
        name:"TestProposal",
        start_block:1728,
        end_block:2593,
        payment_address:'y8YnEq6Jfk13Fr9kbALVfuBcFk6i8B7Ngf',
        payment_amount:100,
        url:"https://phore.io"
      };
      var govObject = govObject.fromObject(jsonProposal);

      var govFromBuffer = new GovObject;
      govFromBuffer.fromBuffer(govObject.toBuffer()).should.deep.equal(govObject);
      govFromBuffer.fromBuffer(govObject.toBuffer()).should.not.equal(govObject);
      new GovObject(govObject.toBuffer()).should.deep.equal(govObject);
      new GovObject(govObject.toBuffer()).should.not.equal(govObject);

      var reader = new BufferReader(govObject.toBuffer());
      var fromBuff =govFromBuffer.fromBufferReader(reader);
      fromBuff.should.deep.equal(govObject);
      fromBuff.should.not.equal(govObject);
    })
    it('should create a govObject from an Object', function(){
      var govObject = new GovObject;
      var jsonProposal = {
        network:"testnet",
        name:"TestProposal",
        start_block:1728,
        end_block:2593,
        payment_address:'y8YnEq6Jfk13Fr9kbALVfuBcFk6i8B7Ngf',
        payment_amount:100,
        url:"https://phore.io"
      };
      var govObject = govObject.fromObject(jsonProposal);
      var govObject2 = new GovObject;

      //Use a polyfill for object.assign FIXME when node>=4 (actual 0.10.25)
      new GovObject(Object._assign(new Object , govObject)).should.deep.equal(govObject);
      new GovObject(Object._assign(new Object , govObject)).should.not.equal(govObject);

      new GovObject(Object._assign(new Object , govObject)).should.deep.equal(govObject2.fromObject(jsonProposal))
      new GovObject(Object._assign(new Object , govObject)).should.not.equal(govObject2.fromObject(jsonProposal))
    })
    it('should create a govObject from an hexa string', function(){
      var govObject = new GovObject;
      var jsonProposal = {
        network:"testnet",
        name:"TestProposal",
        start_block:1728,
        end_block:2593,
        payment_address:'y8YnEq6Jfk13Fr9kbALVfuBcFk6i8B7Ngf',
        payment_amount:100,
        url:"https://phore.io"
      };
      var govObject = govObject.fromObject(jsonProposal);
      var govFromHexa = new GovObject;

      govFromHexa.fromString(govObject.toString()).should.deep.equal(govObject);
      govFromHexa.fromString(govObject.toString()).should.not.equal(govObject);
      new GovObject(govObject.toString()).should.deep.equal(govObject);
      new GovObject(govObject.toString()).should.not.equal(govObject);
    })

    it('should return an error is stringified JSON Proposal is not valid', function(){
      var govObject = new GovObject;
      var jsonProposal = {
        network:"testnet",
        name:"TestProposal",
        start_block:1728,
        end_block:2593,
        payment_address:'y8YnEq6Jfk13Fr9kbALVfuBcFk6i8B7Ngf',
        payment_amount:100,
        url:"https://phore.io"
      };
      var stringified = JSON.stringify(jsonProposal);
      stringified+="foobar";

       var govObjectRes = function(){
         return govObject.fromObject(stringified);
       };

       expect(govObjectRes).to.throw(Error);
       expect(govObjectRes).to.throw('Must be a valid stringified JSON');
    })

    it('should output null data-hex value by default', function(){
      var govObject = new GovObject;
      expect(govObject.dataHex()).to.be.null;
    })

    it('should throw error when creating a bad new GovObject', function(){
      var govObjRes = function(){
        return  new GovObject(true);
      };
      expect(govObjRes).to.throw(Error);
      expect(govObjRes).to.throw('Must provide an object or string to deserialize a transaction');
    })
    it('should serialize',function(){
      var govObject = new GovObject;
      var jsonProposal = {
        network:"testnet",
        name:"TestProposal",
        start_block:1728,
        end_block:2593,
        payment_address:'y8YnEq6Jfk13Fr9kbALVfuBcFk6i8B7Ngf',
        payment_amount:100,
        url:"https://phore.io"
      };
      var govObject = govObject.fromObject(jsonProposal);
      govObject.serialize().should.equal(expectedHex);
      govObject.serialize().should.equal(govObject.uncheckedSerialize());
    });
    it('should be able to inspect a govObject', function(){
      var govObject = new GovObject;
      var jsonProposal = {
        network:"testnet",
        name:"TestProposal",
        start_block:1728,
        end_block:2593,
        payment_address:'y8YnEq6Jfk13Fr9kbALVfuBcFk6i8B7Ngf',
        payment_amount:100,
        url:"https://phore.io"
      };
      var govObject = govObject.fromObject(jsonProposal);
      govObject.inspect().should.equal("<GovObject: "+expectedHex+">");
      govObject.inspect().should.equal("<GovObject: "+govObject.uncheckedSerialize()+">");

    })

  });
});

//Polyfill for object.assign (not supported in 0.10.25);
Object._assign = function (target, varArgs) { // .length of function is 2
  'use strict';
  if (target == null) { // TypeError if undefined or null
    throw new TypeError('Cannot convert undefined or null to object');
  }

  var to = Object(target);

  for (var index = 1; index < arguments.length; index++) {
    var nextSource = arguments[index];

    if (nextSource != null) { // Skip over if undefined or null
      for (var nextKey in nextSource) {
        // Avoid bugs when hasOwnProperty is shadowed
        if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
          to[nextKey] = nextSource[nextKey];
        }
      }
    }
  }
  return to;
};
