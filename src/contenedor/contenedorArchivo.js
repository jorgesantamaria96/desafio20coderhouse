const { promises: fs } = require("fs");
const configs = require("../configs.js");

class ContenedorArchivo {
  constructor(nombreArchivo) {
    this.nombreArchivo = `${configs.fileSystem.path}/${nombreArchivo}.txt`;
    this.sampleName = nombreArchivo;
    this.contador = 0;
  }

  static contadorGlobal = 0;

  async save(objToSaved) {
    const objetos = await this.getAll();

    if (this.sampleName !== "chat") {
      this.contador =
        objetos.length === 0 ? 1 : objetos[objetos.length - 1].id + 1;
      let saved = {
        ...objToSaved,
        id: this.contador,
      };
      objetos.push(saved);
    } else {
      objetos.push(objToSaved);
    }

    try {
      await fs.writeFile(this.nombreArchivo, JSON.stringify(objetos, null, 2));

      const objetosFinal = await this.getAll();
      ContenedorArchivo.contadorGlobal++;

      console.log(objetosFinal);
    } catch (error) {
      throw new Error(`No se pudo guardar el archivo. El error es: ${error}`);
    }
  }

  async getById(id) {
    const resultJson = await this.getAll();

    if (resultJson.length > 0) {
      const objetoBuscado = resultJson.filter((elem) => elem.id === id)[0];

      return objetoBuscado ? objetoBuscado : null;
    } else {
      throw new Error(
        `El archivo ${this.nombreArchivo}.txt se encuentra vacío.`
      );
    }
  }

  async getAll() {
    try {
      const result = await fs.readFile(this.nombreArchivo, "utf-8");
      return JSON.parse(result);
    } catch (error) {
      return [];
    }
  }

  async deleteById(id) {
    const resultJson = await this.getAll();

    if (resultJson.length > 0) {
      const indexOfObjectWhitId = resultJson.findIndex((obj) => obj.id == id);

      resultJson.splice(indexOfObjectWhitId, 1);

      try {
        await fs.writeFile(
          this.nombreArchivo,
          JSON.stringify(resultJson, null, 2)
        );
        const objetosFinal = await this.getAll();

        console.log(objetosFinal);
      } catch (error) {
        throw new Error(error);
      }
    } else {
      throw new Error(`El archivo ${this.nombreArchivo} se encuentra vacío.`);
    }
  }

  async editById(id, newObj) {
    const resultJson = await this.getAll();

    if (resultJson.length > 0) {
      const indexOfObjectWhitId = resultJson.findIndex((obj) => obj.id == id);

      if (resultJson[indexOfObjectWhitId]) {
        resultJson[indexOfObjectWhitId] = newObj;

        await fs.writeFile(
          this.nombreArchivo,
          JSON.stringify(resultJson, null, 2)
        );
      } else {
        throw new Error(`No existe un objeto con el id ${id}.`);
      }
    } else {
      throw new Error(
        `El archivo ${this.nombreArchivo}.txt se encuentra vacío.`
      );
    }
  }

  deleteAll = async () => {
    await fs.writeFile(this.nombreArchivo, JSON.stringify([], null, 2));
  };
}

module.exports = ContenedorArchivo;
