//----------------Requires----------------
const { Contenedor } = require("./managers/Contenedor");
const { generateProducts } = require("./managers/randomProducts");

const express = require("express");
const handlebars = require("express-handlebars");

//----------------Productos (faker.js) y Contenedores----------------
const productosRandoms = generateProducts();
const leerComentarios = new Contenedor("./files/chat.json");
const guardarComentarios = new Contenedor(
	"./files/mensajesSinNormalizar.json"
);

//----------------io y http----------------
const { Server: HttpServer } = require("http");
const { Server: IoServer } = require("socket.io");

const app = express();
const httpServer = new HttpServer(app);
const io = new IoServer(httpServer);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const port = process.env.PORT || 8080;

// ----------------Mensajes----------------

io.on("connection", async socket => {
	let mensajesChat = await leerComentarios.getAll();
	console.log("Se contectó un usuario");

	const text = {
		text: "ok",
		mensajesChat
	};

	socket.emit("mensaje-servidor", text);

	socket.on("mensaje-nuevo", async (msg, cb) => {
		mensajesChat.push(msg);
		const text = {
			text: "mensaje nuevo",
			mensajesChat
		};

		io.sockets.emit("mensaje-servidor", text);
		await guardarComentarios.save({
			author: msg.author,
			text: msg.text
		});
	});
});

// ----------------Mensajes cambios por json----------------
app.get("/api/mensajes/:id", async (req, res) => {
	const { id } = req.params;
	const productoById = await productos.getById(id);
	productoById
		? res.json(productoById)
		: res.json({ error: "Producto no encontrado" });
});

app.put("/api/mensajes/:id", async (req, res) => {
	const { id } = req.params;
	const respuesta = await guardarComentarios.updateById(id, req.body);
	res.json(respuesta);
});

app.delete("/api/mensajes/:id", async (req, res) => {
	const { id } = req.params;
	res.json(await guardarComentarios.deleteById(id));
});

app.delete("/api/texts", async (req, res) => {
	res.json(await guardarComentarios.deleteAll());

});

// ----------------Render handlebars ----------------

app.set("view engine", "hbs");
app.set("views", "./views/layouts");

app.use(express.static("public"));

app.engine(
	"hbs",
	handlebars.engine({
		extname: ".hbs",
		defaultLayout: "",
		layoutsDir: "",
		partialsDir: __dirname + "/views/partials"
	})
);

// ----------------Productos----------------
app.get("/api/productos-test", async (req, res) => {
	const producto = await productosRandoms;
	res.render("productos", {
		list: producto,
		listExist: true,
		producto: true
	});
});

app.get("/", async (req, res) => {
	const producto = await productosRandoms;
	res.render("index", {
		titulo: "Productos de Crud",
		list: producto,
		listExist: true,
		producto: true
	});
});

//----------------Por si el server tiene errores o se hostea correctamente ----------------
httpServer.listen(port, err => {
	if (err) throw new Error(`Error al iniciar el servidor: ${err}`);
	console.log(`Server is running on port ${port}`);
});