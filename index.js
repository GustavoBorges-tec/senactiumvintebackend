// importação do módulo express para gerenciar o servidor
//de aplicação em node
const express = require("express");
//importação do módulo do cors para nos ajudar no
//trato com protocolos de requisição diferentes, tais
//como: http; https; file; ftp
const cors = require("cors");
//importação do módulo do mysql
const mysql = require("mysql");
//importação do módulo do jsonwebtoke para nos ajudar
//a trabalhar com seção segura
const jwt = require("jsonwebtoken");
//para criptografar as senhas será utilizado o bcrypt
//vamos importas o módulo
const bcrypt = require("bcrypt");
const { json } = require("express");

//Criando uma instância do servidro para carregá-lo
//faremos isso usando a constante app
const app = express();

//configurar o servidor express para aceitar dados em 
//formato json.
app.use(express.json());

//configurar o servidor para lidar com as requisições
// de várias origens. Para isso iremos usar o cors
app.use(cors());

//Configuração para comunicação com o banco de dados
const con = mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"123@senac",
    database:"ti0120",
    port:"3306"
});

// executar a conexão com o banco de dados
con.connect((erro)=>{
    if(erro){
        console.error(`Erro ao tentar carregar o servidor de banco de dados ->${erro}`);
        return;
    }
    console.log(`Servidor de banco de dados conectado -> ${con.threadId}`)
});

// Vamos criar as rotas com os endpoints para realizar o gerenciamento
// dos dados dos clientes

app.get("/api/cliente/listar",(req,res)=>{
    //vamos consultar os clientes cadastrados em banco e retornar os dados
    con.query("Select * from tbcliente",(erro,result)=>{
        if(erro){
            return res.status(400).send({output:`Erro ao tentar carregar dados->${erro}`});
        }
        res.status(200).send({output:result});
    });
});

app.get("/api/cliente/listar/:id",(req,res)=>{
    con.query("Select * from tbcliente where idcliente=?",[req.params.id],(erro,result)=>{
        if(erro){
            return res.status(400).send({output:`Erro ao tentar localizar o cliente->${erro}`});
        }
        res.status(200).send({output:result});
    });
});

app.post("/api/cliente/cadastro",(req,res)=>{

    bcrypt.hash(req.body.senha,10,(erro,result)=>{
        if(erro){
            return res.status(503).send({output:`Erro interno ao gerar a senha ->${erro}`});
        }
        req.body.senha = result;

    con.query("INSERT INTO tbcliente set ?",[req.body],(erro,result)=>{
        if(erro){
            return res.status(400).send({output:`Erro ao tentar cadastrar -> ${erro}`});
        }
        res.status(201).send({output:`Cadastro realizado`, payload:result});
       });
    });
});

app.post("/api/cliente/login",(req,res)=>{
    const us = req.body.usuario;
    const sh = req.body.senha;


    console.log(`Usuario envaido -> ${us}`);

    con.query("Select * from tbcliente where usuario=?",[us],(erro,result)=>{
        if(erro){
            return res.status(400).send({output:`Erro ao tentar logar -> ${erro}`})
        }
        if(!result){
            return res.status(404).send({output:"Usuário não localizado"});
        }

        console.log(`Dados do banco ${result.senha}`)

        bcrypt.compare(sh,result[0].senha,(erro,igual)=>{
            if(erro){
                return res.status(503).send({output:`Erro interno->${erro}`});
            }
            if(!igual){
                return res.status(400).send({output:`Sua senha está incorreta`});
            }
            const toke = criarToken(result[0].idcliente,result[0].usuario,result[0].email);

            res.status(200).send({output:`Logado`,payload:result,token:token});
        });
    });
});
app.put("/api/cliente/atualizar/:id", verificar,(req,res)=>{
    con.query("Update tbcliente set ? where idcliente=?",[req.body,req.params.id],(erro,result)=>{
        if(erro){
            return res.status(400).send({output:`Erro ao tentar atualizar -> ${erro}`});
        }
        res.status(200).send({output:`Dados atualizados`,payload:result});
    });
});

app.delete("/api/cliente/apagar:id",(req,res)=>{
    con.query("Delete from tbcliente where idcliente=?",[req.params.id],(erro,result)=>{
        if(erro){
            return res.status(400).send({output:`Erro ao tentar apagar->${erro}`});
        }
        res.status(204).send({});
    });
});


function verificar(req,res,next){

    const token_enviado = req.headers.token;

    if(!token_enviado){
        return res.status(401).send({output:`Token não existe. 
        Você não tem autorização para acessar esta página`})
    }
    jwt.verify(token_enviado,"senac",(erro,rs)=>{
        if(erro){
            return res.status(503).send({output:`Erro no processo de 
            verificação do token->${erro}`})
        }
        return next();
    })

}

function criarToken(id,usuario,email){
    return jwt.sign({id:id,usuario:usuario,email:email},"senac",{expiresIn:'2d'})
}

app.listen(3000,()=>console.log(`Servidor online em http://localhost:3000`));
