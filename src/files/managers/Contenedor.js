const fs = require('fs');

class Contenedor {
	constructor(route) {
		this.route = route;
	}

	async readFileFunction(route) {
		let file = await fs.promises.readFile(route, "utf8");
		let fileParsed = await JSON.parse(file);
		return fileParsed;
	}

	async save(obj) {
		try {
			let dataFile = await this.readFileFunction(this.route);
			if (dataFile.length) {
				// [].length = 0 -> false
				await fs.promises.writeFile(
					this.route,
					JSON.stringify([...dataFile, { ...obj }], null, 2)
				);
				// ... spread operator -> copia el array y lo agrega al final
			} else {
				await fs.promises.writeFile(
					this.route,
					JSON.stringify([{ ...obj }], null, 2)
				);
				console.log(`El archivo tiene id: ${dataFile.length + 1}`);
			}
		} catch (error) {
			console.log("error de escritura", error);
		}
	}

	async updateById(obj) {
		try {
			let data = await this.readFileFunction(this.ruta);
			const objIndex = dataArch.findIndex(prod => prod.id === obj.id);
			if (objIndex !== -1) {
				// existe
				data[objIndex] = obj;
				await fs.promises.writeFile(
					this.route,
					JSON.stringify(data, null, 2)
				);
				return { message: "producto actualizado" };
			} else {
				// no existe
				return { error: "producto no encontrado" };
			}
		} catch (error) {
			console.log("error de lectura", error);
		}
	}

	// traer producto por id
	async getById(id) {
		try {
			const dataFile = await this.readFileFunction(this.route);
			const product = dataFile.find(prod => prod.id === id);
			if (product) {
				return product;
			} else {
				return { error: "producto no encontrado" };
			}
		} catch (error) {
			console.log("no existe el id", error);
		}
	}

	//traer todos los productos
	async getAll() {
		try {
			const dataFile = await this.readFileFunction(this.route);
			if (dataFile.length) {
				//console.log(dataArchParse);
				return dataFile;
			} else {
				console.log("No hay productos");
			}
		} catch (error) {
			console.log("error de lectura", error);
		}
	}
	// eliminar producto por id
	async deleteById(id) {
		try {
			const dataFile = await this.readFileFunction(this.route);
			let product = dataFile.find(prod => prod.id === id);
			if (product) {
				const dataFileParseFiltered = dataFile.filter(
					prod => prod.id !== id
				);
				await fs.promises.writeFile(
					this.ruta,
					JSON.stringify(dataFileParseFiltered, null, 2),
					"utf-8"
				);
				console.log("Producto eliminado");
			} else {
				console.log("No se encontró producto");
			}
		} catch (error) {
			console.log("No existe el id", error);
		}
	}
}

module.exports = { Contenedor };