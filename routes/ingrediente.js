const express = require("express")
const router = express.Router();
const mysql = require("../mysql").pool

//Consultar todos os ingredientes
router.get("/",(req,res,next)=>{
    mysql.getConnection((error,conn)=>{
        mostrarErro(error);
        conn.query("SELECT * FROM ingredientes;",
        (error,resultado,fields)=>{
            conn.release()
            mostrarErro(error);
            return res.status(200).send({
                response:resultado
            })
        })
    })
})

//Consultar registros de ingredientes de acordo com id da receita
router.get("/:id_recipe", (req, res, next) => {
    const id = parseInt(req.params.id_recipe); // id da receita
    const arrayIds = []; //Array que guardará os ids dos ingredientes
    let resultadoFinal = []; //Array que apresentará o resultado final
    let dataIngredient = [];
    
    mysql.getConnection((error,conn) => {
        mostrarErro(error);
        conn.beginTransaction((error) => {
            mostrarErro(error);
            conn.query("SELECT *  FROM  registros_ingredientes WHERE id_receitas = ?;",
                [id],
                (error, resultado, fields) => {
                    if (error) { //Primeiro roolback caso não seja efetuado a query
                        conn.rollback(() => {
                            mostrarErro(error);
                            conn.release();
                            res.status(500).send({ message: "Erro na consulta de registros_ingredientes" });
                        });
                        return;
                    }

                    resultadoFinal.push(resultado) //Irá Armazena o resultado a primeira query na variavel resultadoFinal
                    
                    resultado.forEach((e) => { //Irá armazena os resultados com ids dos ingredientes dentro da arrayIds
                        arrayIds.push(e.id_ingrediente);
                    });

                    arrayIds.forEach((id) => { //Irá armazenar "nome","medida","id" dentro do dataIngredient(intermediador)
                        conn.query("SELECT nome,medida FROM ingredientes WHERE id_ingredientes = ?;",
                            [id],
                            (error, resultado, fields) => {
                                if (error) {
                                    conn.rollback(() => {
                                        mostrarErro(error);
                                        conn.release();
                                        res.status(500).send({ message: "Erro na consulta de ingrediente" });
                                    });
                                    return;
                                }
                                resultado.forEach((data)=>{
                                    dataIngredient.push(data)
                                }) 
                            }
                        );
                    });
                    conn.commit((error) => { //Se não tiver haviado erro
                        conn.release();
                        if (error) {
                            conn.rollback(() => {
                                mostrarErro(error);
                                conn.release();
                                res.status(500).send({ message: "Erro ao confirmar a transação" });
                            });
                            return;
                        }
                        resultadoFinal.map((e)=>{ //Adiciona dentro do resultado final as informações de "nome", "medida"
                            e.forEach((a,i)=>{
                                a.nome = dataIngredient[i].nome
                                a.medida= dataIngredient[i].medida
                            })
                        });
                        res.status(201).send({ message: "Consultas bem-sucedidas", response: resultadoFinal});
                    });
                }
            );
        });
    });
});
    
//Adionar Registro de Ingredientes pelo paratro
router.post("/:id_receitas",(req,res,next)=>{
    const arrayIngredientes = req.body.ingredientes; // Array que fazerá todos os POST
    const arrayIds = []; //Array para armazenar os Ids

    mysql.getConnection((error,conn)=>{
        mostrarErro(error);
        conn.beginTransaction((error)=>{
            mostrarErro(error);
            for(const item of arrayIngredientes){
                conn.query(
                    "INSERT INTO registros_ingredientes (quantidade,id_receitas,id_ingrediente) VALUES (?,?,?)",
                    [item.quantidade, parseInt(req.params.id_receitas) ,item.id_ingrediente],
                    (error,resultado,fields)=>{
                        if(error){
                            conn.rollback(()=>{
                                throw error;
                            })
                        }
                        arrayIds.push(resultado.insertId)
                    }
                )
            }
            conn.commit((error)=>{
                if(error){
                    conn.rollback(() => {
                        throw error;
                    });
                }
                res.status(201).send({ message: "Registros de ingredientes bem sucedido", ids: arrayIds});
                conn.release();
            })
        })
    })
})

//Adionar Registro de Ingredientes
router.post("/",(req,res,next)=>{
    const arrayIngredientes = req.body.ingredientes; // Array que fazerá todos os POST
    const arrayIds = []; //Array para armazenar os Ids

    mysql.getConnection((error,conn)=>{
        mostrarErro(error);
        conn.beginTransaction((error)=>{
            mostrarErro(error);
            for(const item of arrayIngredientes){
                conn.query(
                    "INSERT INTO registros_ingredientes (quantidade,id_receitas,id_ingrediente) VALUES (?,?,?)",
                    [item.quantidade, item.id_receita,item.id_ingrediente],
                    (error,resultado,fields)=>{
                        if(error){
                            conn.rollback(()=>{
                                throw error;
                            })
                        }
                        arrayIds.push(resultado.insertId)
                    }
                )
            }
            conn.commit((error)=>{
                if(error){
                    conn.rollback(() => {
                        throw error;
                    });
                }
                res.status(201).send({ message: "Registros de ingredientes bem sucedido", ids: arrayIds});
                conn.release();
            })
        })
    })
})


//Alterar um registro de ingrediente
router.put("/",(req,res,next)=>{
    const id =req.body.id_registros; // pega o id 
    const ingrediente = req.body.id_ingredientes; // pega o ingrediente
    const quantidade = req.body.quantidade; //Pega a quantidade
    let arrayValue;
    let query; //Query para o banco
    if(ingrediente && quantidade){
        query = "UPDATE registros_ingredientes SET id_ingrediente = ?, quantidade= ? WHERE id_registros = ?;"
        arrayValue = [ingrediente,quantidade,id]
    }else if(ingrediente){
        query = "UPDATE registros_ingredientes SET id_ingrediente = ? WHERE id_registros = ?;"
        arrayValue = [ingrediente,id]
    }else if(quantidade){
        query = "UPDATE registros_ingredientes SET quantidade= ? WHERE id_registros = ?;"
        arrayValue = [quantidade,id]
    }
    mysql.getConnection((error,conn)=>{
        mostrarErro(error);
        conn.query(
            query,
            arrayValue,
            (error,resultado,field)=>{
                mostrarErro(error);
                return res.status(202).send({
                    mensage:`Registro(s) Alterado com sucesso!`
                })
            })
    })
})

//Excluir uma receita
router.delete("/",(req,res,next)=>{
    mysql.getConnection((error,conn)=>{
        mostrarErro(error);
        conn.query("DELETE FROM registros_ingredientes WHERE id_registros = ?",
        [req.body.id],
        (error,resultado,fields)=>{
            conn.release()
            mostrarErro(error);
            return res.status(203).send({
                mensager:"Ingredientes excluido com sucesso",
                id:req.body.id
            })
        })
    })
})

//Excluir uma receita
router.delete("/:id_recipes",(req,res,next)=>{
    mysql.getConnection((error,conn)=>{
        mostrarErro(error);
        conn.query("DELETE FROM registros_ingredientes WHERE id_receitas = ?",
        [parseInt(req.params.id_recipes)],
        (error,resultado,fields)=>{
            conn.release()
            mostrarErro(error);
            return res.status(203).send({
                mensager:"Ingredientes excluido com sucesso"
            })
        })
    })
})

function mostrarErro(error){
    if(error){return res.status(500).send({error:error})}
}


module.exports = router;