var Colu = require('..')
var testUtils = require('./test-utils')
var expect = require('chai').expect

describe('Test Colu SDK', function () {

  var settings
  try {
    settings = require('./settings')
  }
  catch (e) {
    settings = {
      network: 'testnet',
      events: true,
      eventsSecure: true,
    }
  }
  var colu

  it('Should create and broadcast issue tx.', function (done) {
    this.timeout(100000)
    colu = new Colu(settings)
    colu.on('connect', function () {
      var args = testUtils.createIssueAssetArgs();
      colu.issueAsset(args, function (err, ans) {
        if (err) return done(err)
        // console.log('ans', ans)
        testUtils.verifyIsssueAssetResponse(ans)
        done()
      })
    })
    colu.init()
  })

  it('Should return assets list for this wallet.', function (done) {
    this.timeout(20000)
    // setTimeout(function () {
      colu.getAssets(function (err, assets) {
        if (err) return done(err)
        expect(assets).to.be.a('array')
        expect(assets).to.have.length.above(0)
        done()
      })
    // }, 10000)
  })

  it('Should create and broadcast send tx from utxo.', function (done) {
    this.timeout(100000)
    var args = testUtils.createSendAssetFromUtxoArgs()
    colu.sendAsset(args, function (err, ans) {
      if (err) return done(err)
      testUtils.verifySendAssetResponse(ans)
      done()
    })
  })

  it('Should create and broadcast send tx from address.', function (done) {
    this.timeout(100000)
    var args = testUtils.createSendAssetFromAddressArgs();
    colu.sendAsset(args, function (err, ans) {
      if (err) return done(err)
      testUtils.verifySendAssetResponse(ans)
      done()
    })
  })

  it('Should create and broadcast send tx to phone.', function (done) {
    this.timeout(100000)
    var args = testUtils.createSendAssetToPhoneArgs();
    colu.sendAsset(args, function (err, ans) {
      if (err) return done(err)
      testUtils.verifySendAssetResponse(ans)
      done()
    })
  })

  it('Should return transactions list for this wallet.', function (done) {
    this.timeout(5000)
    colu.getTransactions(function (err, transactions) {
      if (err) return done(err)
      expect(transactions).to.be.a('array')
      expect(transactions).to.have.length.above(0)
      done()
    })
  })

  it('Should return issuances list for this wallet.', function (done) {
    this.timeout(5000)
    colu.getIssuedAssets(function (err, issuances) {
      if (err) return done(err)
      testUtils.verifyGetIssuedAssetsResponse(issuances)
      done()
    })
  })

  it('Should return asset metadata.', function (done) {
    this.timeout(10000)
    var args = testUtils.createGetAssetMetadataArgs()
    colu.getAssetMetadata(args.assetId, args.utxo, true, function (err, metadata) {
      if (err) return done(err)
      testUtils.verifyGetAssetMetadataResponse(metadata)
      done()
    })
  })

  it('Should return cached asset metadata.', function (done) {
    // this time with shorter default timeout
    var args = testUtils.createGetAssetMetadataArgs()
    colu.getAssetMetadata(args.assetId, args.utxo, false, function (err, metadata) {
      if (err) return done(err)
      testUtils.verifyGetAssetMetadataResponse(metadata)
      done()
    })
  })
})

describe("escrow server tests", function() {
  var settings = {
    "network": "testnet",
    "privateSeed":"1d7f034f59ed9150e055f7931f7f7543ed0bb6e551946f407b7171fed2e8b40f",
    "apiKey": ""
  }

  var args = 	{
    "from": ["mkMiyarPHVLy2hNz4vHmtBSmj1qZ1rf2Qg"],
    "to": [{
      "assetId": "La8NMrw1s78sj6dihB6q4VLtQEBwFjZb2ixtWx",
      "amount": "1"
    }],
    "metadata": {
      "assetName": "Mission Impossible 15",
      "issuer": "Fox Theater",
      "description": "Movie ticket to see the New Tom Cruise flick"
    }
  }

  it('should sign a p2sh transaction', function(done) {
    this.timeout(50000)
    var colu = new Colu(settings)
    colu.on('connect', function () {
      // send to multisig address
      var p2shAddress = colu.getP2SHAddress()
      args.to[0].address = p2shAddress

      colu.sendAsset(args, function (err, ans) {
        if (err) throw err
        testUtils.verifySendAssetResponse(ans)

        // send back from multisig address
        args.to[0].address = args.from[0]
        args.from = [p2shAddress]

        colu.sendAsset(args, function (err, ans) {
          if (err) throw err
          testUtils.verifySendAssetResponse(ans)
          done()
        })
      })
    })
    colu.init()
  })
})
