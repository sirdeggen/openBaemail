/***********************************************************************************************************************
 * Open Bameail
 * Copyright © 2020 Darren Kellenschwiler
 * Contact: https://baemail.me/deggen@probat.us
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 * documentation files (the “Software”), to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions
 * of the Software.
 *
 * The Software, and any software that is derived from the Software or parts thereof, can only be used on the
 * Bitcoin SV blockchains. The Bitcoin SV blockchains are defined, for purposes of this license, as the Bitcoin
 * blockchain containing block height #556767 with the hash
 * “000000000000000001d956714215d96ffc00e0afda4cd0a96c96f8d802b1662b” and the test blockchains that are supported
 * by the unmodified Software.
 *
 * THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
 * TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 **********************************************************************************************************************/

const Baemail = {}

// call baemail's back end for paymail-client
Baemail.getPki = async (paymail) => {
    return await fetch('https://baemail.me:2443/pki/', {
        method: 'POST',
        body: JSON.stringify({
            paymail: paymail
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(res => res.json())
        .then(data => data.pki)
}

// call baemail's back end to set merchant key
Baemail.setMerchantSig = async (service) => {
    await fetch('https://baemail.me:2443/api/openBaemail/setSig', {
        method: 'POST',
        body: JSON.stringify({
            ...service
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(res => res.json())
        .then(data => console.log(data))
}


Baemail.getMerchantAuthKey = async () => {
    await fetch('https://baemail.me:2443/api/openBaemail/getKey', {
        method: 'POST',
        body: JSON.stringify({
            paymail: Baemail.service.paymail
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(res => res.json())
        .then(data => {
                console.log(data)
                Baemail.service = data
            }
        )
}

Baemail.wallet = 'moneybutton'

// Takes:
// Baemail format, and amount
// Returns three outputs, two payment and one OP_RETURN script in ASM format
Baemail.create = async (baemail, amount) => {
    await Baemail.getMerchantAuthKey()
    Baemail.service.pki = await Baemail.getPki(Baemail.service.paymail)
    Baemail.user.pki = await Baemail.getPki(Baemail.user.paymail)
    const dataToEncrypt = JSON.stringify(baemail)
    Baemail.baemailData = JSON.stringify({
        summary: 'Open Baemail',
        amountUsd: amount,
        to: Baemail.user.paymail,
        cc: [],
        subject: '',
        salesPitch: 'Receipt Notification',
        from: {
            name: Baemail.service.name,
            primaryPaymail: Baemail.service.paymail,
            pki: Baemail.service.pki
        },
        authKey: Baemail.service.authKey
    })

    const biscuit = bsv.crypto.Hash.sha256(bsv.deps.Buffer.from('1BAESxZMweg2mG4FG2DEZmB1Ury2ruAr9K' + Baemail.baemailData)).toString('hex')
    Baemail.cryptoOperations = [
        {
            name: 'mySignature',
            method: 'sign',
            data: biscuit,
            dataEncoding: 'utf8',
            key: 'identity',
            algorithm: 'bitcoin-signed-message'
        }
    ]

    let OP_RETURN = ['1BAESxZMweg2mG4FG2DEZmB1Ury2ruAr9K']

    OP_RETURN.push('#{baemailData}')
    Baemail.cryptoOperations.push({
        name: 'baemailData',
        method: 'encrypt',
        paymail: 'baemail@moneybutton.com',
        data: Baemail.baemailData,
        dataEncoding: 'utf8',
        key: 'identity',
        algorithm: 'electrum-ecies'
    })

    OP_RETURN.push('#{privateBaemail}')
    Baemail.cryptoOperations.push({
        name: 'privateBaemail',
        method: 'encrypt',
        paymail: Baemail.service.paymail,
        data: dataToEncrypt,
        dataEncoding: 'utf8',
        key: 'identity',
        algorithm: 'electrum-ecies'
    })

    OP_RETURN.push('#{privateSent}')
    Baemail.cryptoOperations.push({
        name: 'privateSent',
        method: 'encrypt',
        paymail: Baemail.user.paymail,
        data: dataToEncrypt,
        dataEncoding: 'utf8',
        key: 'identity',
        algorithm: 'electrum-ecies'
    })

    Baemail.outputs = []
    OP_RETURN.push('|', '15igChEkUWgx4dsEcSuPitcLNZmNDfUvgA', biscuit, '#{mySignature}', Baemail.user.pki, Baemail.user.paymail)
    await Baemail.outputs.push({
        script: bsv.Script.buildSafeDataOut(OP_RETURN).toASM(),
        amount: '0',
        currency: 'USD'
    })
    await Baemail.outputs.push({
        to: Baemail.user.paymail,
        amount: amount,
        currency: 'USD'
    })
    await Baemail.outputs.push({
        to: '1BqCjduVx1ZuE6woVRYHJapkFVYnYunjh8',
        amount: amount,
        currency: 'USD'
    })
    console.log(OP_RETURN)
    return true
}

Baemail.fromString = async (message, amount) => {
    const baemail = {body:{time:Date.now(),blocks: [{ type:"paragraph", data:{ text: message }}]}}
    return Baemail.create(baemail, amount)
}

Baemail.fromBlocks = async (blocks, amount) => {
    const baemail = {body:{time:Date.now(),blocks: blocks}}
    return Baemail.create(baemail, amount)
}

export default Baemail
