# Open Baemail
Baemail Protocol, send from anywhere. Requires merchant registration for just now.

Please register here --> [Registrations & Demo](https://baemail.me/static/open/baemailExternal.html)

# Baemail
Check out regular Baemail here --> [baemail.me](https://baemail.me)

# Example Integration
``` html
<!DOCTYPE html>
<html>
    <head>
        <title><<<<< YOUR APP >>>>></title>
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
            Baemail.service = {}
            Baemail.user = {}

            const blocks = [
                {'type': 'paragraph', 'data':
                        {'text': 'Hello,'}
                },
                {'type': 'paragraph', 'data':
                        {'text': 'This is your receipt example.'}
                },
                {'type': 'paragraph', 'data':
                        {'text': 'Thank you for your purchase of:'}},
                {'type': 'list', 'data':
                        { 'style': 'ordered', 'items': ['Something', 'Else', 'A thing'] }
                },
                {'type': 'paragraph', 'data':
                        {'text': 'TOTAL = £300'}},
                {'type': 'image',
                    'data':
                        {
                            'url': 'https://metanet.icu/wp-content/uploads/2019/07/cropped-ICU-Logo4.png',
                            'withBorder': false,
                            'withBackground': false,
                            'stretched': false
                        }
                },
                {'type': 'paragraph', 'data':
                        {'text': 'Or something,'}},
                {'type': 'paragraph', 'data':
                        {'text': '- Metanet ICU'}
                }
            ]
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
                    await Baemail.fromBlocks(blocks, 0.05)
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
