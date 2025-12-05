const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
router.get('/',async (req,res)=>{
  const token =req.header('Authorization').replace('Bearer','');
  if(!token){
      return res.status(401).send('You are not authorized');
  }
  try{
      const decoded = jwt.verify(token, 'MySecrateKey');
      res.send('You are authorized');
  }catch(err){
      res.status(401).send('You are not authorized');
  }
  
});

router.get('/me',async (req,res)=>{
  const token =req.header('Authorization').replace('Bearer','');
  const data =jwt.verify(token,'MySecrateKey');
  //res.send(data);
  const user =await User.findById(data.userId);
  res.send(user);
})

module.exports = router;
