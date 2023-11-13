const express = require("express") //importando express
const app = express(); //Importando um metodo do express
const morgan = require("morgan"); // Importando o morgan (mostrar as requisições no console)

//importando os arquivos das rotas
const rotaReceita = require("./routes/receita")
const rotaUsuario = require("./routes/usuario");
const rotaIngrediente = require("./routes/ingrediente")
const rotaProcedimento = require("./routes/procedimento")

app.use(morgan("dev")) // Irá dar um feedback de todos os requerimentos que ocorreram
app.use(express.urlencoded({ extended: false })) //Pode utiilzar parametros na url
app.use(express.json()) //Utilização de JSON


//Configurando o header Cabeçario
app.use((req,res,next)=>{
        res.header("Access-Control-Allow-Origin","*");//Permitir qualquer usuario
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
        if(req.method === "OPTIONS"){
            res.header("Access-Control-Allow-Methods","PUT,POST,PATCH,DELETE,GET");
            return res.status(200).send({});
        }
        
        next();
    })

  
   
//Criando as rotas
app.use("/recipe",rotaReceita)
app.use("/ingredient",rotaIngrediente)
app.use("/proceeding",rotaProcedimento)
app.use("/user",rotaUsuario)

//Não foi possivel localizar a rota enviada (Cria um novo erro e envia para o proximo)
app.use((req,res,next)=>{
    const erro = new Error("Não encontrado");
    erro.status = 404;
    next(erro)
})
//Apresenta o erro 
app.use((error,req,res,next)=>{
    res.status(error.status || 500)
    return res.send({
        erro:{
            mensagem: error.message
        }
    })
})

module.exports = app; 