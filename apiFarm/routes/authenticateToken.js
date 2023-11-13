const express = require("express");
const jwt = require("jsonwebtoken");

const SECRET_KEY = "keyApiFarm"

function authenticateToken(req,res,next){
    const token = req.header("Authorization");
    if (!token) return res.status(401).json({ message: 'Token não fornecido' });

    jwt.verify(token,SECRET_KEY,(err,user)=>{
        if (err) return res.status(403).json({ message: 'Token inválido' });
       console.log(req.user)
        //const userName = user.nome;
    
        req.user = user; // Define o usuário autenticado na requisição
        next();
       
    })
    
}

module.exports = authenticateToken;