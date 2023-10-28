const express = require("express")
const router = express.Router();
const mysql = require("../mysql").pool

//Consultar todos os registro de procedimentos
router.get("/",(req,res,next)=>{
    mysql.getConnection((error,conn)=>{
        mostrarErro(error);
        conn.query("SELECT * FROM procedimentos ",
        (error,resultado,fields)=>{
            conn.release()
            mostrarErro(error);
            return res.status(200).send({
                response:resultado
            })
        })
    })

})

//Consultar somente 1 procedimentos
router.get("/:id_procedimentos",(req,res,next)=>{
    const id = parseInt(req.params.id_procedimentos);
    mysql.getConnection((error,conn)=>{
        mostrarErro(error);
        conn.query("SELECT *  FROM  procedimentos WHERE id_receitas = ?;",
        [id],(error,resultado,fields)=>{
            conn.release();
            mostrarErro(error);
            return res.status(201).send({
                response:resultado
            })
        })
    })
}) 

//Adicionar um procedimento
router.post("/",(req,res,next)=>{
    const arrayProcedimento = req.body.procedimentos //Array com todos os procedimento
    const idsInseridos = [] // Array para armazenar os ids
    mysql.getConnection((error,conn)=>{
        mostrarErro(error);
        conn.beginTransaction((error)=>{
            mostrarErro(error);
            for(const item of arrayProcedimento){
                conn.query(
                    "INSERT INTO procedimentos (body,id_receitas) VALUES (?,?)",
                    [item.body,item.id_receitas],
                    (error,resultado,fields)=>{
                        if(error){
                            conn.rollback(()=>{
                                throw error;
                            })
                        }
                        idsInseridos.push(resultado.insertId)
                    }
                )
            }
            conn.commit((error)=>{
                if(error){
                    conn.rollback(() => {
                        throw error;
                    });
                }
                res.status(201).send({message: "Inserções em lote bem-sucedidas", ids:idsInseridos});
                conn.release();
            })
        })
    })
})

//Adicionar um procedimento
router.post("/:id_recipe",(req,res,next)=>{
    const arrayProcedimento = req.body.procedimentos //Array com todos os procedimento
    const idsInseridos = [] // Array para armazenar os ids
    mysql.getConnection((error,conn)=>{
        mostrarErro(error);
        conn.beginTransaction((error)=>{
            mostrarErro(error);
            for(const item of arrayProcedimento){
                conn.query(
                    "INSERT INTO procedimentos (body,id_receitas) VALUES (?,?)",
                    [item.body,parseInt(req.params.id_recipe)],
                    (error,resultado,fields)=>{
                        if(error){
                            conn.rollback(()=>{
                                throw error;
                            })
                        }
                        idsInseridos.push(resultado.insertId)
                    }
                )
            }
            conn.commit((error)=>{
                if(error){
                    conn.rollback(() => {
                        throw error;
                    });
                }
                res.status(201).send({message: "Inserções em lote bem-sucedidas", ids:idsInseridos});
                conn.release();
            })
        })
    })
})


//Alterar um procedimento
router.put("/",(req,res,next)=>{
    mysql.getConnection((error,conn)=>{
        mostrarErro(error);
        conn.query(
            "UPDATE procedimentos SET body = ? WHERE id_procedimentos = ?;",
            [req.body.body,req.body.id],
            (error,resultado,field)=>{
                mostrarErro(error);
                return res.status(202).send({
                    mensage:`Procedimento Alterado com sucesso!`
                })
            })
    })
})

//Excluir uma procedimento
router.delete("/",(req,res,next)=>{
    mysql.getConnection((error,conn)=>{
        mostrarErro(error);
        conn.query("DELETE FROM procedimentos WHERE id_procedimentos = ?;",
        [req.body.id],
        (error,resultado,fields)=>{
            conn.release()
            mostrarErro(error);
            return res.status(203).send({
                mensager:"Dado excluido com sucesso",
                id:req.body.id
            })
        })
    })
})

//Excluir procedimentos de acordo com id_receitas
router.delete("/:id_recipes",(req,res,next)=>{
    mysql.getConnection((error,conn)=>{
        mostrarErro(error);
        conn.query("DELETE FROM procedimentos WHERE id_receitas = ?;",
        [parseInt(req.params.id_recipes)],
        (error,resultado,fields)=>{
            conn.release()
            mostrarErro(error);
            return res.status(203).send({
                mensager:"Dado excluido com sucesso",
            })
        })
    })
})

function mostrarErro(error){
    if(error){return res.status(500).send({error:error})}
}

module.exports = router;