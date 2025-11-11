/**
 * @swagger
 * tags:
 *   name: Usuários
 *   description: Endpoints relacionados a usuários
 */

/**
 * @swagger
 * /usuarios/login:
 *   post:
 *     summary: Realizar login de usuário
 *     description: Autentica um usuário pelo RM e senha. Retorna os dados do usuário se as credenciais forem válidas.
 *     tags: [Usuários]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rm:
 *                 type: string
 *                 example: "12345"
 *               senha:
 *                 type: string
 *                 example: "1234"
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 usuario:
 *                   type: object
 *                   properties:
 *                     id_usuarios:
 *                       type: integer
 *                       example: 1
 *                     nome:
 *                       type: string
 *                       example: João Silva
 *                     rm:
 *                       type: string
 *                       example: "12345"
 *                     nivel_usuario:
 *                       type: string
 *                       example: aluno
 *                     turma:
 *                       type: string
 *                       example: "2º DS"
 *                     email:
 *                       type: string
 *                       example: joao@email.com
 *       401:
 *         description: Credenciais inválidas
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /usuarios/listarTodos:
 *   get:
 *     summary: Lista todos os usuários
 *     description: Retorna todos os usuários cadastrados no sistema, incluindo id, nome, email, rm, nível e turma.
 *     tags:
 *       - Usuários
 *     responses:
 *       200:
 *         description: Lista de usuários retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 usuario:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id_usuarios:
 *                         type: integer
 *                         example: 1
 *                       nome:
 *                         type: string
 *                         example: João Silva
 *                       email:
 *                         type: string
 *                         example: joao@email.com
 *                       rm:
 *                         type: string
 *                         example: 12345
 *                       nivel_usuario:
 *                         type: string
 *                         example: aluno
 *                       turma:
 *                         type: string
 *                         example: 2A
 *       500:
 *         description: Erro interno no servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Erro ao acessar o banco de dados
 */


const express = require("express");
const router = express.Router();
const { login, listarTodos } = require("../controllers/usuariosController");

router.post("/login", login);
router.get("/listarTodos", listarTodos);

module.exports = router;