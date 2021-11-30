create database ti0120;
use ti0120;

create table tbcliente(
	idcliente bigint auto_increment primary key,
    nomecliente varchar(100) not null,
    email varchar(100) not null unique,
    telefone varchar(20) not null,
    usuario varchar(30) not null unique,
    senha varchar(200) not null
)engine InnoDb character set="utf8mb4";

insert into tbcliente set 
nomecliente="Pedro",
email="pedro@terra.com.br",
telefone="11-99696-9996",
usuario="pedro",
senha="123";
select * from tbcliente;