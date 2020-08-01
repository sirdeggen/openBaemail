# Open Baemail
Baemail Protocol, send from anywhere. Requires merchant registration for just now.

Please register here --> [Registrations & Demo](https://baemail.me/open/baemailExternal.html)

# Baemail
Check out regular Baemail here --> [baemail.me](https://baemail.me)

#PowPing style
Invisible creation, with swipe to send.
``` javascript
import Baemail from 'open-baemail'

const message = await Baemail.send(imb, toPaymail, name, paymail, pki, subject, body, amount)

// dev can then render as they see fit from user to send:
moneyButton.render(div, message)
```

# Latest Feature ^0.3.0
Send from any paymail based app.

``` javascript
import Baemail from 'open-baemail'
// Assuming in your existing app you use the following
// An authenticated Invisible MoneyButton instance
// The primary paymail of that MB account
// The user's name
// The user's paymail pki
const { imb, paymail, name, pki } = userContext

const toPaymail = 'example@moneybutton.com' // Send something to this paymail
const subject = 'Something'
const body = '<div><p>Hello Baemail</p></div>'
const amount = 0.01 // minimum in USD, be careful with this as your user will pay this.

Baemail.send(imb, toPaymail, name, paymail, pki, subject, body, amount)
    .then(mb => {
    console.log(mb.payment.txid)
})

// That's it, console confirms the baemail is sent, and the 

```


# Example Integration
``` html
<!DOCTYPE html>
<html>
    <head>
        <title>YOUR APP NAME</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <script src="https://www.moneybutton.com/moneybutton.js"></script>
        <script src='https://unpkg.com/bsv@1.0.0/bsv.min.js'></script>
        <script src='https://unpkg.com/bsv@1.0.0/bsv-mnemonic.min.js'></script>
        <script src="https://baemail.me/static/open/baemail.js"></script>
    </head>
    <body>
        <section>
            <h1>METANET.ICU DEMO</h1>
            <p>Buy something with a receipt</p>
            <div id="user"></div>
        </section>
        <script>
            const userButton = document.getElementById('user')
            Baemail.user = {}
            // Your app will probably have a user paymail already, if not then you can use this to grab it from MoneyButton.
            const setPaymailButton = () => {
                moneyButton.render(userButton, {
                    label: 'Set Paymail',
                    cryptoOperations: [
                        {
                            name: 'myPaymail',
                            method: 'paymail'
                        }
                    ],
                    onCryptoOperations: (cryptoOperations) => {
                        Baemail.user.paymail = cryptoOperations[0].value
                        sendBaemailButton()
                    }
                })
            }

            // This will purchase whatever you're selling, and send a Baemail from your app to your app's paymail and the user's paymail.
            const sendBaemailButton = async () => {
                Baemail.service = {}
                Baemail.service.paymail = '<<<<< YOUR PAYMAIL >>>>>'
                if (Baemail.user.paymail) {
                    await Baemail.fromString('This is a receipt, thanks for your purchase.', 0.05)
                    moneyButton.render(userButton, {
                        outputs: [{
                            script: bsv.Script.buildSafeDataOut(['Some Custom', 'App Data']).toASM(), // add your own OP_RETURN data here
                            amount: '0.00',
                            currency: 'USD'
                        }, ...Baemail.outputs ], // This spread object adds the Baemail Payments
                        cryptoOperations: [ ...Baemail.cryptoOperations ], // This spread object adds the Baemail Message
                        buttonData: 'Your App Data',
                        label: 'Pay & Bae' })
                } else {
                    setPaymailButton()
                }
            }
            setPaymailButton()
        </script>
    </body>
</html>
```
