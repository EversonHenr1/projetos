const http = require("http"); // importar o protocolo http
const app = require("./app") //importar o arquivo app.js
const port = process.env.PORT || 4000; // escolher a porta do host ou a porta que queremos
const server = http.createServer(app); // Criar o servidor utilizando as rotas do app.js
server.listen(port) //Ficar verificando e mantendo aberto nosso servidor