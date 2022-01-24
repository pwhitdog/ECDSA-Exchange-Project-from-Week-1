const express = require('express');
const app = express();
const cors = require('cors');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const port = 3042;

// localhost can have cross origin errors
// depending on the browser you use!
app.use(cors());
app.use(express.json());

const balances = []

for(let i = 0; i < 10; i++) {
  const key = ec.genKeyPair();
  const privateKey = key.getPrivate().toString()
  const publicKey = key.getPublic().encode('hex');
  const value = Math.floor(Math.random() * 101);
  balances.push({privateKey, publicKey, value})
}

balances.forEach(b => {
  console.log(JSON.stringify(b))
});

app.get('/balance/:address', (req, res) => {
  const {address} = req.params;
  const balance = balances.filter(b => b.privateKey === address );
  if(!balance.length) {
    return res.status(400).json({status: 400, message: "Your wallet must be in the system", balance: 0})
  }
  res.send({ balance: balance[0].value });
});

app.post('/send', (req, res) => {
  const {sender, recipient, amount} = req.body;
  let hasEnough = 0
  let validSender = false
  let balance
  balances.forEach(b => {
    if(b.privateKey === sender) {
      if (b.value < amount) {
         hasEnough = b.value
          return false
      }
      b.value -= +amount;
      balance = b.value
      validSender = true
    }    
  }) 
  if (hasEnough) return res.status(400).json({status: 400, message: "You can't send more than you have", balance: hasEnough})
  if(!validSender) {
    return res.status(400).json({status: 400, message: "Your wallet must be in the system"})
  }
  balances.forEach(b => {
    if(b.publicKey === recipient) {
      b.value += +amount
    }
  })
  res.send({ balance });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});
